import { type AnswerFn } from '@ngs/engine';
import { type Generate } from './llm.js';
export interface AnswerFnOptions {
    generate: Generate;
    /** 既定 30 秒。 */
    timeoutMs?: number;
}
/**
 * 回答席用の AnswerFn を作る。エラー・タイムアウト・空応答は「失敗結果」に丸める
 * （例外を投げず engine が席単位でパス処理できるようにする）。
 */
export declare function makeAnswerFn(opts: AnswerFnOptions): AnswerFn;
