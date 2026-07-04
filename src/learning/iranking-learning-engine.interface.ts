import type { LearningEvent, LearningScope, RankingPolicySnapshot } from './learning.types.js';

export interface IRankingLearningEngine {
  compute(scope: LearningScope, events: readonly LearningEvent[]): RankingPolicySnapshot | null;
}
