import type { Persona } from './types.js';
/**
 * 初期ペルソナセット（オマージュ）。
 * 実名・実在回答は使わず、笑点メンバーのキャラ性（毒舌/天然/バカ担当/インテリ/シュール）に寄せた架空キャラ。
 * few-shot はオリジナル/合成のみ。ユーザーが変更・追加可能（loadPersonas 経由）。
 */
export declare const PERSONA_TEMPLATES: readonly Persona[];
export declare function getPersona(id: string, pool?: readonly Persona[]): Persona;
/**
 * 初期テンプレートにユーザー定義のペルソナを重ねて読み込む。
 * 同 id は上書き（変更）、新 id は追加。設定/データ由来の overrides を渡す。
 */
export declare function loadPersonas(overrides?: readonly Persona[]): Persona[];
