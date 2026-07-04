import type {
  IContextOptimizationEngine,
  IFeedbackLearningEngine,
  IKnowledgeDiscoveryEngine,
  ILearningDatasetExporter,
  ILearningEvaluationEngine,
  IMLProvider,
  IPatternMiner,
  IRecommendationEngine,
} from './ilearning-component-engines.interface.js';
import type { LearningScope } from './learning.types.js';

/** Stub engines for L23–L30 — registered in orchestrator, no-op until future waves. */

export class NoOpRecommendationEngine implements IRecommendationEngine {
  async recommend(_scope: LearningScope, _limit: number) {
    return [];
  }
}

export class NoOpPatternMiner implements IPatternMiner {
  async mine(_scope: LearningScope) {
    return [];
  }
}

export class NoOpKnowledgeDiscoveryEngine implements IKnowledgeDiscoveryEngine {
  async discover(_scope: LearningScope) {
    return [];
  }
}

export class NoOpFeedbackLearningEngine implements IFeedbackLearningEngine {
  async adapt(_scope: LearningScope) {
    return { adjusted: false, notes: 'Feedback learning deferred to L27.' };
  }
}

export class NoOpLearningDatasetExporter implements ILearningDatasetExporter {
  async export(_scope: LearningScope) {
    return { rowCount: 0, format: 'jsonl' };
  }
}

export class NoOpLearningEvaluationEngine implements ILearningEvaluationEngine {
  async evaluate(_scope: LearningScope) {
    return { score: 0, metrics: {} };
  }
}

export class NoOpContextOptimizationEngine implements IContextOptimizationEngine {
  async suggest(_scope: LearningScope) {
    return { notes: 'Context optimization deferred to L27.' };
  }
}

export class NoOpMLProvider implements IMLProvider {
  readonly providerId = 'noop';

  isAvailable(): boolean {
    return false;
  }
}
