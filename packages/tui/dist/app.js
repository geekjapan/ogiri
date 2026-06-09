import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { runShow } from '@ngs/engine';
import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';
import { buildRoundLines, narrateWinners } from './narration.js';
/** 観戦モードの中継表示（engine のラウンドイベントを定型文で逐次表示）。 */
export function ShowApp(props) {
    const { wiring, topics, maxRounds, prizeThreshold, onDone } = props;
    const [lines, setLines] = useState([]);
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
                if (cancelled)
                    return;
                const add = buildRoundLines(i + 1, round, wiring.names);
                setLines((prev) => [...prev, ...add, '']);
            },
        }).then((result) => {
            if (cancelled)
                return;
            const winnerNames = result.winners.map((id) => wiring.names.get(id) ?? id);
            setLines((prev) => [...prev, narrateWinners(winnerNames)]);
            setFinished(true);
            onDone(result);
        });
        return () => {
            cancelled = true;
        };
    }, [wiring, topics, maxRounds, prizeThreshold, onDone]);
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "magenta", children: ["\uD83E\uDEAD \u7B11\u70B9\u30FB\u5927\u559C\u5229\uFF08LLM \u5927\u4F1A\uFF09", wiring.offline ? '［オフラインデモ］' : ''] }), lines.map((l, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 追記専用の中継ログ
            _jsx(Text, { children: l }, i))), finished && _jsx(Text, { dimColor: true, children: "\u2015 \u672C\u65E5\u306F\u304A\u958B\u304D \u2015" })] }));
}
//# sourceMappingURL=app.js.map