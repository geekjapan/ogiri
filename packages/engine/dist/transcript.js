import { anonymize, identityOrder } from './anonymize.js';
import { Ledger } from './ledger.js';
export const TRANSCRIPT_VERSION = 1;
const answerId = (round, seatId) => `r${round}:${seatId}`;
/** ShowResult と席情報から構造化トランスクリプトを組み立てる。秘匿情報は含めない。 */
export function buildTranscript(show, seats) {
    const seatMeta = seats.map((s) => ({
        id: s.id,
        personaId: s.persona.id,
        personaName: s.persona.name,
        provider: s.model.provider,
        model: s.model.model,
    }));
    let answerCalls = 0;
    let judgeCalls = 0;
    const rounds = show.rounds.map((r, i) => {
        const index = i + 1;
        answerCalls += r.answers.length;
        if (r.answers.some((a) => !a.passed))
            judgeCalls += 1;
        return {
            index,
            topic: r.topic,
            answers: r.answers.map((a) => ({
                id: answerId(index, a.seatId),
                seatId: a.seatId,
                text: a.text,
                passed: a.passed,
                model: a.model,
                ...(a.passReason ? { passReason: a.passReason } : {}),
            })),
            verdicts: r.verdicts.map((v) => ({
                answerId: answerId(index, v.seatId),
                seatId: v.seatId,
                delta: v.delta,
                reason: v.reason,
            })),
            ledgerAfter: r.ledger,
        };
    });
    return {
        version: TRANSCRIPT_VERSION,
        seats: seatMeta,
        rounds,
        finalLedger: show.ledger,
        winners: show.winners,
        endedReason: show.endedReason,
        meta: { answerCalls, judgeCalls },
    };
}
/** 安定した整形 JSON へ直列化する。 */
export function toTranscriptJson(t) {
    return JSON.stringify(t, null, 2);
}
/**
 * 既存トランスクリプトを入力に、回答を再生成せず採点だけをやり直す（生成と採点の分離）。
 * 別モデルの審査関数を渡せば再採点になる。
 */
export async function rescoreTranscript(t, judge, order = identityOrder) {
    const ledger = new Ledger(t.seats.map((s) => s.id));
    const rounds = [];
    for (const round of t.rounds) {
        const live = round.answers
            .filter((a) => !a.passed)
            .map((a) => ({ seatId: a.seatId, text: a.text }));
        const verdicts = [];
        if (live.length > 0) {
            const { anonymized, labelToSeat } = anonymize(live, order(live.length));
            const labeled = await judge(round.topic, anonymized);
            for (const v of labeled) {
                const seatId = labelToSeat.get(v.label);
                if (!seatId)
                    continue;
                ledger.apply({ seatId, delta: v.delta, reason: v.reason });
                verdicts.push({
                    answerId: answerId(round.index, seatId),
                    seatId,
                    delta: v.delta,
                    reason: v.reason,
                });
            }
        }
        rounds.push({ index: round.index, verdicts });
    }
    return { rounds, ledger: ledger.snapshot() };
}
/** 人間スコアをトランスクリプトに付与する（同一 answerId で LLM 裁定と相関可能）。 */
export function attachHumanScores(t, scores) {
    return { ...t, humanScores: scores };
}
//# sourceMappingURL=transcript.js.map