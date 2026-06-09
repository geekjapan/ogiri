import { describe, expect, it } from 'vitest';
import { runShow } from './show.js';
import type { AnswerFn, JudgeFn, Persona, Seat, Topic } from './types.js';

const persona = (id: string): Persona => ({
  id,
  name: `名前${id}`,
  style: '芸風',
  speech: '口調',
  specialty: '得意技',
  fewShot: [],
});
const seat = (id: string): Seat => ({
  id,
  persona: persona(id),
  model: { provider: 'stub', model: 'm' },
});
const topics: Topic[] = Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, text: `お題${i}` }));

const answerOk: AnswerFn = async (_t, s) => ({ ok: true, text: `回答 ${s.id}` });
const judgeAllPlusOne: JudgeFn = async (_t, anon) =>
  anon.map((a) => ({ label: a.label, delta: 1, reason: '良い' }));
const judgeZero: JudgeFn = async (_t, anon) =>
  anon.map((a) => ({ label: a.label, delta: 0, reason: '' }));

describe('runShow', () => {
  it('規定ラウンド数 M を消化して終了する', async () => {
    const result = await runShow({
      topics,
      seats: [seat('s1')],
      answer: answerOk,
      judge: judgeZero,
      maxRounds: 3,
      prizeThreshold: 100,
    });
    expect(result.rounds).toHaveLength(3);
    expect(result.endedReason).toBe('rounds');
    expect(result.winners).toEqual([]);
  });

  it('賞品ライン N 到達で早期終了し、勝者を記録する', async () => {
    const result = await runShow({
      topics,
      seats: [seat('s1')],
      answer: answerOk,
      judge: judgeAllPlusOne,
      maxRounds: 10,
      prizeThreshold: 2,
    });
    expect(result.rounds).toHaveLength(2); // 2 ラウンドで 2 枚到達
    expect(result.endedReason).toBe('prize');
    expect(result.winners).toEqual(['s1']);
    expect(result.ledger.s1).toBeGreaterThanOrEqual(2);
  });

  it('お題が尽きたら M 未満でも終了する', async () => {
    const result = await runShow({
      topics: topics.slice(0, 2),
      seats: [seat('s1')],
      answer: answerOk,
      judge: judgeZero,
      maxRounds: 5,
      prizeThreshold: 100,
    });
    expect(result.rounds).toHaveLength(2);
    expect(result.endedReason).toBe('rounds');
  });

  it('全席パスでも番組は完走する', async () => {
    const result = await runShow({
      topics,
      seats: [seat('s1'), seat('s2')],
      answer: async () => ({ ok: false, reason: 'no key' }),
      judge: judgeZero,
      maxRounds: 2,
      prizeThreshold: 100,
    });
    expect(result.rounds).toHaveLength(2);
    expect(result.ledger).toEqual({ s1: 0, s2: 0 });
  });
});
