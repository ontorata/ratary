import { describe, it, expect, beforeEach } from 'vitest';
import { SignalReflectionRunner } from '../../src/ingest/signal-reflection-runner.js';
import { DefaultRankingLearningEngine } from '../../src/learning/default-ranking-learning-engine.js';
import { LEARNING_MIN_FEEDBACK_EVENTS } from '../../src/learning/learning.constants.js';
import type { IMemorySignalStore } from '../../src/ports/signals/imemory-signal-store.port.js';
import type { MemoryQualitySignal } from '../../src/ingest/memory-quality-signal.types.js';
import type { ILearningArtifactStore } from '../../src/learning/ilearning-artifact-store.port.js';

class InMemorySignalStore implements IMemorySignalStore {
  constructor(private readonly signals: MemoryQualitySignal[]) {}

  async exists(_signalId: string): Promise<boolean> {
    return false;
  }

  async append(_signal: MemoryQualitySignal): Promise<void> {}

  async listByScope(
    scope: { ownerId: string; workspaceId?: string },
    limit = 500,
  ): Promise<MemoryQualitySignal[]> {
    return this.signals
      .filter(
        (signal) =>
          signal.ownerId === scope.ownerId &&
          (!scope.workspaceId || signal.workspaceId === scope.workspaceId),
      )
      .slice(0, limit);
  }
}

describe('SignalReflectionRunner (D85-03)', () => {
  let savedSnapshots: number;

  beforeEach(() => {
    savedSnapshots = 0;
  });

  function artifactStore(): ILearningArtifactStore {
    return {
      saveRankingSnapshot: async () => {
        savedSnapshots++;
      },
      getActiveRankingSnapshot: async () => null,
    };
  }

  function feedbackSignals(count: number, ownerId: string): MemoryQualitySignal[] {
    return Array.from({ length: count }, (_, index) => ({
      signalId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      signalType: 'explicit_feedback' as const,
      memoryId: `00000000-0000-4000-8000-${String(index + 100).padStart(12, '0')}`,
      ownerId,
      payload: { value: index % 2 === 0 ? 'helpful' : 'not_helpful' },
      observedAt: new Date().toISOString(),
    }));
  }

  it('dry-run computes snapshot without persisting', async () => {
    const runner = new SignalReflectionRunner(
      new InMemorySignalStore(feedbackSignals(LEARNING_MIN_FEEDBACK_EVENTS, 'owner-a')),
      new DefaultRankingLearningEngine(),
      artifactStore(),
    );

    const report = await runner.run({ ownerId: 'owner-a' }, { dryRun: true });
    expect(report.signalsScanned).toBe(LEARNING_MIN_FEEDBACK_EVENTS);
    expect(report.rankingSnapshot).toBeDefined();
    expect(savedSnapshots).toBe(0);
  });

  it('execute persists ranking snapshot when enough feedback exists', async () => {
    const runner = new SignalReflectionRunner(
      new InMemorySignalStore(feedbackSignals(LEARNING_MIN_FEEDBACK_EVENTS, 'owner-b')),
      new DefaultRankingLearningEngine(),
      artifactStore(),
    );

    const report = await runner.run({ ownerId: 'owner-b' }, { dryRun: false });
    expect(report.rankingSnapshot).toBeDefined();
    expect(savedSnapshots).toBe(1);
  });
});
