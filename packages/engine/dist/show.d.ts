import { type RoundConfig, type RoundResult } from './round.js';
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
export declare function runShow(config: ShowConfig): Promise<ShowResult>;
export type { AnswerFn, JudgeFn, Seat, Topic };
