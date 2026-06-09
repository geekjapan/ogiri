import { type Topic, bundledTopics, topicFromText } from '@ngs/engine';

export type TopicMode = 'free' | 'list' | 'random';

export interface TopicPlan {
  mode: TopicMode;
  /** free モードのお題テキスト。 */
  freeText?: string;
  /** list モードで選んだ同梱お題のインデックス。 */
  listIndex?: number;
  rounds: number;
}

/**
 * お題プランから実際のお題列を組み立てる（人間はお題側のみ）。
 * 先頭は人間の選択（free/list/random）、残りラウンドは同梱からお任せ補充。
 * `order` は補充時の並び（テスト用に注入可。既定は素直な順）。
 */
export function planTopics(plan: TopicPlan, order?: number[]): Topic[] {
  const pool = bundledTopics();
  const fill = (order ?? pool.map((_, i) => i)).map((i) => pool[i]).filter((t): t is Topic => !!t);

  const head: Topic[] = [];
  if (plan.mode === 'free') {
    head.push(topicFromText(plan.freeText ?? ''));
  } else if (plan.mode === 'list') {
    const idx = plan.listIndex ?? 0;
    const picked = pool[idx];
    if (!picked) throw new Error(`お題インデックスが範囲外: ${idx}`);
    head.push(picked);
  } else {
    const first = fill[0];
    if (first) head.push(first);
  }

  const result: Topic[] = [...head];
  for (const t of fill) {
    if (result.length >= plan.rounds) break;
    if (result.some((r) => r.text === t.text)) continue;
    result.push(t);
  }
  return result.slice(0, plan.rounds);
}
