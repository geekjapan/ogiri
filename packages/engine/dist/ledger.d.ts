import type { Verdict } from './types.js';
/** 台帳の履歴エントリ（裁定 + 確定後の枚数）。 */
export interface LedgerEntry {
    seatId: string;
    delta: number;
    reason: string;
    /** この裁定を反映した後の確定枚数（0 未満にはならない）。 */
    after: number;
}
/**
 * 座布団台帳。席ごとの枚数を保持し、裁定（付与/没収）を反映する。
 * 枚数は 0 を下回らない（没収はクランプされるが履歴には裁定が残る）。
 */
export declare class Ledger {
    private readonly counts;
    private readonly entries;
    constructor(seatIds: string[]);
    count(seatId: string): number;
    apply(verdict: Verdict): void;
    /** 賞品ライン（threshold 枚）に到達した席の一覧。 */
    reachedPrize(threshold: number): string[];
    snapshot(): Record<string, number>;
    history(): LedgerEntry[];
}
