import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ANSWER_BINDINGS,
  DEFAULT_JUDGE_BINDING,
  buildSeats,
  judgeIsDistinct,
} from './seating.js';

const always = () => true;

describe('buildSeats', () => {
  it('既定構成は回答 3 席（anthropic/openai/google）', () => {
    expect(DEFAULT_ANSWER_BINDINGS).toHaveLength(3);
    expect(DEFAULT_ANSWER_BINDINGS.map((b) => b.model.provider)).toEqual([
      'anthropic',
      'openai',
      'google',
    ]);
    const seats = buildSeats(DEFAULT_ANSWER_BINDINGS, always);
    expect(seats).toHaveLength(3);
    expect(seats[0]?.persona.id).toBe(DEFAULT_ANSWER_BINDINGS[0]?.personaId);
  });

  it('Persona と Model を直交させてバインドする', () => {
    const seats = buildSeats(
      [{ personaId: 'dokuzetsu', model: { provider: 'openai', model: 'x' } }],
      always,
    );
    expect(seats[0]?.persona.id).toBe('dokuzetsu');
    expect(seats[0]?.model).toEqual({ provider: 'openai', model: 'x' });
  });

  it('キー未設定（利用不可）プロバイダの席はスキップする', () => {
    const isAvailable = (provider: string) => provider !== 'google';
    const seats = buildSeats(DEFAULT_ANSWER_BINDINGS, isAvailable);
    expect(seats).toHaveLength(2);
    expect(seats.map((s) => s.model.provider)).toEqual(['anthropic', 'openai']);
  });

  it('未知のペルソナはエラー', () => {
    expect(() =>
      buildSeats([{ personaId: 'nope', model: { provider: 'openai', model: 'x' } }], always),
    ).toThrow();
  });
});

describe('judgeIsDistinct（審査の別系統チェック）', () => {
  it('審査モデルが回答席のどのモデルとも異なれば true', () => {
    const answers = buildSeats(DEFAULT_ANSWER_BINDINGS, always);
    const [judge] = buildSeats([DEFAULT_JUDGE_BINDING], always);
    if (!judge) throw new Error('judge 席が構築できなかった');
    expect(judgeIsDistinct(judge, answers)).toBe(true);
  });

  it('審査モデルが回答席のいずれかと一致すれば false', () => {
    const answers = buildSeats(
      [{ personaId: 'dokuzetsu', model: { provider: 'openai', model: 'gpt-x' } }],
      always,
    );
    const [judge] = buildSeats(
      [{ personaId: 'interi', model: { provider: 'openai', model: 'gpt-x' } }],
      always,
    );
    if (!judge) throw new Error('judge 席が構築できなかった');
    expect(judgeIsDistinct(judge, answers)).toBe(false);
  });
});
