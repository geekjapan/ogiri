import type { Topic } from './types.js';
/**
 * 同梱お題リスト（汎用・センシティブ題材は避ける）。MVP では各お題は独立。
 * 自由入力（topicFromText）と併存。
 */
export declare const BUNDLED_TOPICS: readonly string[];
/** お題リストを Topic[] に変換（id を付与）。 */
export declare function bundledTopics(texts?: readonly string[]): Topic[];
/** 自由入力のテキストから Topic を作る。 */
export declare function topicFromText(text: string): Topic;
/**
 * 順序付きのお題列を用意する。`pick` で先頭から count 件を取り出す。
 * order=[...] を渡すとその並びを使う（「お任せ」時のシャッフルなど）。
 */
export declare function takeTopics(topics: Topic[], count: number, order?: number[]): Topic[];
