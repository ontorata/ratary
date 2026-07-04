import type { LearningScope } from './learning.types.js';

export interface RecommendationItem {
  memoryId: string;
  score: number;
  reason: string;
}

export interface IRecommendationEngine {
  recommend(scope: LearningScope, limit: number): Promise<RecommendationItem[]>;
}

export interface IPatternMiner {
  mine(scope: LearningScope): Promise<{ patternId: string; description: string; count: number }[]>;
}

export interface IKnowledgeDiscoveryEngine {
  discover(scope: LearningScope): Promise<{ topic: string; memoryIds: string[] }[]>;
}

export interface IFeedbackLearningEngine {
  adapt(scope: LearningScope): Promise<{ adjusted: boolean; notes: string }>;
}

export interface ILearningDatasetExporter {
  export(scope: LearningScope): Promise<{ rowCount: number; format: string }>;
}

export interface ILearningEvaluationEngine {
  evaluate(scope: LearningScope): Promise<{ score: number; metrics: Record<string, number> }>;
}

export interface IContextOptimizationEngine {
  suggest(scope: LearningScope): Promise<{ retrievalPolicyVersion?: string; notes: string }>;
}

export interface IMLProvider {
  readonly providerId: string;
  isAvailable(): boolean;
}
