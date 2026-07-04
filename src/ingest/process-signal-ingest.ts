import type { DomainEventPublisher } from '../events/domain-event-publisher.js';
import type { LearningEventRecorder } from '../learning/learning-event-recorder.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { ValidationError } from '../types/errors.js';
import type { IMemorySignalIngestor } from './imemory-signal-ingestor.interface.js';
import type { ISignalNormalizer } from './isignal-normalizer.interface.js';
import type { IngestResult } from './memory-quality-signal.types.js';

export interface SignalIngestDeps {
  normalizer: ISignalNormalizer;
  ingestor: IMemorySignalIngestor;
  eventRecorder?: LearningEventRecorder;
  domainEventPublisher?: DomainEventPublisher;
}

export async function processSignalIngest(
  scope: MemoryScope,
  raw: unknown,
  deps: SignalIngestDeps,
): Promise<IngestResult> {
  const signal = deps.normalizer.normalize(raw, {
    ownerId: scope.ownerId,
    workspaceId: scope.workspaceId,
  });

  if (!signal) {
    throw new ValidationError('Invalid signal payload');
  }

  const result = await deps.ingestor.ingest(scope, signal);

  if (result.accepted && !result.duplicate) {
    if (deps.eventRecorder) {
      await deps.eventRecorder.recordFromSignal(scope, signal, result);
    }
    if (deps.domainEventPublisher) {
      await deps.domainEventPublisher.publishMemorySignalReceived(scope, signal, result);
    }
  }

  return result;
}
