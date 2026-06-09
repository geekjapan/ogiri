import { PERSONA_TEMPLATES, getPersona } from './personas.js';
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
export const DEFAULT_ANSWER_BINDINGS: readonly SeatBinding[] = [
  { personaId: 'dokuzetsu', model: { provider: 'anthropic', model: 'claude-sonnet-4-6' } },
  { personaId: 'tennen', model: { provider: 'openai', model: 'gpt-4.1' } },
  { personaId: 'baka', model: { provider: 'google', model: 'gemini-2.0-flash' } },
] as const;

/** 既定の審査席（回答席のいずれとも別系統の第 4 モデル）。 */
export const DEFAULT_JUDGE_BINDING: SeatBinding = {
  personaId: 'interi',
  model: { provider: 'google', model: 'gemini-2.0-pro' },
};

/**
 * バインディングから席を構築する。
 * 利用不可（キー未設定）プロバイダの席はスキップ。未知ペルソナはエラー。
 */
export function buildSeats(
  bindings: readonly SeatBinding[],
  isAvailable: ProviderAvailable,
  pool: readonly Persona[] = PERSONA_TEMPLATES,
): Seat[] {
  return bindings
    .filter((b) => isAvailable(b.model.provider))
    .map((b) => ({
      id: b.personaId,
      persona: getPersona(b.personaId, pool),
      model: b.model,
    }));
}

/** 審査席のモデルが回答席のどのモデルとも異なる（別系統）か。 */
export function judgeIsDistinct(judge: Seat, answerSeats: Seat[]): boolean {
  return !answerSeats.some(
    (s) => s.model.provider === judge.model.provider && s.model.model === judge.model.model,
  );
}
