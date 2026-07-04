import type {
  IContextOptimizationEngine,
  IFeedbackLearningEngine,
  IKnowledgeDiscoveryEngine,
  ILearningDatasetExporter,
  ILearningEvaluationEngine,
  IPatternMiner,
  IRecommendationEngine,
  RecommendationItem,
} from './ilearning-component-engines.interface.js';
import type {
  BehaviorAnalyticsSummary,
  LearningEvent,
  LearningScope,
  RankingPolicySnapshot,
} from './learning.types.js';
import { LEARNING_MIN_FEEDBACK_EVENTS } from './learning.constants.js';

function memoryIdFromEvent(event: LearningEvent): string | null {
  const id = event.payload.memoryId ?? event.payload.memory_id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

/** L24 — ranks memories from explicit feedback events in the current batch. */
export class DefaultRecommendationEngine implements IRecommendationEngine {
  async recommend(
    scope: LearningScope,
    events: readonly LearningEvent[],
    limit: number,
  ): Promise<RecommendationItem[]> {
    const scores = new Map<string, { score: number; helpful: number; notHelpful: number }>();

    for (const event of events) {
      if (event.eventType !== 'signal.explicit_feedback') continue;
      const memoryId = memoryIdFromEvent(event);
      if (!memoryId) continue;

      const entry = scores.get(memoryId) ?? { score: 0, helpful: 0, notHelpful: 0 };
      const value = event.payload.value;
      if (value === 'helpful') {
        entry.helpful += 1;
        entry.score += 2;
      } else if (value === 'not_helpful') {
        entry.notHelpful += 1;
        entry.score -= 1;
      }
      scores.set(memoryId, entry);
    }

    return [...scores.entries()]
      .filter(([, stats]) => stats.score > 0)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([memoryId, stats]) => ({
        memoryId,
        score: stats.score,
        reason: `helpful=${stats.helpful}, not_helpful=${stats.notHelpful} (owner=${scope.ownerId})`,
      }));
  }
}

/** L23 — mines recurring event-type patterns in the batch. */
export class DefaultPatternMiner implements IPatternMiner {
  async mine(_scope: LearningScope, events: readonly LearningEvent[]): Promise<
    { patternId: string; description: string; count: number }[]
  > {
    const byType = new Map<string, number>();
    for (const event of events) {
      byType.set(event.eventType, (byType.get(event.eventType) ?? 0) + 1);
    }

    return [...byType.entries()]
      .filter(([, count]) => count >= 2)
      .map(([eventType, count]) => ({
        patternId: `pattern:${eventType}`,
        description: `Repeated ${eventType} events`,
        count,
      }));
  }
}

/** L25 — groups memory ids by project tag from event payloads. */
export class DefaultKnowledgeDiscoveryEngine implements IKnowledgeDiscoveryEngine {
  async discover(_scope: LearningScope, events: readonly LearningEvent[]): Promise<
    { topic: string; memoryIds: string[] }[]
  > {
    const byProject = new Map<string, Set<string>>();

    for (const event of events) {
      const memoryId = memoryIdFromEvent(event);
      if (!memoryId) continue;
      const project =
        typeof event.payload.project === 'string' && event.payload.project.length > 0
          ? event.payload.project
          : 'default';
      const bucket = byProject.get(project) ?? new Set<string>();
      bucket.add(memoryId);
      byProject.set(project, bucket);
    }

    return [...byProject.entries()]
      .filter(([, ids]) => ids.size >= 2)
      .map(([topic, ids]) => ({ topic, memoryIds: [...ids] }));
  }
}

/** L27 — adapts when enough helpful feedback exists in batch. */
export class DefaultFeedbackLearningEngine implements IFeedbackLearningEngine {
  async adapt(_scope: LearningScope, events: readonly LearningEvent[], analytics: BehaviorAnalyticsSummary) {
    const adjusted =
      analytics.helpfulFeedbackCount >= LEARNING_MIN_FEEDBACK_EVENTS &&
      analytics.helpfulFeedbackCount > analytics.notHelpfulFeedbackCount;
    return {
      adjusted,
      notes: adjusted
        ? `Feedback ratio favors helpful (${analytics.helpfulFeedbackCount}/${events.length} events)`
        : 'Insufficient helpful feedback for adaptation',
    };
  }
}

/** L28 — suggests retrieval policy version when ranking snapshot exists. */
export class DefaultContextOptimizationEngine implements IContextOptimizationEngine {
  async suggest(
    _scope: LearningScope,
    _events: readonly LearningEvent[],
    rankingSnapshot?: RankingPolicySnapshot | null,
  ) {
    if (!rankingSnapshot) {
      return { notes: 'No active ranking snapshot — use default retrieval weights' };
    }
    return {
      retrievalPolicyVersion: `ranking:${rankingSnapshot.snapshotId}`,
      notes: `Apply snapshot v${rankingSnapshot.version} multipliers`,
    };
  }
}

/** L29 — exports event batch metadata (no external file IO). */
export class DefaultLearningDatasetExporter implements ILearningDatasetExporter {
  async export(_scope: LearningScope, events: readonly LearningEvent[]) {
    return { rowCount: events.length, format: 'jsonl' };
  }
}

/** L30 — evaluates batch quality from analytics summary. */
export class DefaultLearningEvaluationEngine implements ILearningEvaluationEngine {
  async evaluate(_scope: LearningScope, events: readonly LearningEvent[], analytics: BehaviorAnalyticsSummary) {
    const totalFeedback = analytics.helpfulFeedbackCount + analytics.notHelpfulFeedbackCount;
    const helpfulRatio = totalFeedback > 0 ? analytics.helpfulFeedbackCount / totalFeedback : 0;
    return {
      score: helpfulRatio,
      metrics: {
        totalEvents: analytics.totalEvents,
        unprocessedEvents: analytics.unprocessedEvents,
        helpfulRatio,
        eventTypes: Object.keys(analytics.eventsByType).length,
        batchSize: events.length,
      },
    };
  }
}
