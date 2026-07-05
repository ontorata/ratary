import type { ILearningArtifactStore } from '../learning/ilearning-artifact-store.port.js';
import type { IRankingLearningEngine } from '../learning/iranking-learning-engine.interface.js';
import type {
  LearningEvent,
  LearningScope,
  RankingPolicySnapshot,
} from '../learning/learning.types.js';
import type { IMemorySignalStore } from '../ports/signals/imemory-signal-store.port.js';
import type { MemoryQualitySignal } from './memory-quality-signal.types.js';

export interface SignalReflectionOptions {
  dryRun: boolean;
  limit?: number;
}

export interface SignalReflectionReport {
  ownerId: string;
  workspaceId?: string;
  dryRun: boolean;
  signalsScanned: number;
  feedbackEvents: number;
  rankingSnapshot?: RankingPolicySnapshot;
}

function signalToLearningEvent(signal: MemoryQualitySignal): LearningEvent {
  const eventType =
    signal.signalType === 'explicit_feedback'
      ? 'signal.explicit_feedback'
      : signal.signalType === 'consolidation_hint'
        ? 'signal.consolidation_hint'
        : 'signal.access';

  return {
    id: signal.signalId,
    ownerId: signal.ownerId,
    workspaceId: signal.workspaceId,
    eventType,
    payload: {
      memoryId: signal.memoryId,
      ...(signal.payload ?? {}),
    },
    processed: false,
    createdAt: signal.observedAt,
  };
}

/**
 * Batch reflection over persisted quality signals (D85-03).
 * Computes ranking weight snapshot from aggregated feedback; persists when not dry-run.
 */
export class SignalReflectionRunner {
  constructor(
    private readonly signalStore: IMemorySignalStore,
    private readonly rankingEngine: IRankingLearningEngine,
    private readonly artifactStore?: ILearningArtifactStore,
  ) {}

  async run(
    scope: LearningScope,
    options: SignalReflectionOptions,
  ): Promise<SignalReflectionReport> {
    const limit = options.limit ?? 500;
    const signals = await this.signalStore.listByScope(scope, limit);
    const events = signals.map(signalToLearningEvent);
    const feedbackEvents = events.filter(
      (event) => event.eventType === 'signal.explicit_feedback',
    ).length;
    const rankingSnapshot = this.rankingEngine.compute(scope, events) ?? undefined;

    if (!options.dryRun && rankingSnapshot && this.artifactStore) {
      await this.artifactStore.saveRankingSnapshot(rankingSnapshot, { activate: true });
    }

    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      signalsScanned: signals.length,
      feedbackEvents,
      rankingSnapshot,
    };
  }
}
