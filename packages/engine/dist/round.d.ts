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
export declare function runRound(config: RoundConfig): Promise<RoundResult>;
