import { describe, it, expect } from 'vitest';
import {
  DefaultRecommendationEngine,
  DefaultPatternMiner,
  DefaultKnowledgeDiscoveryEngine,
  DefaultFeedbackLearningEngine,
  DefaultLearningEvaluationEngine,
} from '../../src/learning/default-learning-component-engines.js';
import { DefaultBehaviorAnalyticsEngine } from '../../src/learning/default-behavior-analytics-engine.js';
import { DefaultRankingLearningEngine } from '../../src/learning/default-ranking-learning-engine.js';
import { LearningOrchestrator } from '../../src/learning/learning-orchestrator.js';
import type { LearningEvent } from '../../src/learning/learning.types.js';
import type { ILearningEventStore } from '../../src/learning/ilearning-event-store.port.js';
import type { ILearningArtifactStore } from '../../src/learning/ilearning-artifact-store.port.js';

describe('DefaultLearningComponentEngines (D86-01–03)', () => {
  const scope = { ownerId: 'owner-1' };
  const events: LearningEvent[] = [
    {
      id: 'e1',
      ownerId: 'owner-1',
      eventType: 'signal.explicit_feedback',
      payload: { memoryId: 'm1', value: 'helpful' },
      processed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'e2',
      ownerId: 'owner-1',
      eventType: 'signal.explicit_feedback',
      payload: { memoryId: 'm1', value: 'helpful', project: 'ai-brain' },
      processed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'e3',
      ownerId: 'owner-1',
      eventType: 'signal.explicit_feedback',
      payload: { memoryId: 'm2', value: 'helpful', project: 'ai-brain' },
      processed: false,
      createdAt: new Date().toISOString(),
    },
  ];

  it('recommends memories from helpful feedback', async () => {
    const engine = new DefaultRecommendationEngine();
    const items = await engine.recommend(scope, events, 5);
    expect(items[0]?.memoryId).toBe('m1');
    expect(items[0]?.score).toBeGreaterThan(0);
  });

  it('mines repeated event patterns', async () => {
    const miner = new DefaultPatternMiner();
    const patterns = await miner.mine(scope, events);
    expect(patterns.some((p) => p.patternId.includes('explicit_feedback'))).toBe(true);
  });

  it('discovers topics by project', async () => {
    const discovery = new DefaultKnowledgeDiscoveryEngine();
    const topics = await discovery.discover(scope, events);
    expect(topics.some((t) => t.topic === 'ai-brain' && t.memoryIds.length >= 2)).toBe(true);
  });
});

describe('Learning pipeline E2E (D86-04)', () => {
  it('signal events → orchestrator → ranking snapshot', async () => {
    let events: LearningEvent[] = [];
    let savedSnapshot: import('../../src/learning/learning.types.js').RankingPolicySnapshot | null =
      null;

    const eventStore: ILearningEventStore = {
      async append(event) {
        events.push({ ...event, processed: false });
      },
      async listUnprocessed(_scope, limit) {
        return events.filter((e) => !e.processed).slice(0, limit);
      },
      async markProcessed(ids) {
        events = events.map((e) => (ids.includes(e.id) ? { ...e, processed: true } : e));
      },
    };

    const artifactStore: ILearningArtifactStore = {
      async saveRankingSnapshot(snapshot, options) {
        if (options?.activate) savedSnapshot = snapshot;
      },
      async getActiveRankingSnapshot() {
        return savedSnapshot;
      },
    };

    for (let i = 0; i < 3; i++) {
      await eventStore.append({
        id: `fb-${i}`,
        ownerId: 'owner-1',
        eventType: 'signal.explicit_feedback',
        payload: { memoryId: `mem-${i}`, value: 'helpful' },
        createdAt: new Date().toISOString(),
      });
    }

    const orchestrator = new LearningOrchestrator({
      eventStore,
      artifactStore,
      behaviorAnalytics: new DefaultBehaviorAnalyticsEngine(),
      rankingLearning: new DefaultRankingLearningEngine(),
      recommendation: new DefaultRecommendationEngine(),
      patternMiner: new DefaultPatternMiner(),
      knowledgeDiscovery: new DefaultKnowledgeDiscoveryEngine(),
      feedbackLearning: new DefaultFeedbackLearningEngine(),
      evaluation: new DefaultLearningEvaluationEngine(),
    });

    const report = await orchestrator.run({ ownerId: 'owner-1' }, { dryRun: false });
    expect(report.eventsProcessed).toBe(3);
    expect(report.rankingSnapshot).toBeDefined();
    expect(savedSnapshot).not.toBeNull();
    expect(report.recommendationsGenerated).toBeGreaterThan(0);
    expect(events.every((e) => e.processed)).toBe(true);
  });
});
