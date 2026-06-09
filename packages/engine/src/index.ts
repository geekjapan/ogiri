// @ngs/engine 公開 API（UI・プロバイダ非依存の中核）
export type {
  AnonymizedAnswer,
  Answer,
  AnswerFn,
  AnswerResult,
  JudgeFn,
  LabeledVerdict,
  ModelRef,
  Persona,
  Seat,
  Topic,
  Verdict,
} from './types.js';
export { Ledger, type LedgerEntry } from './ledger.js';
export { anonymize, identityOrder, type AnonInput, type AnonymizeResult } from './anonymize.js';
export { runRound, type RoundConfig, type RoundResult } from './round.js';
export { runShow, type ShowConfig, type ShowResult } from './show.js';
export { PERSONA_TEMPLATES, getPersona, loadPersonas } from './personas.js';
export {
  BUNDLED_TOPICS,
  bundledTopics,
  topicFromText,
  takeTopics,
} from './topics.js';
export {
  DEFAULT_ANSWER_BINDINGS,
  DEFAULT_JUDGE_BINDING,
  buildSeats,
  judgeIsDistinct,
  type SeatBinding,
  type ProviderAvailable,
} from './seating.js';
export {
  RUBRIC,
  buildAnswerMessages,
  buildJudgeMessages,
  parseJudgeResponse,
  type ChatMessages,
} from './prompting.js';
export {
  TRANSCRIPT_VERSION,
  buildTranscript,
  toTranscriptJson,
  rescoreTranscript,
  attachHumanScores,
  type Transcript,
  type TranscriptSeat,
  type TranscriptAnswer,
  type TranscriptVerdict,
  type TranscriptRound,
  type HumanScore,
  type ScoredResult,
} from './transcript.js';
