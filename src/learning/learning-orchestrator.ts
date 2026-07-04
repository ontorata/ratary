import type { ILearningArtifactStore } from './ilearning-artifact-store.port.js';
import type { ILearningEventStore } from './ilearning-event-store.port.js';
import type { ILearningOrchestrator } from './ilearning-orchestrator.interface.js';
import type { IBehaviorAnalyticsEngine } from './ibehavior-analytics-engine.interface.js';
import type { IRankingLearningEngine } from './iranking-learning-engine.interface.js';
import type {
  IContextOptimizationEngine,
  IFeedbackLearningEngine,
  IKnowledgeDiscoveryEngine,
  ILearningDatasetExporter,
  ILearningEvaluationEngine,
  IPatternMiner,
  IRecommendationEngine,
} from './ilearning-component-engines.interface.js';
import { LEARNING_DEFAULT_EVENT_BATCH } from './learning.constants.js';
import type { LearningRunOptions, LearningRunReport, LearningScope } from './learning.types.js';

export interface LearningOrchestratorDeps {
  eventStore: ILearningEventStore;
  artifactStore: ILearningArtifactStore;
  behaviorAnalytics: IBehaviorAnalyticsEngine;
  rankingLearning: IRankingLearningEngine;
  recommendation?: IRecommendationEngine;
  patternMiner?: IPatternMiner;
  knowledgeDiscovery?: IKnowledgeDiscoveryEngine;
  feedbackLearning?: IFeedbackLearningEngine;
  datasetExporter?: ILearningDatasetExporter;
  evaluation?: ILearningEvaluationEngine;
  contextOptimization?: IContextOptimizationEngine;
}

export class LearningOrchestrator implements ILearningOrchestrator {
  constructor(private readonly deps: LearningOrchestratorDeps) {}

  async run(scope: LearningScope, options: LearningRunOptions): Promise<LearningRunReport> {
    const limit = options.limit ?? LEARNING_DEFAULT_EVENT_BATCH;
    const events = await this.deps.eventStore.listUnprocessed(scope, limit);
    const analytics = this.deps.behaviorAnalytics.summarize(events);
    const rankingSnapshot = this.deps.rankingLearning.compute(scope, events);

    const [recommendations, patterns] = await Promise.all([
      this.deps.recommendation?.recommend(scope, events, 10) ?? Promise.resolve([]),
      this.deps.patternMiner?.mine(scope, events) ?? Promise.resolve([]),
    ]);

    await this.deps.knowledgeDiscovery?.discover(scope, events);
    await this.deps.feedbackLearning?.adapt(scope, events, analytics);
    await this.deps.contextOptimization?.suggest(scope, events, rankingSnapshot);
    await this.deps.datasetExporter?.export(scope, events);
    await this.deps.evaluation?.evaluate(scope, events, analytics);

    if (!options.dryRun) {
      if (rankingSnapshot) {
        await this.deps.artifactStore.saveRankingSnapshot(rankingSnapshot, { activate: true });
      }
      if (events.length > 0) {
        await this.deps.eventStore.markProcessed(events.map((event) => event.id));
      }
    }

    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      eventsProcessed: events.length,
      analytics,
      rankingSnapshot: rankingSnapshot ?? undefined,
      recommendationsGenerated: recommendations.length,
      patternsDiscovered: patterns.length,
    };
  }
}
