import { type JudgeFn, type ModelRef } from '@ngs/engine';
import { type Generate } from './llm.js';
export interface JudgeFnOptions {
    generate: Generate;
    /** 審査モデル（回答席のいずれとも別系統にすること）。 */
    judgeModel: ModelRef;
    /** 既定 30 秒。 */
    timeoutMs?: number;
}
/**
 * ブラインド審査用の JudgeFn を作る。
 * 応答は parseJudgeResponse で構造化裁定へ。失敗時は全ラベル delta 0 にデグレードする。
 */
export declare function makeJudgeFn(opts: JudgeFnOptions): JudgeFn;
