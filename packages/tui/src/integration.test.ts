import {
  type AnswerFn,
  type JudgeFn,
  buildTranscript,
  rescoreTranscript,
  runShow,
  toTranscriptJson,
} from '@ngs/engine';
import { describe, expect, it } from 'vitest';
import { planTopics } from './topicplan.js';
import { buildShowWiring } from './wiring.js';

const topics = planTopics({ mode: 'random', rounds: 2 });

describe('結合: オフライン番組（複数プロバイダ混在）', () => {
  it('8.1 回答 3 席（anthropic/openai/google）で 1 番組を完走しトランスクリプトを得る', async () => {
    const w = buildShowWiring({ offline: true });
    expect(w.answerSeats.map((s) => s.model.provider)).toEqual(['anthropic', 'openai', 'google']);

    const result = await runShow({
      topics,
      seats: w.answerSeats,
      answer: w.answer,
      judge: w.judge,
      maxRounds: 2,
      prizeThreshold: 100,
    });
    expect(result.rounds).toHaveLength(2);

    const t = buildTranscript(result, w.answerSeats);
    expect(t.meta.answerCalls).toBe(6); // 3席 × 2ラウンド
    expect(toTranscriptJson(t)).not.toMatch(/api[_-]?key|sk-/i);
  });

  it('8.2 片肺故障（1 社が毎回失敗）でも番組は完走し、その席はパスになる', async () => {
    const w = buildShowWiring({ offline: true });
    // openai 席を意図的に失敗させる
    const flaky: AnswerFn = async (topic, seat) =>
      seat.model.provider === 'openai'
        ? { ok: false, reason: 'simulated outage' }
        : w.answer(topic, seat);

    const result = await runShow({
      topics,
      seats: w.answerSeats,
      answer: flaky,
      judge: w.judge,
      maxRounds: 2,
      prizeThreshold: 100,
    });
    expect(result.rounds).toHaveLength(2);
    const openaiSeat = w.answerSeats.find((s) => s.model.provider === 'openai');
    const passed = result.rounds[0]?.answers.find((a) => a.seatId === openaiSeat?.id);
    expect(passed?.passed).toBe(true);
  });

  it('8.3 出力トランスクリプトを別審査で再採点でき、回答は不変', async () => {
    const w = buildShowWiring({ offline: true });
    const result = await runShow({
      topics,
      seats: w.answerSeats,
      answer: w.answer,
      judge: w.judge,
      maxRounds: 2,
      prizeThreshold: 100,
      order: () => [0, 1, 2],
    });
    const t = buildTranscript(result, w.answerSeats);

    // 別審査: 表示2番目に +1
    const altJudge: JudgeFn = async (_topic, anon) =>
      anon.map((a) => ({ label: a.label, delta: a.label === '回答2' ? 1 : 0, reason: 'alt' }));
    const scored = await rescoreTranscript(t, altJudge, () => [0, 1, 2]);

    const total = Object.values(scored.ledger).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0); // 再採点で座布団が付く
    // 元トランスクリプトの回答テキストは不変（再生成していない）
    expect(t.rounds[0]?.answers[0]?.text).toBe(result.rounds[0]?.answers[0]?.text);
  });
});
