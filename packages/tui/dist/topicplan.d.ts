import { type Topic } from '@ngs/engine';
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
export declare function planTopics(plan: TopicPlan, order?: number[]): Topic[];
