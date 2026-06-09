import { type AnswerFn, type JudgeFn, type Seat } from '@ngs/engine';
import { type Generate } from '@ngs/providers';
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
export declare function offlineGenerate(): Generate;
/**
 * engine + providers を配線して実行可能な番組設定を作る。
 * - キー未設定プロバイダの回答席は自動スキップ
 * - offline 指定時はスタブ生成（キー不要）。回答席は全プロバイダ有効扱い。
 */
export declare function buildShowWiring(opts: {
    offline: boolean;
    timeoutMs?: number;
}): ShowWiring;
