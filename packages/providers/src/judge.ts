import { type JudgeFn, type ModelRef, buildJudgeMessages, parseJudgeResponse } from '@ngs/engine';
import { type Generate, withTimeout } from './llm.js';

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
export function makeJudgeFn(opts: JudgeFnOptions): JudgeFn {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  return async (topic, answers) => {
    const labels = answers.map((a) => a.label);
    try {
      const messages = buildJudgeMessages(topic, answers);
      const text = await withTimeout(opts.generate(messages, opts.judgeModel), timeoutMs);
      return parseJudgeResponse(text, labels);
    } catch {
      return labels.map((label) => ({ label, delta: 0, reason: '審査失敗' }));
    }
  };
}
