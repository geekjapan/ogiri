import { describe, expect, it } from 'vitest';
import { Ledger } from './ledger.js';

describe('Ledger', () => {
  it('全席が 0 枚から始まる', () => {
    const ledger = new Ledger(['a', 'b']);
    expect(ledger.count('a')).toBe(0);
    expect(ledger.count('b')).toBe(0);
    expect(ledger.snapshot()).toEqual({ a: 0, b: 0 });
  });

  it('座布団 +1 で枚数が増え、履歴に理由が残る', () => {
    const ledger = new Ledger(['a']);
    ledger.apply({ seatId: 'a', delta: 1, reason: '意外性が高い' });
    expect(ledger.count('a')).toBe(1);
    expect(ledger.history()).toEqual([{ seatId: 'a', delta: 1, reason: '意外性が高い', after: 1 }]);
  });

  it('没収しても 0 を下回らない（クランプ）', () => {
    const ledger = new Ledger(['a']);
    ledger.apply({ seatId: 'a', delta: -1, reason: 'お題無視' });
    expect(ledger.count('a')).toBe(0);
    // 履歴には裁定（-1）が残るが、確定枚数は 0
    expect(ledger.history().at(-1)).toEqual({
      seatId: 'a',
      delta: -1,
      reason: 'お題無視',
      after: 0,
    });
  });

  it('賞品ライン到達を判定できる', () => {
    const ledger = new Ledger(['a', 'b']);
    for (let i = 0; i < 10; i++) ledger.apply({ seatId: 'a', delta: 1, reason: 'good' });
    expect(ledger.reachedPrize(10)).toEqual(['a']);
    expect(ledger.reachedPrize(11)).toEqual([]);
  });

  it('未登録の席への裁定は例外', () => {
    const ledger = new Ledger(['a']);
    expect(() => ledger.apply({ seatId: 'x', delta: 1, reason: 'n/a' })).toThrow();
  });
});
