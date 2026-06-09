import { type ShowResult, runShow } from '@ngs/engine';
import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';
import { buildRoundLines, narrateWinners } from './narration.js';
import type { ShowWiring } from './wiring.js';

export interface ShowAppProps {
  wiring: ShowWiring;
  topics: Parameters<typeof runShow>[0]['topics'];
  maxRounds: number;
  prizeThreshold: number;
  onDone: (result: ShowResult) => void;
}

/** 観戦モードの中継表示（engine のラウンドイベントを定型文で逐次表示）。 */
export function ShowApp(props: ShowAppProps) {
  const { wiring, topics, maxRounds, prizeThreshold, onDone } = props;
  const [lines, setLines] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    runShow({
      topics,
      seats: wiring.answerSeats,
      answer: wiring.answer,
      judge: wiring.judge,
      maxRounds,
      prizeThreshold,
      onRound: (round, i) => {
        if (cancelled) return;
        const add = buildRoundLines(i + 1, round, wiring.names);
        setLines((prev) => [...prev, ...add, '']);
      },
    }).then((result) => {
      if (cancelled) return;
      const winnerNames = result.winners.map((id) => wiring.names.get(id) ?? id);
      setLines((prev) => [...prev, narrateWinners(winnerNames)]);
      setFinished(true);
      onDone(result);
    });
    return () => {
      cancelled = true;
    };
  }, [wiring, topics, maxRounds, prizeThreshold, onDone]);

  return (
    <Box flexDirection="column">
      <Text color="magenta">
        🪭 笑点・大喜利（LLM 大会）{wiring.offline ? '［オフラインデモ］' : ''}
      </Text>
      {lines.map((l, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 追記専用の中継ログ
        <Text key={i}>{l}</Text>
      ))}
      {finished && <Text dimColor>― 本日はお開き ―</Text>}
    </Box>
  );
}
