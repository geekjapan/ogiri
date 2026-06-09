import { Ledger } from './ledger.js';
import { runRound } from './round.js';
/**
 * 番組（複数ラウンド）をヘッドレスで実行する。
 * 各ラウンド後に賞品ライン到達を判定し、到達 or お題/最大ラウンド消化で終了する。
 */
export async function runShow(config) {
    const ledger = new Ledger(config.seats.map((s) => s.id));
    const rounds = [];
    const roundCount = Math.min(config.maxRounds, config.topics.length);
    let endedReason = 'rounds';
    let winners = [];
    for (let i = 0; i < roundCount; i++) {
        const topic = config.topics[i];
        const round = await runRound({
            topic,
            seats: config.seats,
            answer: config.answer,
            judge: config.judge,
            ledger,
            order: config.order,
        });
        rounds.push(round);
        config.onRound?.(round, i);
        const reached = ledger.reachedPrize(config.prizeThreshold);
        if (reached.length > 0) {
            endedReason = 'prize';
            winners = reached;
            break;
        }
    }
    return { rounds, ledger: ledger.snapshot(), winners, endedReason };
}
//# sourceMappingURL=show.js.map