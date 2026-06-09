/** 0..n-1 の恒等順（シャッフルなし）。 */
export function identityOrder(n) {
    return Array.from({ length: n }, (_, i) => i);
}
/**
 * 回答を匿名ラベル（回答1..N）化し、ラベル→seatId の復元表を返す。
 * `order` は提示順の順列（位置バイアス回避のためラウンドごとにシャッフル可）。
 * 審査モデルには anonymized のみを渡し、seatId・名前・芸風・モデルは渡さない。
 */
export function anonymize(answers, order) {
    const anonymized = [];
    const labelToSeat = new Map();
    order.forEach((srcIndex, pos) => {
        const src = answers[srcIndex];
        if (!src)
            throw new Error(`order が範囲外: ${srcIndex}`);
        const label = `回答${pos + 1}`;
        anonymized.push({ label, text: src.text });
        labelToSeat.set(label, src.seatId);
    });
    return { anonymized, labelToSeat };
}
//# sourceMappingURL=anonymize.js.map