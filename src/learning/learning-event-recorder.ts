import type { MemoryQualitySignal } from '../ingest/memory-quality-signal.types.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { IngestResult } from '../ingest/memory-quality-signal.types.js';
import type { ILearningEventStore } from './ilearning-event-store.port.js';
import type { LearningEventType } from './learning.types.js';

function mapSignalType(signalType: MemoryQualitySignal['signalType']): LearningEventType {
  switch (signalType) {
    case 'explicit_feedback':
      return 'signal.explicit_feedback';
    case 'access':
      return 'signal.access';
    case 'consolidation_hint':
      return 'signal.consolidation_hint';
    default:
      return 'signal.access';
  }
}

export class LearningEventRecorder {
  constructor(private readonly eventStore: ILearningEventStore) {}

  async recordFromSignal(
    scope: MemoryScope,
    signal: MemoryQualitySignal,
    result: IngestResult,
  ): Promise<void> {
    if (!result.accepted || result.duplicate) {
      return;
    }

    await this.eventStore.append({
      id: crypto.randomUUID(),
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      eventType: mapSignalType(signal.signalType),
      payload: {
        signalId: signal.signalId,
        memoryId: signal.memoryId,
        appliedDelta: result.appliedDelta ?? 0,
        ...(signal.payload ?? {}),
      },
      createdAt: signal.observedAt ?? new Date().toISOString(),
    });
  }
}
