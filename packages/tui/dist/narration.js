// 司会・山田くんの「語り」を engine の構造化イベントから定型文へ整形する（LLM 呼び出しを増やさない）。
export function narrateTopic(round, topicText) {
    return `司会：第${round}問のお題「${topicText}」、続いてどうぞ！`;
}
export function narrateAnswer(name, answer) {
    if (answer.passed) {
        const why = answer.passReason ? `（${answer.passReason}）` : '';
        return `${name}……おっと、ここでパス！${why}`;
    }
    return `${name}「${answer.text}」`;
}
/** 座布団の動きを山田くんコールにする。動きなし(0)は null（出さない）。 */
export function narrateVerdict(name, delta, countAfter) {
    if (delta > 0)
        return `山田くん、${name}さんに座布団1枚！（現在 ${countAfter}枚）`;
    if (delta < 0)
        return `山田くん、${name}さんの座布団を没収！（現在 ${countAfter}枚）`;
    return null;
}
export function narrateWinners(names) {
    if (names.length === 0)
        return '司会：本日はお開き。賞品なしでございます。';
    return `司会：${names.join('・')}さん、座布団10枚で賞品獲得！おめでとうございます！`;
}
/** 1 ラウンドを中継台本の行列へ整形する（お題→各回答→座布団の動き）。 */
export function buildRoundLines(index, round, names) {
    const nameOf = (seatId) => names.get(seatId) ?? seatId;
    const lines = [narrateTopic(index, round.topic.text)];
    for (const a of round.answers) {
        lines.push(narrateAnswer(nameOf(a.seatId), a));
    }
    for (const v of round.verdicts) {
        const line = narrateVerdict(nameOf(v.seatId), v.delta, round.ledger[v.seatId] ?? 0);
        if (line)
            lines.push(line);
    }
    return lines;
}
//# sourceMappingURL=narration.js.map