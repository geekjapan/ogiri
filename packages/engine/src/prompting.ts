import type { AnonymizedAnswer, LabeledVerdict, Persona, Topic } from './types.js';

export interface ChatMessages {
  system: string;
  user: string;
}

/** 審査ルーブリック（grill 20260609 決定: 3 軸・等価重み）。 */
export const RUBRIC = {
  axes: ['意外性', 'お題適合', '言葉のキレ'] as const,
  description:
    '各回答を「意外性」「お題適合」「言葉のキレ」の 3 軸（等価）で評価する。' +
    '総合で見て、座布団を与える(+1)・現状維持(0)・没収(-1)を決める。' +
    'お題を無視している、または明確に不適切な回答は 0 または没収(-1)とする。',
};

/** 回答席（ペルソナ）への回答生成メッセージを作る。 */
export function buildAnswerMessages(persona: Persona, topic: Topic): ChatMessages {
  const fewShot = persona.fewShot.map((ex) => `- ${ex}`).join('\n');
  const fewShotBlock = fewShot ? `\n参考(芸風の例):\n${fewShot}\n` : '';
  const system = `あなたは大喜利の回答者「${persona.name}」です。
芸風: ${persona.style}
口調: ${persona.speech}
得意技: ${persona.specialty}
${fewShotBlock}
お題に対し、短く笑いを狙った回答を1つだけ返してください。説明や前置きは不要です。`;
  const user = `お題: ${topic.text}`;
  return { system, user };
}

/** 審査モデルへのブラインド審査メッセージを作る（素性は一切渡さない）。 */
export function buildJudgeMessages(topic: Topic, answers: AnonymizedAnswer[]): ChatMessages {
  const list = answers.map((a) => `${a.label}: ${a.text}`).join('\n');
  const system = `あなたは大喜利の審査員です。回答者が誰か・どのモデルかは伏せられています。回答の中身だけで公平に裁定してください。
${RUBRIC.description}
出力は次の JSON のみ（前後に説明やコードフェンスを付けない）:
{"verdicts":[{"label":"回答1","delta":1,"reason":"理由"}]}
delta は -1, 0, 1 のいずれか。reason は簡潔に。`;
  const user = `お題: ${topic.text}\n\n回答一覧:\n${list}`;
  return { system, user };
}

interface RawVerdict {
  label?: unknown;
  delta?: unknown;
  reason?: unknown;
}

function clampDelta(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n === 0) return 0;
  return n > 0 ? 1 : -1;
}

function extractJson(text: string): unknown {
  // コードフェンス除去 → 最初の { から最後の } までを試す
  const stripped = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) throw new Error('JSON が見つからない');
  return JSON.parse(stripped.slice(start, end + 1));
}

/**
 * 審査モデルの応答を構造化裁定へ変換する。
 * - delta を -1/0/1 にクランプ
 * - 未知ラベルは無視
 * - 欠落ラベルは delta 0 で補完
 * - パース不能なら全ラベル delta 0 にデグレード
 */
export function parseJudgeResponse(raw: string, validLabels: string[]): LabeledVerdict[] {
  let parsed: RawVerdict[];
  try {
    const obj = extractJson(raw) as { verdicts?: unknown };
    if (!Array.isArray(obj.verdicts)) throw new Error('verdicts が配列でない');
    parsed = obj.verdicts as RawVerdict[];
  } catch {
    return validLabels.map((label) => ({ label, delta: 0, reason: 'パース不能' }));
  }

  const byLabel = new Map<string, LabeledVerdict>();
  for (const v of parsed) {
    const label = typeof v.label === 'string' ? v.label : '';
    if (!validLabels.includes(label)) continue; // 未知ラベルは無視
    byLabel.set(label, {
      label,
      delta: clampDelta(v.delta),
      reason: typeof v.reason === 'string' ? v.reason : '',
    });
  }
  // 欠落ラベルを 0 で補完し、validLabels の順で返す
  return validLabels.map((label) => byLabel.get(label) ?? { label, delta: 0, reason: '' });
}
