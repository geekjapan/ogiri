import { describe, expect, it } from 'vitest';
import { runShow } from './show.js';
import {
  attachHumanScores,
  buildTranscript,
  rescoreTranscript,
  toTranscriptJson,
} from './transcript.js';
import type { AnswerFn, JudgeFn, Persona, Seat, Topic } from './types.js';

const persona = (id: string): Persona => ({
  id,
  name: `名前${id}`,
  style: 's',
  speech: 'p',
  specialty: 't',
  fewShot: [],
});
const seats: Seat[] = [
  { id: 's1', persona: persona('s1'), model: { provider: 'anthropic', model: 'claude-x' } },
  { id: 's2', persona: persona('s2'), model: { provider: 'openai', model: 'gpt-x' } },
];
const topics: Topic[] = [
  { id: 't1', text: 'お題1' },
  { id: 't2', text: 'お題2' },
];
const answerOk: AnswerFn = async (_t, s) => ({ ok: true, text: `回答 ${s.id}` });
const judgePlusOne: JudgeFn = async (_t, anon) =>
  anon.map((a) => ({ label: a.label, delta: a.label === '回答1' ? 1 : 0, reason: 'r' }));

async function fixture() {
  const show = await runShow({
    topics,
    seats,
    answer: answerOk,
    judge: judgePlusOne,
    maxRounds: 2,
    prizeThreshold: 100,
    order: () => [0, 1],
  });
  return buildTranscript(show, seats);
}

describe('buildTranscript', () => {
  it('席・ラウンド・回答・裁定を一意 ID で参照できる', async () => {
    const t = await fixture();
    expect(t.seats.map((s) => s.id)).toEqual(['s1', 's2']);
    expect(t.rounds).toHaveLength(2);
    const a = t.rounds[0]?.answers[0];
    expect(a?.id).toBe('r1:s1');
    const v = t.rounds[0]?.verdicts.find((x) => x.seatId === 's1');
    expect(v?.answerId).toBe('r1:s1');
  });

  it('駆動モデル名と呼び出し回数メタデータを記録する', async () => {
    const t = await fixture();
    expect(t.rounds[0]?.answers[0]?.model).toBe('claude-x');
    // 回答 2席 × 2ラウンド = 4、審査 2ラウンド = 2
    expect(t.meta.answerCalls).toBe(4);
    expect(t.meta.judgeCalls).toBe(2);
  });

  it('JSON 直列化に秘匿情報を含めない', async () => {
    const t = await fixture();
    const json = toTranscriptJson(t);
    expect(json).not.toMatch(/api[_-]?key/i);
    expect(JSON.parse(json).version).toBeDefined();
  });
});

describe('rescoreTranscript（生成と採点の分離）', () => {
  it('回答を再生成せず、記録済み回答に別の裁定を付与する', async () => {
    const t = await fixture();
    // 別審査: 回答2 にだけ +1（元は回答1に+1）
    const altJudge: JudgeFn = async (_t, anon) =>
      anon.map((a) => ({ label: a.label, delta: a.label === '回答2' ? 1 : 0, reason: 'alt' }));
    const scored = await rescoreTranscript(t, altJudge, () => [0, 1]);
    // s2 が表示2番目(回答2)で +1 ×2ラウンド
    expect(scored.ledger).toEqual({ s1: 0, s2: 2 });
    // 元のトランスクリプトの回答は不変
    expect(t.rounds[0]?.answers[0]?.text).toBe('回答 s1');
  });
});

describe('attachHumanScores（人間スコア相関）', () => {
  it('同一 answerId に人間スコアを併記できる', async () => {
    const t = await fixture();
    const withHuman = attachHumanScores(t, [{ answerId: 'r1:s1', score: 5 }]);
    expect(withHuman.humanScores).toEqual([{ answerId: 'r1:s1', score: 5 }]);
    // LLM 裁定と同じ answerId で紐づく
    const llm = withHuman.rounds[0]?.verdicts.find((v) => v.answerId === 'r1:s1');
    expect(llm).toBeDefined();
  });
});
