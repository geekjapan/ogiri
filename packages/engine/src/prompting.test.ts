import { describe, expect, it } from 'vitest';
import { buildAnswerMessages, buildJudgeMessages, parseJudgeResponse } from './prompting.js';
import type { AnonymizedAnswer, Persona, Topic } from './types.js';

const persona: Persona = {
  id: 'dokuzetsu',
  name: '毒島センセ',
  style: '辛口の毒舌',
  speech: '断定口調',
  specialty: '皮肉',
  fewShot: ['お題X→回答Y'],
};
const topic: Topic = { id: 't1', text: 'もしも猫が総理大臣だったら' };

describe('buildAnswerMessages', () => {
  it('ペルソナの芸風・お題・few-shot を含む', () => {
    const { system, user } = buildAnswerMessages(persona, topic);
    expect(system).toContain('毒島センセ');
    expect(system).toContain('辛口の毒舌');
    expect(system).toContain('お題X→回答Y');
    expect(user).toContain(topic.text);
  });
});

describe('buildJudgeMessages', () => {
  const anon: AnonymizedAnswer[] = [
    { label: '回答1', text: 'ボケA' },
    { label: '回答2', text: 'ボケB' },
  ];

  it('ルーブリックと匿名ラベルを含み、素性（seatId/ペルソナ名）は含まない', () => {
    const { system, user } = buildJudgeMessages(topic, anon);
    expect(system).toContain('意外性');
    expect(system).toContain('お題適合');
    expect(system).toContain('言葉のキレ');
    expect(user).toContain('回答1');
    expect(user).toContain('ボケA');
    // 匿名性: 内部 seatId やペルソナ名が審査プロンプトに漏れない
    expect(`${system}${user}`).not.toContain('dokuzetsu');
    expect(`${system}${user}`).not.toContain('毒島センセ');
  });
});

describe('parseJudgeResponse', () => {
  const labels = ['回答1', '回答2'];

  it('JSON 配列から裁定を読み取る', () => {
    const raw =
      '{"verdicts":[{"label":"回答1","delta":1,"reason":"キレ"},{"label":"回答2","delta":0,"reason":"普通"}]}';
    expect(parseJudgeResponse(raw, labels)).toEqual([
      { label: '回答1', delta: 1, reason: 'キレ' },
      { label: '回答2', delta: 0, reason: '普通' },
    ]);
  });

  it('markdown コードフェンス付きでもパースできる', () => {
    const raw = '```json\n{"verdicts":[{"label":"回答1","delta":-1,"reason":"お題無視"}]}\n```';
    const v = parseJudgeResponse(raw, labels);
    expect(v.find((x) => x.label === '回答1')).toEqual({
      label: '回答1',
      delta: -1,
      reason: 'お題無視',
    });
  });

  it('delta は -1/0/1 にクランプ、未知ラベルは無視、欠落ラベルは 0 で補完', () => {
    const raw =
      '{"verdicts":[{"label":"回答1","delta":5,"reason":"絶賛"},{"label":"回答X","delta":1,"reason":"幽霊"}]}';
    const v = parseJudgeResponse(raw, labels);
    expect(v.find((x) => x.label === '回答1')?.delta).toBe(1); // 5 → 1
    expect(v.find((x) => x.label === '回答X')).toBeUndefined(); // 未知は無視
    expect(v.find((x) => x.label === '回答2')).toEqual({ label: '回答2', delta: 0, reason: '' }); // 補完
  });

  it('パース不能なら全ラベル delta 0 にデグレードする', () => {
    const v = parseJudgeResponse('これはJSONではない', labels);
    expect(v).toEqual([
      { label: '回答1', delta: 0, reason: 'パース不能' },
      { label: '回答2', delta: 0, reason: 'パース不能' },
    ]);
  });
});
