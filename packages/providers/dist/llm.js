export class TimeoutError extends Error {
    constructor(ms) {
        super(`タイムアウト (${ms}ms)`);
        this.name = 'TimeoutError';
    }
}
/** Promise にタイムアウトを付与する（超過で TimeoutError を reject）。 */
export function withTimeout(p, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
        p.then((v) => {
            clearTimeout(timer);
            resolve(v);
        }, (e) => {
            clearTimeout(timer);
            reject(e);
        });
    });
}
/**
 * Vercel AI SDK を用いた既定の生成関数を作る（遅延 import で SDK 依存をテストから切り離す）。
 * provider ごとに対応する @ai-sdk のモデルファクトリへルーティングする。
 */
export function createSdkGenerate() {
    return async (messages, model) => {
        const [aiMod, anthropicMod, openaiMod, googleMod] = await Promise.all([
            import('ai'),
            import('@ai-sdk/anthropic'),
            import('@ai-sdk/openai'),
            import('@ai-sdk/google'),
        ]);
        const { generateText } = aiMod;
        const factory = {
            anthropic: anthropicMod.anthropic,
            openai: openaiMod.openai,
            google: googleMod.google,
        };
        const make = factory[model.provider];
        if (!make)
            throw new Error(`未対応プロバイダ: ${model.provider}`);
        const result = await generateText({
            model: make(model.model),
            system: messages.system,
            prompt: messages.user,
        });
        return result.text;
    };
}
//# sourceMappingURL=llm.js.map