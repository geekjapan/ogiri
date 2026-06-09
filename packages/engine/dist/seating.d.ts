import type { ModelRef, Persona, Seat } from './types.js';
/** ペルソナとモデルの結びつけ（席の設計図）。 */
export interface SeatBinding {
    personaId: string;
    model: ModelRef;
}
/** プロバイダが利用可能か（API キー有無）を判定する述語。providers 側から注入。 */
export type ProviderAvailable = (provider: string) => boolean;
/**
 * MVP 既定の回答席構成（grill 20260609 決定）: 回答 3 席。
 * モデル ID は設定で上書き可能な既定値（環境で調整する想定）。
 */
export declare const DEFAULT_ANSWER_BINDINGS: readonly SeatBinding[];
/** 既定の審査席（回答席のいずれとも別系統の第 4 モデル）。 */
export declare const DEFAULT_JUDGE_BINDING: SeatBinding;
/**
 * バインディングから席を構築する。
 * 利用不可（キー未設定）プロバイダの席はスキップ。未知ペルソナはエラー。
 */
export declare function buildSeats(bindings: readonly SeatBinding[], isAvailable: ProviderAvailable, pool?: readonly Persona[]): Seat[];
/** 審査席のモデルが回答席のどのモデルとも異なる（別系統）か。 */
export declare function judgeIsDistinct(judge: Seat, answerSeats: Seat[]): boolean;
