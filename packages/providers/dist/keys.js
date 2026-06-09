/** プロバイダ → API キーの環境変数名。 */
export const PROVIDER_ENV = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
};
/** 指定プロバイダの API キーが設定されているか。 */
export function hasApiKey(provider, env = process.env) {
    const name = PROVIDER_ENV[provider];
    if (!name)
        return false;
    const value = env[name];
    return typeof value === 'string' && value.trim().length > 0;
}
/** engine の buildSeats へ渡す「プロバイダ利用可否」述語を作る。 */
export function providerAvailable(env = process.env) {
    return (provider) => hasApiKey(provider, env);
}
/** キーが設定済みのプロバイダ一覧。 */
export function availableProviders(env = process.env) {
    return Object.keys(PROVIDER_ENV).filter((p) => hasApiKey(p, env));
}
//# sourceMappingURL=keys.js.map