import type { LearningScope, LearningRunOptions, LearningRunReport } from './learning.types.js';

export interface ILearningOrchestrator {
  run(scope: LearningScope, options: LearningRunOptions): Promise<LearningRunReport>;
}
