import type { ChatMessages, ModelRef } from '@ngs/engine';
/** プロバイダ非依存の生成関数。messages とモデル参照から本文テキストを返す。 */
export type Generate = (messages: ChatMessages, model: ModelRef) => Promise<string>;
export declare class TimeoutError extends Error {
    constructor(ms: number);
}
/** Promise にタイムアウトを付与する（超過で TimeoutError を reject）。 */
export declare function withTimeout<T>(p: Promise<T>, ms: number): Promise<T>;
/**
 * Vercel AI SDK を用いた既定の生成関数を作る（遅延 import で SDK 依存をテストから切り離す）。
 * provider ごとに対応する @ai-sdk のモデルファクトリへルーティングする。
 */
export declare function createSdkGenerate(): Generate;
