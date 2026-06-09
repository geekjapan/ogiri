import { type AnswerFn, buildAnswerMessages } from '@ngs/engine';
import { type Generate, withTimeout } from './llm.js';

export interface AnswerFnOptions {
  generate: Generate;
  /** 既定 30 秒。 */
  timeoutMs?: number;
}

/**
 * 回答席用の AnswerFn を作る。エラー・タイムアウト・空応答は「失敗結果」に丸める
 * （例外を投げず engine が席単位でパス処理できるようにする）。
 */
export function makeAnswerFn(opts: AnswerFnOptions): AnswerFn {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  return async (topic, seat) => {
    try {
      const messages = buildAnswerMessages(seat.persona, topic);
      const text = await withTimeout(opts.generate(messages, seat.model), timeoutMs);
      const trimmed = text.trim();
      if (!trimmed) return { ok: false, reason: '空応答' };
      return { ok: true, text: trimmed };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  };
}
