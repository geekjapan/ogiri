import type { ShowResult } from './show.js';
import type { JudgeFn, Seat, Topic } from './types.js';
export declare const TRANSCRIPT_VERSION = 1;
export interface TranscriptSeat {
    id: string;
    personaId: string;
    personaName: string;
    provider: string;
    model: string;
}
export interface TranscriptAnswer {
    /** 一意 ID（例: 'r1:s1'）。 */
    id: string;
    seatId: string;
    text: string;
    passed: boolean;
    model: string;
    passReason?: string;
}
export interface TranscriptVerdict {
    /** 対象回答の一意 ID。 */
    answerId: string;
    seatId: string;
    delta: number;
    reason: string;
}
export interface TranscriptRound {
    index: number;
    topic: Topic;
    answers: TranscriptAnswer[];
    verdicts: TranscriptVerdict[];
    ledgerAfter: Record<string, number>;
}
export interface HumanScore {
    answerId: string;
    score: number;
}
export interface Transcript {
    version: number;
    seats: TranscriptSeat[];
    rounds: TranscriptRound[];
    finalLedger: Record<string, number>;
    winners: string[];
    endedReason: ShowResult['endedReason'];
    meta: {
        /** 回答席への LLM 呼び出し回数。 */
        answerCalls: number;
        /** 審査の LLM 呼び出し回数。 */
        judgeCalls: number;
    };
    /** 後付けの人間スコア（LLM 裁定と同じ answerId で相関可能）。 */
    humanScores?: HumanScore[];
}
/** ShowResult と席情報から構造化トランスクリプトを組み立てる。秘匿情報は含めない。 */
export declare function buildTranscript(show: ShowResult, seats: Seat[]): Transcript;
/** 安定した整形 JSON へ直列化する。 */
export declare function toTranscriptJson(t: Transcript): string;
export interface ScoredResult {
    rounds: {
        index: number;
        verdicts: TranscriptVerdict[];
    }[];
    ledger: Record<string, number>;
}
/**
 * 既存トランスクリプトを入力に、回答を再生成せず採点だけをやり直す（生成と採点の分離）。
 * 別モデルの審査関数を渡せば再採点になる。
 */
export declare function rescoreTranscript(t: Transcript, judge: JudgeFn, order?: (n: number) => number[]): Promise<ScoredResult>;
/** 人間スコアをトランスクリプトに付与する（同一 answerId で LLM 裁定と相関可能）。 */
export declare function attachHumanScores(t: Transcript, scores: HumanScore[]): Transcript;
