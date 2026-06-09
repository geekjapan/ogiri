import { describe, expect, it } from 'vitest';
import { anonymize, identityOrder } from './anonymize.js';

describe('anonymize', () => {
  const answers = [
    { seatId: 's1', text: 'ボケA' },
    { seatId: 's2', text: 'ボケB' },
    { seatId: 's3', text: 'ボケC' },
  ];

  it('回答を匿名ラベル化し、素性（seatId）を含めない', () => {
    const { anonymized } = anonymize(answers, identityOrder(answers.length));
    expect(anonymized).toEqual([
      { label: '回答1', text: 'ボケA' },
      { label: '回答2', text: 'ボケB' },
      { label: '回答3', text: 'ボケC' },
    ]);
    // 匿名化結果に内部 seatId が混入していないこと
    expect(JSON.stringify(anonymized)).not.toContain('s1');
  });

  it('ラベルから内部 seatId へ復元できる', () => {
    const { labelToSeat } = anonymize(answers, identityOrder(answers.length));
    expect(labelToSeat.get('回答1')).toBe('s1');
    expect(labelToSeat.get('回答3')).toBe('s3');
  });

  it('提示順をシャッフルできる（順序はラベル付与に反映、復元は正しい）', () => {
    // order=[2,0,1] → 表示1番目が元の index2(s3), 2番目が s1, 3番目が s2
    const { anonymized, labelToSeat } = anonymize(answers, [2, 0, 1]);
    expect(anonymized.map((a) => a.text)).toEqual(['ボケC', 'ボケA', 'ボケB']);
    expect(labelToSeat.get('回答1')).toBe('s3');
    expect(labelToSeat.get('回答2')).toBe('s1');
    expect(labelToSeat.get('回答3')).toBe('s2');
  });
});
