import type { Topic } from './types.js';

/**
 * 同梱お題リスト（汎用・センシティブ題材は避ける）。MVP では各お題は独立。
 * 自由入力（topicFromText）と併存。
 */
export const BUNDLED_TOPICS: readonly string[] = [
  'もしも猫が総理大臣になったら、最初にやりそうなこと',
  'こんな自動販売機は売れない',
  '宇宙人が地球に来て最初にがっかりしたこと',
  'もしも財布が喋ったら言いそうな一言',
  '新発売、まったく役に立たない家電のキャッチコピー',
  'タイムマシンで過去に戻ってまずやること（しょうもないやつ）',
  'こんな桃太郎は嫌だ',
  '上司がロボットになった日のあるある',
  '辞書に新しく載った、ありそうでない言葉とその意味',
  'もしも重力が今より弱かったら困ること',
  '魔法が使えるようになったが、しょぼい魔法だった。何ができる？',
  'コンビニの新サービス、絶対に流行らないやつ',
  '犬が人間の言葉を話せたら、最初に文句を言いそうなこと',
  '未来の小学校の校則',
  'こんな勇者は魔王に勝てない',
  '朝起きたら有名人になっていた。困ること',
  '張り紙「ここで〇〇しないでください」、ありえない〇〇',
  '最新スマホの、誰も望んでいない新機能',
  'もしも一日だけ透明人間になれたら、ださい使い道',
  '神様がうっかり作ってしまった生き物',
] as const;

/** お題リストを Topic[] に変換（id を付与）。 */
export function bundledTopics(texts: readonly string[] = BUNDLED_TOPICS): Topic[] {
  return texts.map((text, i) => ({ id: `bundled-${i + 1}`, text }));
}

/** 自由入力のテキストから Topic を作る。 */
export function topicFromText(text: string): Topic {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('お題テキストが空です');
  return { id: 'free', text: trimmed };
}

/**
 * 順序付きのお題列を用意する。`pick` で先頭から count 件を取り出す。
 * order=[...] を渡すとその並びを使う（「お任せ」時のシャッフルなど）。
 */
export function takeTopics(topics: Topic[], count: number, order?: number[]): Topic[] {
  const indexed = order ?? topics.map((_, i) => i);
  return indexed
    .map((i) => topics[i])
    .filter((t): t is Topic => t !== undefined)
    .slice(0, count);
}
