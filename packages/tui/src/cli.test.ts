import { describe, expect, it } from 'vitest';
import { parseArgs } from './cli.js';

describe('parseArgs', () => {
  it('既定値（M=5, N=10, out=transcript.json）', () => {
    const o = parseArgs([]);
    expect(o).toMatchObject({
      offline: false,
      rounds: 5,
      prizeThreshold: 10,
      out: 'transcript.json',
    });
  });

  it('フラグを解釈する', () => {
    const o = parseArgs([
      '--offline',
      '--rounds',
      '3',
      '--prize',
      '6',
      '--topic',
      'お題A',
      '--out',
      't.json',
    ]);
    expect(o).toMatchObject({
      offline: true,
      rounds: 3,
      prizeThreshold: 6,
      topic: 'お題A',
      out: 't.json',
    });
  });

  it('--list は 1始まりを 0始まりに直す', () => {
    expect(parseArgs(['--list', '3']).list).toBe(2);
  });

  it('不正な数値は既定にフォールバック', () => {
    expect(parseArgs(['--rounds', 'abc']).rounds).toBe(5);
  });
});
