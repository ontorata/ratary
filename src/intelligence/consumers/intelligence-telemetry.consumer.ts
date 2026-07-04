import type { EventEnvelope } from '../../ports/events/ievent-bus.port.js';
import type { IEventConsumer } from '../../events/ievent-consumer.interface.js';
import { DomainEventTopics } from '../../events/domain-event-topics.js';
import type { ITelemetryRecorder } from '../telemetry/ports/itelemetry.port.js';
import type {
  MemoryAccessedEventPayload,
  MemoryCreatedEventPayload,
  MemoryUpdatedEventPayload,
} from '../../events/domain-event.types.js';

const TELEMETRY_TOPICS = [
  DomainEventTopics.MEMORY_CREATED,
  DomainEventTopics.MEMORY_UPDATED,
  DomainEventTopics.MEMORY_ACCESSED,
] as const;

function scopeFromPayload(payload: unknown): {
  ownerId?: string;
  workspaceId?: string;
} {
  if (!payload || typeof payload !== 'object') return {};
  const p = payload as { ownerId?: string; workspaceId?: string };
  return { ownerId: p.ownerId, workspaceId: p.workspaceId };
}

/** Maps Phase 12 domain events to semantic telemetry (Phase 25 / ADR-037). */
export class IntelligenceTelemetryConsumer implements IEventConsumer {
  readonly name = 'intelligence-telemetry';
  readonly topics = TELEMETRY_TOPICS;

  constructor(private readonly recorder: ITelemetryRecorder) {}

  async handle(event: EventEnvelope<unknown>): Promise<void> {
    const scope = scopeFromPayload(event.payload);
    if (!scope.ownerId) return;

    switch (event.topic) {
      case DomainEventTopics.MEMORY_CREATED: {
        const payload = event.payload as MemoryCreatedEventPayload;
        this.recorder.record(
          {
            type: 'MemoryCreated',
            memoryId: payload.memoryId,
          },
          scope,
        );
        break;
      }
      case DomainEventTopics.MEMORY_UPDATED: {
        const payload = event.payload as MemoryUpdatedEventPayload;
        this.recorder.record(
          {
            type: 'MemoryUpdated',
            memoryId: payload.memoryId,
          },
          scope,
        );
        break;
      }
      case DomainEventTopics.MEMORY_ACCESSED: {
        const payload = event.payload as MemoryAccessedEventPayload;
        this.recorder.record(
          {
            type: 'MemoryAccessed',
            memoryId: payload.memoryId,
            accessPath: payload.source,
          },
          scope,
        );
        break;
      }
      default:
        break;
    }
  }
}
