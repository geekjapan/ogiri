import { Ledger } from './ledger.js';
import { type RoundConfig, type RoundResult, runRound } from './round.js';
import type { AnswerFn, JudgeFn, Seat, Topic } from './types.js';

export interface ShowConfig {
  /** 順序付きのお題列（消費は先頭から）。 */
  topics: Topic[];
  seats: Seat[];
  answer: AnswerFn;
  judge: JudgeFn;
  /** 終了条件: 最大ラウンド数 M。 */
  maxRounds: number;
  /** 終了条件: 賞品ライン N 枚。 */
  prizeThreshold: number;
  order?: RoundConfig['order'];
  /** ラウンド完了ごとに呼ばれる観測フック（TUI 中継用）。 */
  onRound?: (round: RoundResult, index: number) => void;
}

export interface ShowResult {
  rounds: RoundResult[];
  ledger: Record<string, number>;
  /** 賞品ライン到達席（空の場合あり）。 */
  winners: string[];
  endedReason: 'prize' | 'rounds';
}

/**
 * 番組（複数ラウンド）をヘッドレスで実行する。
 * 各ラウンド後に賞品ライン到達を判定し、到達 or お題/最大ラウンド消化で終了する。
 */
export async function runShow(config: ShowConfig): Promise<ShowResult> {
  const ledger = new Ledger(config.seats.map((s) => s.id));
  const rounds: RoundResult[] = [];
  const roundCount = Math.min(config.maxRounds, config.topics.length);

  let endedReason: ShowResult['endedReason'] = 'rounds';
  let winners: string[] = [];

  for (let i = 0; i < roundCount; i++) {
    const topic = config.topics[i] as Topic;
    const round = await runRound({
      topic,
      seats: config.seats,
      answer: config.answer,
      judge: config.judge,
      ledger,
      order: config.order,
    });
    rounds.push(round);
    config.onRound?.(round, i);

    const reached = ledger.reachedPrize(config.prizeThreshold);
    if (reached.length > 0) {
      endedReason = 'prize';
      winners = reached;
      break;
    }
  }

  return { rounds, ledger: ledger.snapshot(), winners, endedReason };
}

export type { AnswerFn, JudgeFn, Seat, Topic };
