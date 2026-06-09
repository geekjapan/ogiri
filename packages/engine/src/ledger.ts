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
export class Ledger {
  private readonly counts = new Map<string, number>();
  private readonly entries: LedgerEntry[] = [];

  constructor(seatIds: string[]) {
    for (const id of seatIds) this.counts.set(id, 0);
  }

  count(seatId: string): number {
    return this.counts.get(seatId) ?? 0;
  }

  apply(verdict: Verdict): void {
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
  reachedPrize(threshold: number): string[] {
    return [...this.counts.entries()].filter(([, n]) => n >= threshold).map(([id]) => id);
  }

  snapshot(): Record<string, number> {
    return Object.fromEntries(this.counts);
  }

  history(): LedgerEntry[] {
    return [...this.entries];
  }
}
