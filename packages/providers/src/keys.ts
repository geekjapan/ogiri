import type { ProviderAvailable } from '@ngs/engine';

/** プロバイダ → API キーの環境変数名。 */
export const PROVIDER_ENV: Readonly<Record<string, string>> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
};

type Env = Record<string, string | undefined>;

/** 指定プロバイダの API キーが設定されているか。 */
export function hasApiKey(provider: string, env: Env = process.env): boolean {
  const name = PROVIDER_ENV[provider];
  if (!name) return false;
  const value = env[name];
  return typeof value === 'string' && value.trim().length > 0;
}

/** engine の buildSeats へ渡す「プロバイダ利用可否」述語を作る。 */
export function providerAvailable(env: Env = process.env): ProviderAvailable {
  return (provider: string) => hasApiKey(provider, env);
}

/** キーが設定済みのプロバイダ一覧。 */
export function availableProviders(env: Env = process.env): string[] {
  return Object.keys(PROVIDER_ENV).filter((p) => hasApiKey(p, env));
}
