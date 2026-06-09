/**
 * 座布団台帳。席ごとの枚数を保持し、裁定（付与/没収）を反映する。
 * 枚数は 0 を下回らない（没収はクランプされるが履歴には裁定が残る）。
 */
export class Ledger {
    counts = new Map();
    entries = [];
    constructor(seatIds) {
        for (const id of seatIds)
            this.counts.set(id, 0);
    }
    count(seatId) {
        return this.counts.get(seatId) ?? 0;
    }
    apply(verdict) {
        if (!this.counts.has(verdict.seatId)) {
            throw new Error(`未登録の席への裁定: ${verdict.seatId}`);
        }
        const next = Math.max(0, this.count(verdict.seatId) + verdict.delta);
        this.counts.set(verdict.seatId, next);
        this.entries.push({
            seatId: verdict.seatId,
            delta: verdict.delta,
            reason: verdict.reason,
            after: next,
        });
    }
    /** 賞品ライン（threshold 枚）に到達した席の一覧。 */
    reachedPrize(threshold) {
        return [...this.counts.entries()].filter(([, n]) => n >= threshold).map(([id]) => id);
    }
    snapshot() {
        return Object.fromEntries(this.counts);
    }
    history() {
        return [...this.entries];
    }
}
//# sourceMappingURL=ledger.js.map