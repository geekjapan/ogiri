export interface CliOptions {
    offline: boolean;
    rounds: number;
    prizeThreshold: number;
    out: string;
    /** お題モード（未指定なら呼び出し側が対話/既定で解決）。 */
    topic?: string;
    random: boolean;
    list?: number;
    timeoutMs?: number;
}
/** argv（ノードの process.argv.slice(2) 相当）を解析する。 */
export declare function parseArgs(argv: string[]): CliOptions;
