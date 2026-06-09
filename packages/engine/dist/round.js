import { anonymize, identityOrder } from './anonymize.js';
/**
 * 大喜利 1 ラウンドを実行する。
 * 回答収集（並列）→ 匿名化（順序シャッフル可）→ ブラインド審査 → 台帳反映。
 * いずれかの席が失敗（値 or 例外）した場合はその席を「パス」として記録し、番組は止めない。
 */
export async function runRound(config) {
    const { topic, seats, answer, judge, ledger } = config;
    const order = config.order ?? identityOrder;
    // 1. 回答を並列収集（失敗・例外はパスに丸める）
    const answers = await Promise.all(seats.map(async (seat) => {
        const model = seat.model.model;
        try {
            const res = await answer(topic, seat);
            if (res.ok)
                return { seatId: seat.id, text: res.text, passed: false, model };
            return { seatId: seat.id, text: '', passed: true, model, passReason: res.reason };
        }
        catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            return { seatId: seat.id, text: '', passed: true, model, passReason: reason };
        }
    }));
    // 2. 生存回答のみを匿名化（順序シャッフル可）
    const live = answers.filter((a) => !a.passed).map((a) => ({ seatId: a.seatId, text: a.text }));
    const verdicts = [];
    if (live.length > 0) {
        const { anonymized, labelToSeat } = anonymize(live, order(live.length));
        // 3. ブラインド審査
        const labeled = await judge(topic, anonymized);
        // 4. ラベル→seatId 復元のうえ台帳へ反映
        for (const v of labeled) {
            const seatId = labelToSeat.get(v.label);
            if (!seatId)
                continue; // 未知ラベルは無視
            const verdict = { seatId, delta: v.delta, reason: v.reason };
            verdicts.push(verdict);
            ledger.apply(verdict);
        }
    }
    return { topic, answers, verdicts, ledger: ledger.snapshot() };
}
//# sourceMappingURL=round.js.map