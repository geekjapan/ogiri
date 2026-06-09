import { type ShowResult, runShow } from '@ngs/engine';
import React from 'react';
import type { ShowWiring } from './wiring.js';
export interface ShowAppProps {
    wiring: ShowWiring;
    topics: Parameters<typeof runShow>[0]['topics'];
    maxRounds: number;
    prizeThreshold: number;
    onDone: (result: ShowResult) => void;
}
/** 観戦モードの中継表示（engine のラウンドイベントを定型文で逐次表示）。 */
export declare function ShowApp(props: ShowAppProps): React.JSX.Element;
