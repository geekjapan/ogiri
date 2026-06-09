import { describe, expect, it } from 'vitest';
import {
  buildRoundLines,
  narrateAnswer,
  narrateTopic,
  narrateVerdict,
  narrateWinners,
} from './narration.js';

describe('narration（司会・山田くんの定型文）', () => {
  it('お題提示', () => {
    expect(narrateTopic(1, 'もしも猫が総理')).toContain('お題');
    expect(narrateTopic(1, 'もしも猫が総理')).toContain('もしも猫が総理');
  });

  it('回答の中継', () => {
    expect(narrateAnswer('毒島センセ', { text: 'ニャー', passed: false })).toBe(
      '毒島センセ「ニャー」',
    );
  });

  it('パスした席はパスとして表示し、止めない', () => {
    const line = narrateAnswer('与太郎', { text: '', passed: true, passReason: 'timeout' });
    expect(line).toContain('与太郎');
    expect(line).toContain('パス');
  });

  it('座布団付与は山田くんコール、没収・現状維持も表現', () => {
    expect(narrateVerdict('毒島センセ', 1, 3)).toContain('座布団');
    expect(narrateVerdict('毒島センセ', 1, 3)).toContain('3');
    expect(narrateVerdict('与太郎', -1, 0)).toContain('没収');
    expect(narrateVerdict('理屈屋', 0, 2)).toBeNull(); // 動きなしは出さない
  });

  it('勝者コール', () => {
    expect(narrateWinners(['毒島センセ'])).toContain('毒島センセ');
    expect(narrateWinners([])).toContain('賞品なし');
  });

  it('buildRoundLines: お題→回答→座布団の順で中継行を作る（パス・名前解決込み）', () => {
    const names = new Map([
      ['s1', '毒島センセ'],
      ['s2', '与太郎'],
    ]);
    const lines = buildRoundLines(
      1,
      {
        topic: { text: 'お題X' },
        answers: [
          { seatId: 's1', text: 'ボケ', passed: false },
          { seatId: 's2', text: '', passed: true, passReason: 'no key' },
        ],
        verdicts: [
          { seatId: 's1', delta: 1 },
          { seatId: 's2', delta: 0 },
        ],
        ledger: { s1: 1, s2: 0 },
      },
      names,
    );
    expect(lines[0]).toContain('お題X');
    expect(lines[1]).toBe('毒島センセ「ボケ」');
    expect(lines[2]).toContain('パス');
    // s1 に座布団行、s2(delta0) は出ない
    expect(lines.some((l) => l.includes('座布団') && l.includes('毒島センセ'))).toBe(true);
    expect(lines.some((l) => l.includes('与太郎') && l.includes('座布団'))).toBe(false);
  });
});
