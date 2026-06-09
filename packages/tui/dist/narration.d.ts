export declare function narrateTopic(round: number, topicText: string): string;
export declare function narrateAnswer(name: string, answer: {
    text: string;
    passed: boolean;
    passReason?: string;
}): string;
/** 座布団の動きを山田くんコールにする。動きなし(0)は null（出さない）。 */
export declare function narrateVerdict(name: string, delta: number, countAfter: number): string | null;
export declare function narrateWinners(names: string[]): string;
/** engine のラウンド結果に近い最小形（tui が依存する読み取り専用ビュー）。 */
export interface RoundView {
    topic: {
        text: string;
    };
    answers: {
        seatId: string;
        text: string;
        passed: boolean;
        passReason?: string;
    }[];
    verdicts: {
        seatId: string;
        delta: number;
    }[];
    ledger: Record<string, number>;
}
/** 1 ラウンドを中継台本の行列へ整形する（お題→各回答→座布団の動き）。 */
export declare function buildRoundLines(index: number, round: RoundView, names: Map<string, string>): string[];
