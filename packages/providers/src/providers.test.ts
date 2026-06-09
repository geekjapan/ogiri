import type { ModelRef, Persona, Seat, Topic } from '@ngs/engine';
import { describe, expect, it } from 'vitest';
import { makeAnswerFn } from './answer.js';
import { makeJudgeFn } from './judge.js';
import { availableProviders, hasApiKey, providerAvailable } from './keys.js';
import type { Generate } from './llm.js';

const seat: Seat = {
  id: 's1',
  persona: { id: 'p', name: 'N', style: 's', speech: 'p', specialty: 't', fewShot: [] } as Persona,
  model: { provider: 'anthropic', model: 'claude-x' },
};
const topic: Topic = { id: 't1', text: 'お題' };

describe('keys', () => {
  it('hasApiKey は env のキー有無を判定する', () => {
    expect(hasApiKey('anthropic', { ANTHROPIC_API_KEY: 'sk-x' })).toBe(true);
    expect(hasApiKey('anthropic', { ANTHROPIC_API_KEY: '   ' })).toBe(false);
    expect(hasApiKey('anthropic', {})).toBe(false);
    expect(hasApiKey('unknown', { ANTHROPIC_API_KEY: 'sk-x' })).toBe(false);
  });

  it('providerAvailable / availableProviders が機能する', () => {
    const env = { ANTHROPIC_API_KEY: 'a', GOOGLE_GENERATIVE_AI_API_KEY: 'g' };
    const avail = providerAvailable(env);
    expect(avail('anthropic')).toBe(true);
    expect(avail('openai')).toBe(false);
    expect(availableProviders(env).sort()).toEqual(['anthropic', 'google']);
  });
});

describe('makeAnswerFn', () => {
  it('正常応答を ok:true で返す（前後空白は trim）', async () => {
    const generate: Generate = async () => '  ニャーと所信表明  ';
    const answer = makeAnswerFn({ generate });
    expect(await answer(topic, seat)).toEqual({ ok: true, text: 'ニャーと所信表明' });
  });

  it('例外は ok:false に丸める', async () => {
    const generate: Generate = async () => {
      throw new Error('rate limited');
    };
    const res = await makeAnswerFn({ generate })(topic, seat);
    expect(res).toEqual({ ok: false, reason: 'rate limited' });
  });

  it('空応答は ok:false', async () => {
    const generate: Generate = async () => '   ';
    expect(await makeAnswerFn({ generate })(topic, seat)).toMatchObject({ ok: false });
  });

  it('タイムアウトは ok:false に丸める', async () => {
    const generate: Generate = () => new Promise((r) => setTimeout(() => r('遅い'), 50));
    const res = await makeAnswerFn({ generate, timeoutMs: 10 })(topic, seat);
    expect(res.ok).toBe(false);
  });
});

describe('makeJudgeFn', () => {
  const judgeModel: ModelRef = { provider: 'google', model: 'gemini-pro' };
  const anon = [
    { label: '回答1', text: 'A' },
    { label: '回答2', text: 'B' },
  ];

  it('応答 JSON を構造化裁定へ変換する', async () => {
    const generate: Generate = async () =>
      '{"verdicts":[{"label":"回答1","delta":1,"reason":"良い"},{"label":"回答2","delta":0,"reason":""}]}';
    const judge = makeJudgeFn({ generate, judgeModel });
    const v = await judge(topic, anon);
    expect(v.find((x) => x.label === '回答1')).toEqual({
      label: '回答1',
      delta: 1,
      reason: '良い',
    });
  });

  it('審査失敗時は全ラベル delta 0 にデグレードする', async () => {
    const generate: Generate = async () => {
      throw new Error('judge down');
    };
    const v = await makeJudgeFn({ generate, judgeModel })(topic, anon);
    expect(v).toEqual([
      { label: '回答1', delta: 0, reason: '審査失敗' },
      { label: '回答2', delta: 0, reason: '審査失敗' },
    ]);
  });
});
