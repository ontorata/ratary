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
import type {
  BehaviorAnalyticsSummary,
  LearningEvent,
  LearningScope,
  RankingPolicySnapshot,
} from './learning.types.js';

/** Stub engines — fallback when learning engine disabled. */

export class NoOpRecommendationEngine implements IRecommendationEngine {
  async recommend(_scope: LearningScope, _events: readonly LearningEvent[], _limit: number) {
    return [];
  }
}

export class NoOpPatternMiner implements IPatternMiner {
  async mine(_scope: LearningScope, _events: readonly LearningEvent[]) {
    return [];
  }
}

export class NoOpKnowledgeDiscoveryEngine implements IKnowledgeDiscoveryEngine {
  async discover(_scope: LearningScope, _events: readonly LearningEvent[]) {
    return [];
  }
}

export class NoOpFeedbackLearningEngine implements IFeedbackLearningEngine {
  async adapt(
    _scope: LearningScope,
    _events: readonly LearningEvent[],
    _analytics: BehaviorAnalyticsSummary,
  ) {
    return { adjusted: false, notes: 'Feedback learning disabled.' };
  }
}

export class NoOpLearningDatasetExporter implements ILearningDatasetExporter {
  async export(_scope: LearningScope, _events: readonly LearningEvent[]) {
    return { rowCount: 0, format: 'jsonl' };
  }
}

export class NoOpLearningEvaluationEngine implements ILearningEvaluationEngine {
  async evaluate(
    _scope: LearningScope,
    _events: readonly LearningEvent[],
    _analytics: BehaviorAnalyticsSummary,
  ) {
    return { score: 0, metrics: {} };
  }
}

export class NoOpContextOptimizationEngine implements IContextOptimizationEngine {
  async suggest(
    _scope: LearningScope,
    _events: readonly LearningEvent[],
    _rankingSnapshot?: RankingPolicySnapshot | null,
  ) {
    return { notes: 'Context optimization disabled.' };
  }
}

export class NoOpMLProvider implements IMLProvider {
  readonly providerId = 'noop';

  isAvailable(): boolean {
    return false;
  }
}
