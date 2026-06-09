import { describe, expect, it } from 'vitest';
import { planTopics } from './topicplan.js';

describe('planTopics', () => {
  it('free: 先頭に自由入力お題、残りは同梱から補充', () => {
    const ts = planTopics({ mode: 'free', freeText: 'オリジナルお題', rounds: 3 });
    expect(ts).toHaveLength(3);
    expect(ts[0]).toMatchObject({ id: 'free', text: 'オリジナルお題' });
  });

  it('list: 選んだ同梱お題が先頭', () => {
    const ts = planTopics({ mode: 'list', listIndex: 2, rounds: 1 });
    expect(ts).toHaveLength(1);
    expect(ts[0]?.id).toBe('bundled-3');
  });

  it('random: 同梱から rounds 件、重複なし', () => {
    const ts = planTopics({ mode: 'random', rounds: 4 }, [3, 3, 1, 0, 2]);
    expect(ts).toHaveLength(4);
    const texts = ts.map((t) => t.text);
    expect(new Set(texts).size).toBe(4); // 重複なし
  });

  it('rounds がお題数を超えても落ちない', () => {
    const ts = planTopics({ mode: 'random', rounds: 1000 });
    expect(ts.length).toBeGreaterThan(0);
  });
});
