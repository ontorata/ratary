import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { SqlLearningEventStore } from '../infrastructure/learning/sql-learning-event-store.js';
import { SqlLearningArtifactStore } from '../infrastructure/learning/sql-learning-artifact-store.js';
import { DefaultBehaviorAnalyticsEngine } from '../learning/default-behavior-analytics-engine.js';
import { DefaultRankingLearningEngine } from '../learning/default-ranking-learning-engine.js';
import { LearningOrchestrator } from '../learning/learning-orchestrator.js';
import { LearningEventRecorder } from '../learning/learning-event-recorder.js';
import type { ILearningOrchestrator } from '../learning/ilearning-orchestrator.interface.js';
import type { ILearningEventStore } from '../learning/ilearning-event-store.port.js';
import type { ILearningArtifactStore } from '../learning/ilearning-artifact-store.port.js';
import {
  NoOpContextOptimizationEngine,
  NoOpFeedbackLearningEngine,
  NoOpKnowledgeDiscoveryEngine,
  NoOpLearningDatasetExporter,
  NoOpLearningEvaluationEngine,
  NoOpMLProvider,
  NoOpPatternMiner,
  NoOpRecommendationEngine,
} from '../learning/noop-learning-engines.js';
import { NoOpLearningOrchestrator } from '../learning/noop-learning-orchestrator.js';

export interface LearningPorts {
  enabled: boolean;
  orchestrator: ILearningOrchestrator;
  eventStore?: ILearningEventStore;
  artifactStore?: ILearningArtifactStore;
  eventRecorder?: LearningEventRecorder;
}

/**
 * Composition root for Phase 8.6 Learning Intelligence Engine (ADR-057).
 * Gated by LEARNING_ENGINE_ENABLED; SQL stores when LEARNING_STORE_PROVIDER=sql.
 */
export function createLearningPorts(sql: ISqlDatabase, env: Env): LearningPorts {
  if (!env.LEARNING_ENGINE_ENABLED || env.LEARNING_STORE_PROVIDER !== 'sql') {
    return { enabled: false, orchestrator: new NoOpLearningOrchestrator() };
  }

  const behaviorAnalytics = new DefaultBehaviorAnalyticsEngine();
  const rankingLearning = new DefaultRankingLearningEngine();
  const eventStore = new SqlLearningEventStore(sql);
  const artifactStore = new SqlLearningArtifactStore(sql);

  return {
    enabled: true,
    orchestrator: new LearningOrchestrator({
      eventStore,
      artifactStore,
      behaviorAnalytics,
      rankingLearning,
      recommendation: new NoOpRecommendationEngine(),
      patternMiner: new NoOpPatternMiner(),
      knowledgeDiscovery: new NoOpKnowledgeDiscoveryEngine(),
      feedbackLearning: new NoOpFeedbackLearningEngine(),
      datasetExporter: new NoOpLearningDatasetExporter(),
      evaluation: new NoOpLearningEvaluationEngine(),
      contextOptimization: new NoOpContextOptimizationEngine(),
    }),
    eventStore,
    artifactStore,
    eventRecorder: new LearningEventRecorder(eventStore),
  };
}

export function createMLProviderRegistry(): NoOpMLProvider[] {
  return [new NoOpMLProvider()];
}
