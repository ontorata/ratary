import type {
  BehaviorAnalyticsSummary,
  LearningEvent,
  LearningScope,
  RankingPolicySnapshot,
} from './learning.types.js';

export interface RecommendationItem {
  memoryId: string;
  score: number;
  reason: string;
}

export interface IRecommendationEngine {
  recommend(
    scope: LearningScope,
    events: readonly LearningEvent[],
    limit: number,
  ): Promise<RecommendationItem[]>;
}

export interface IPatternMiner {
  mine(
    scope: LearningScope,
    events: readonly LearningEvent[],
  ): Promise<{ patternId: string; description: string; count: number }[]>;
}

export interface IKnowledgeDiscoveryEngine {
  discover(
    scope: LearningScope,
    events: readonly LearningEvent[],
  ): Promise<{ topic: string; memoryIds: string[] }[]>;
}

export interface IFeedbackLearningEngine {
  adapt(
    scope: LearningScope,
    events: readonly LearningEvent[],
    analytics: BehaviorAnalyticsSummary,
  ): Promise<{ adjusted: boolean; notes: string }>;
}

export interface ILearningDatasetExporter {
  export(
    scope: LearningScope,
    events: readonly LearningEvent[],
  ): Promise<{ rowCount: number; format: string }>;
}

export interface ILearningEvaluationEngine {
  evaluate(
    scope: LearningScope,
    events: readonly LearningEvent[],
    analytics: BehaviorAnalyticsSummary,
  ): Promise<{ score: number; metrics: Record<string, number> }>;
}

export interface IContextOptimizationEngine {
  suggest(
    scope: LearningScope,
    events: readonly LearningEvent[],
    rankingSnapshot?: RankingPolicySnapshot | null,
  ): Promise<{ retrievalPolicyVersion?: string; notes: string }>;
}

export interface IMLProvider {
  readonly providerId: string;
  isAvailable(): boolean;
}
