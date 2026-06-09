// @ngs/tui 公開 API（観戦中継・配線・お題プラン）
export {
  narrateTopic,
  narrateAnswer,
  narrateVerdict,
  narrateWinners,
  buildRoundLines,
  type RoundView,
} from './narration.js';
export { buildShowWiring, offlineGenerate, type ShowWiring } from './wiring.js';
export { planTopics, type TopicPlan, type TopicMode } from './topicplan.js';
export { parseArgs, type CliOptions } from './cli.js';
export { ShowApp, type ShowAppProps } from './app.js';
