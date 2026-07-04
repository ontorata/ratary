import type { LearningScope, RankingPolicySnapshot } from './learning.types.js';

export interface ILearningArtifactStore {
  saveRankingSnapshot(
    snapshot: RankingPolicySnapshot,
    options?: { activate?: boolean },
  ): Promise<void>;
  getActiveRankingSnapshot(scope: LearningScope): Promise<RankingPolicySnapshot | null>;
}
