const DEFAULTS = {
    offline: false,
    rounds: 5, // 終了条件 M（design 既定）
    prizeThreshold: 10, // 賞品ライン N（design 既定）
    out: 'transcript.json',
    random: false,
};
function intArg(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
/** argv（ノードの process.argv.slice(2) 相当）を解析する。 */
export function parseArgs(argv) {
    const o = { ...DEFAULTS };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = argv[i + 1];
        switch (a) {
            case '--offline':
                o.offline = true;
                break;
            case '--random':
                o.random = true;
                break;
            case '--rounds':
                o.rounds = intArg(next, o.rounds);
                i++;
                break;
            case '--prize':
                o.prizeThreshold = intArg(next, o.prizeThreshold);
                i++;
                break;
            case '--list':
                o.list = intArg(next, 1) - 1; // 1始まり → 0始まり
                i++;
                break;
            case '--topic':
                o.topic = next ?? '';
                i++;
                break;
            case '--out':
                o.out = next ?? o.out;
                i++;
                break;
            case '--timeout':
                o.timeoutMs = intArg(next, 30_000);
                i++;
                break;
        }
    }
    return o;
}
//# sourceMappingURL=cli.js.map