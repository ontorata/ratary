import { describe, it, expect, beforeEach } from 'vitest';
import { LearningOrchestrator } from '../../src/learning/learning-orchestrator.js';
import { DefaultBehaviorAnalyticsEngine } from '../../src/learning/default-behavior-analytics-engine.js';
import { DefaultRankingLearningEngine } from '../../src/learning/default-ranking-learning-engine.js';
import type { ILearningEventStore } from '../../src/learning/ilearning-event-store.port.js';
import type { ILearningArtifactStore } from '../../src/learning/ilearning-artifact-store.port.js';
import type { LearningEvent, RankingPolicySnapshot } from '../../src/learning/learning.types.js';

describe('LearningOrchestrator', () => {
  let events: LearningEvent[];
  let savedSnapshots: RankingPolicySnapshot[];

  const eventStore: ILearningEventStore = {
    async append(event) {
      events.push({ ...event, processed: false });
    },
    async listUnprocessed(_scope, limit) {
      return events.filter((event) => !event.processed).slice(0, limit);
    },
    async markProcessed(ids) {
      events = events.map((event) =>
        ids.includes(event.id) ? { ...event, processed: true } : event,
      );
    },
  };

  const artifactStore: ILearningArtifactStore = {
    async saveRankingSnapshot(snapshot, options) {
      if (options?.activate) {
        savedSnapshots = [snapshot];
      }
    },
    async getActiveRankingSnapshot() {
      return savedSnapshots[0] ?? null;
    },
  };

  beforeEach(() => {
    events = [];
    savedSnapshots = [];
    for (let i = 0; i < 3; i++) {
      events.push({
        id: `e-${i}`,
        ownerId: 'owner-1',
        eventType: 'signal.explicit_feedback',
        payload: { value: 'helpful' },
        processed: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  it('dry-run does not persist snapshot or mark events processed', async () => {
    const orchestrator = new LearningOrchestrator({
      eventStore,
      artifactStore,
      behaviorAnalytics: new DefaultBehaviorAnalyticsEngine(),
      rankingLearning: new DefaultRankingLearningEngine(),
    });

    const report = await orchestrator.run({ ownerId: 'owner-1' }, { dryRun: true });
    expect(report.rankingSnapshot).toBeDefined();
    expect(savedSnapshots).toHaveLength(0);
    expect(events.every((event) => !event.processed)).toBe(true);
  });

  it('execute persists snapshot and marks events processed', async () => {
    const orchestrator = new LearningOrchestrator({
      eventStore,
      artifactStore,
      behaviorAnalytics: new DefaultBehaviorAnalyticsEngine(),
      rankingLearning: new DefaultRankingLearningEngine(),
    });

    const report = await orchestrator.run({ ownerId: 'owner-1' }, { dryRun: false });
    expect(report.eventsProcessed).toBe(3);
    expect(savedSnapshots).toHaveLength(1);
    expect(events.every((event) => event.processed)).toBe(true);
  });
});
