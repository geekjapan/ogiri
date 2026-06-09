import {
  type AnswerFn,
  DEFAULT_ANSWER_BINDINGS,
  DEFAULT_JUDGE_BINDING,
  type JudgeFn,
  type Seat,
  buildSeats,
  getPersona,
} from '@ngs/engine';
import {
  type Generate,
  createSdkGenerate,
  makeAnswerFn,
  makeJudgeFn,
  providerAvailable,
} from '@ngs/providers';

export interface ShowWiring {
  answerSeats: Seat[];
  judgeSeat: Seat;
  answer: AnswerFn;
  judge: JudgeFn;
  /** seatId → 表示名。 */
  names: Map<string, string>;
  offline: boolean;
}

/** オフライン用のスタブ生成（API キー不要で番組を一周させる動作確認用）。 */
export function offlineGenerate(): Generate {
  const canned: Record<string, string[]> = {
    anthropic: ['それ、国会で言ったらニュースになるやつ', '答えはもう出てる。予算が無いだけ'],
    openai: ['たぶんね、みんな寝てると思う', 'えーっとね、それはお茶を濁す'],
    google: ['まかせとけ！…で、なんだっけ？', '当たった夢を見た。以上！'],
  };
  return async (messages, model) => {
    if (messages.system.includes('審査員')) {
      // user の「回答N: text」を抽出し、最長（がんばった）回答に +1
      const rows = [...messages.user.matchAll(/^(回答\d+):\s*(.*)$/gm)].map((m) => ({
        label: m[1] as string,
        len: (m[2] ?? '').length,
      }));
      const top = rows.reduce((a, b) => (b.len > a.len ? b : a), rows[0] ?? { label: '', len: -1 });
      const verdicts = rows.map((r) => ({
        label: r.label,
        delta: r.label === top.label ? 1 : 0,
        reason: r.label === top.label ? '一番ひねりがある' : '悪くない',
      }));
      return JSON.stringify({ verdicts });
    }
    const pool = canned[model.provider] ?? ['（無言）'];
    const pick = pool[messages.user.length % pool.length] as string;
    return pick;
  };
}

/**
 * engine + providers を配線して実行可能な番組設定を作る。
 * - キー未設定プロバイダの回答席は自動スキップ
 * - offline 指定時はスタブ生成（キー不要）。回答席は全プロバイダ有効扱い。
 */
export function buildShowWiring(opts: { offline: boolean; timeoutMs?: number }): ShowWiring {
  const generate = opts.offline ? offlineGenerate() : createSdkGenerate();
  const isAvailable = opts.offline ? () => true : providerAvailable();

  const answerSeats = buildSeats(DEFAULT_ANSWER_BINDINGS, isAvailable);
  const judgeSeat: Seat = {
    id: 'judge',
    persona: getPersona(DEFAULT_JUDGE_BINDING.personaId),
    model: DEFAULT_JUDGE_BINDING.model,
  };

  const answer = makeAnswerFn({ generate, timeoutMs: opts.timeoutMs });
  const judge = makeJudgeFn({ generate, judgeModel: judgeSeat.model, timeoutMs: opts.timeoutMs });

  const names = new Map(answerSeats.map((s) => [s.id, s.persona.name]));
  return { answerSeats, judgeSeat, answer, judge, names, offline: opts.offline };
}
