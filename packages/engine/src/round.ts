import { anonymize, identityOrder } from './anonymize.js';
import type { Ledger } from './ledger.js';
import type { Answer, AnswerFn, JudgeFn, Seat, Topic, Verdict } from './types.js';

export interface RoundConfig {
  topic: Topic;
  seats: Seat[];
  answer: AnswerFn;
  judge: JudgeFn;
  ledger: Ledger;
  /** 提示順の順列生成（既定は恒等順）。位置バイアス回避のためシャッフルを注入できる。 */
  order?: (n: number) => number[];
}

export interface RoundResult {
  topic: Topic;
  /** 全席ぶんの回答（パスを含む）。 */
  answers: Answer[];
  /** 内部 seatId へ復元済みの裁定。 */
  verdicts: Verdict[];
  /** ラウンド終了時点の台帳スナップショット。 */
  ledger: Record<string, number>;
}

/**
 * 大喜利 1 ラウンドを実行する。
 * 回答収集（並列）→ 匿名化（順序シャッフル可）→ ブラインド審査 → 台帳反映。
 * いずれかの席が失敗（値 or 例外）した場合はその席を「パス」として記録し、番組は止めない。
 */
export async function runRound(config: RoundConfig): Promise<RoundResult> {
  const { topic, seats, answer, judge, ledger } = config;
  const order = config.order ?? identityOrder;

  // 1. 回答を並列収集（失敗・例外はパスに丸める）
  const answers: Answer[] = await Promise.all(
    seats.map(async (seat): Promise<Answer> => {
      const model = seat.model.model;
      try {
        const res = await answer(topic, seat);
        if (res.ok) return { seatId: seat.id, text: res.text, passed: false, model };
        return { seatId: seat.id, text: '', passed: true, model, passReason: res.reason };
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        return { seatId: seat.id, text: '', passed: true, model, passReason: reason };
      }
    }),
  );

  // 2. 生存回答のみを匿名化（順序シャッフル可）
  const live = answers.filter((a) => !a.passed).map((a) => ({ seatId: a.seatId, text: a.text }));
  const verdicts: Verdict[] = [];
  if (live.length > 0) {
    const { anonymized, labelToSeat } = anonymize(live, order(live.length));

    // 3. ブラインド審査
    const labeled = await judge(topic, anonymized);

    // 4. ラベル→seatId 復元のうえ台帳へ反映
    for (const v of labeled) {
      const seatId = labelToSeat.get(v.label);
      if (!seatId) continue; // 未知ラベルは無視
      const verdict: Verdict = { seatId, delta: v.delta, reason: v.reason };
      verdicts.push(verdict);
      ledger.apply(verdict);
    }
  }

  return { topic, answers, verdicts, ledger: ledger.snapshot() };
}
