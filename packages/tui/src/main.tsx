import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { type ShowResult, buildTranscript, bundledTopics, toTranscriptJson } from '@ngs/engine';
import { availableProviders } from '@ngs/providers';
import { render } from 'ink';
import { createElement } from 'react';
import { ShowApp } from './app.js';
import { type CliOptions, parseArgs } from './cli.js';
import { type TopicPlan, planTopics } from './topicplan.js';
import { buildShowWiring } from './wiring.js';

async function resolveTopicPlan(opts: CliOptions): Promise<TopicPlan> {
  if (opts.topic != null) return { mode: 'free', freeText: opts.topic, rounds: opts.rounds };
  if (opts.list != null) return { mode: 'list', listIndex: opts.list, rounds: opts.rounds };
  if (opts.random) return { mode: 'random', rounds: opts.rounds };
  if (!process.stdin.isTTY) return { mode: 'random', rounds: opts.rounds };

  // 対話: 自由入力 / 一覧から選ぶ / お任せ
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const choice = (
      await rl.question('お題の選び方を選んでください [1=自由入力 2=一覧 3=お任せ] (既定3): ')
    ).trim();
    if (choice === '1') {
      const text = (await rl.question('お題を入力: ')).trim();
      if (text) return { mode: 'free', freeText: text, rounds: opts.rounds };
    } else if (choice === '2') {
      const pool = bundledTopics();
      for (const [i, t] of pool.entries()) process.stdout.write(`  ${i + 1}. ${t.text}\n`);
      const n = Number((await rl.question('番号を選択: ')).trim());
      if (Number.isFinite(n) && n >= 1 && n <= pool.length) {
        return { mode: 'list', listIndex: n - 1, rounds: opts.rounds };
      }
    }
    return { mode: 'random', rounds: opts.rounds };
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const offline = opts.offline || availableProviders().length === 0;
  if (offline && !opts.offline) {
    process.stderr.write('APIキー未設定のため、オフラインデモで実行します。\n');
  }

  const wiring = buildShowWiring({ offline, timeoutMs: opts.timeoutMs });
  if (wiring.answerSeats.length === 0) {
    process.stderr.write('回答席がありません（利用可能なプロバイダがない）。\n');
    process.exit(1);
  }

  const plan = await resolveTopicPlan(opts);
  const poolLen = bundledTopics().length;
  const order = [...Array(poolLen).keys()].sort(() => Math.random() - 0.5);
  const topics = planTopics(plan, order);

  let resolveDone: (r: ShowResult) => void = () => {};
  const done = new Promise<ShowResult>((res) => {
    resolveDone = res;
  });

  const app = render(
    createElement(ShowApp, {
      wiring,
      topics,
      maxRounds: opts.rounds,
      prizeThreshold: opts.prizeThreshold,
      onDone: (r: ShowResult) => resolveDone(r),
    }),
  );

  const result = await done;
  const transcript = buildTranscript(result, wiring.answerSeats);
  writeFileSync(opts.out, toTranscriptJson(transcript), 'utf-8');

  app.unmount();
  await app.waitUntilExit();
  process.stdout.write(`\nトランスクリプトを ${opts.out} に出力しました。\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
