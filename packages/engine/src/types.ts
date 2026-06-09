// 大喜利エンジンの中核ドメイン型（UI・プロバイダ非依存の共有コントラクト）

/** ペルソナ（芸風）。Model とは直交。実名・実在回答は用いない。 */
export interface Persona {
  /** 安定した識別子 */
  id: string;
  /** 表示名（架空名/オマージュ名。実名は使わない） */
  name: string;
  /** 芸風の説明（system prompt 素材） */
  style: string;
  /** 口調 */
  speech: string;
  /** 得意技 */
  specialty: string;
  /** オリジナル/合成の few-shot 例（実在回答の転載は禁止） */
  fewShot: string[];
}

/** 駆動 LLM の参照。Persona とは直交。 */
export interface ModelRef {
  /** プロバイダ識別子（'anthropic' | 'openai' | 'google' など） */
  provider: string;
  /** モデル ID */
  model: string;
}

/** 席。`Seat = Persona × Model` のバインディング。 */
export interface Seat {
  /** 内部 ID（匿名化と台帳のキー。審査には渡さない） */
  id: string;
  persona: Persona;
  model: ModelRef;
}

/** お題。MVP では各お題は独立（席をまたぐ依存を持たない）。 */
export interface Topic {
  id: string;
  text: string;
}

/** 回答席への呼び出し結果。失敗（パス）も値で表す。 */
export type AnswerResult = { ok: true; text: string } | { ok: false; reason: string };

/** ラウンドに記録される回答（パスを含む）。 */
export interface Answer {
  seatId: string;
  /** 回答テキスト。パス時は空。 */
  text: string;
  /** true なら呼び出し失敗によるパス。 */
  passed: boolean;
  /** 駆動モデル名（記録用） */
  model: string;
  /** パス理由（passed=true のときのみ） */
  passReason?: string;
}

/** 審査の裁定（座布団変動と理由）。 */
export interface Verdict {
  seatId: string;
  /** 座布団変動（+1 付与 / 0 / -1 没収）。 */
  delta: number;
  reason: string;
}

/** 回答席へお題を投げて回答を得る関数（LLM 実装は providers 側、テストはスタブ）。 */
export type AnswerFn = (topic: Topic, seat: Seat) => Promise<AnswerResult>;

/** 匿名化された 1 回答（審査モデルへ渡す単位。素性は含まない）。 */
export interface AnonymizedAnswer {
  /** 匿名ラベル（例: '回答1'）。内部 seatId とは別。 */
  label: string;
  text: string;
}

/** 匿名ラベルごとの裁定（engine が内部 seatId へ復元する）。 */
export interface LabeledVerdict {
  label: string;
  delta: number;
  reason: string;
}

/** 審査関数（匿名回答群を受け取り、匿名ラベルごとの裁定を返す）。 */
export type JudgeFn = (topic: Topic, answers: AnonymizedAnswer[]) => Promise<LabeledVerdict[]>;
