import { describe, expect, it } from 'vitest';
import { BUNDLED_TOPICS, bundledTopics, takeTopics, topicFromText } from './topics.js';

describe('topics', () => {
  it('同梱お題は複数あり、id 付きの Topic に変換できる', () => {
    expect(BUNDLED_TOPICS.length).toBeGreaterThan(5);
    const ts = bundledTopics();
    expect(ts[0]).toMatchObject({ id: 'bundled-1' });
    expect(ts).toHaveLength(BUNDLED_TOPICS.length);
  });

  it('自由入力からお題を作る（空はエラー）', () => {
    expect(topicFromText('  好きなお題  ')).toEqual({ id: 'free', text: '好きなお題' });
    expect(() => topicFromText('   ')).toThrow();
  });

  it('takeTopics は先頭から count 件、order でお任せ並びにできる', () => {
    const ts = bundledTopics(['A', 'B', 'C']);
    expect(takeTopics(ts, 2).map((t) => t.text)).toEqual(['A', 'B']);
    expect(takeTopics(ts, 2, [2, 0, 1]).map((t) => t.text)).toEqual(['C', 'A']);
  });
});
