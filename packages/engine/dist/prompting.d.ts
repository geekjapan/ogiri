import type { AnonymizedAnswer, LabeledVerdict, Persona, Topic } from './types.js';
export interface ChatMessages {
    system: string;
    user: string;
}
/** 審査ルーブリック（grill 20260609 決定: 3 軸・等価重み）。 */
export declare const RUBRIC: {
    axes: readonly ["意外性", "お題適合", "言葉のキレ"];
    description: string;
};
/** 回答席（ペルソナ）への回答生成メッセージを作る。 */
export declare function buildAnswerMessages(persona: Persona, topic: Topic): ChatMessages;
/** 審査モデルへのブラインド審査メッセージを作る（素性は一切渡さない）。 */
export declare function buildJudgeMessages(topic: Topic, answers: AnonymizedAnswer[]): ChatMessages;
/**
 * 審査モデルの応答を構造化裁定へ変換する。
 * - delta を -1/0/1 にクランプ
 * - 未知ラベルは無視
 * - 欠落ラベルは delta 0 で補完
 * - パース不能なら全ラベル delta 0 にデグレード
 */
export declare function parseJudgeResponse(raw: string, validLabels: string[]): LabeledVerdict[];
