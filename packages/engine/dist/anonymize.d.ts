import type { AnonymizedAnswer } from './types.js';
/** 匿名化の入力（審査に渡してよい最小情報）。 */
export interface AnonInput {
    seatId: string;
    text: string;
}
export interface AnonymizeResult {
    /** 審査モデルへ渡す匿名回答（素性を含まない）。 */
    anonymized: AnonymizedAnswer[];
    /** 匿名ラベル → 内部 seatId の復元表。 */
    labelToSeat: Map<string, string>;
}
/** 0..n-1 の恒等順（シャッフルなし）。 */
export declare function identityOrder(n: number): number[];
/**
 * 回答を匿名ラベル（回答1..N）化し、ラベル→seatId の復元表を返す。
 * `order` は提示順の順列（位置バイアス回避のためラウンドごとにシャッフル可）。
 * 審査モデルには anonymized のみを渡し、seatId・名前・芸風・モデルは渡さない。
 */
export declare function anonymize(answers: AnonInput[], order: number[]): AnonymizeResult;
