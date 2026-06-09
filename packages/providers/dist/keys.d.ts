import type { ProviderAvailable } from '@ngs/engine';
/** プロバイダ → API キーの環境変数名。 */
export declare const PROVIDER_ENV: Readonly<Record<string, string>>;
type Env = Record<string, string | undefined>;
/** 指定プロバイダの API キーが設定されているか。 */
export declare function hasApiKey(provider: string, env?: Env): boolean;
/** engine の buildSeats へ渡す「プロバイダ利用可否」述語を作る。 */
export declare function providerAvailable(env?: Env): ProviderAvailable;
/** キーが設定済みのプロバイダ一覧。 */
export declare function availableProviders(env?: Env): string[];
export {};
