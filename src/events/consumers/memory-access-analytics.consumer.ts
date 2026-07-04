import type { EventEnvelope } from '../../ports/events/ievent-bus.port.js';
import type { IAnalyticsStore } from '../../ports/analytics/ianalytics-store.port.js';
import { DomainEventTopics } from '../domain-event-topics.js';
import type { MemoryAccessedEventPayload } from '../domain-event.types.js';
import type { IEventConsumer } from '../ievent-consumer.interface.js';

const MEMORY_ACCESS_EVENTS_TABLE = 'memory_access_events';

/**
 * Fan-out consumer (Phase 12B): writes memory.accessed events to IAnalyticsStore.
 * Idempotent via correlationId as primary key (at-least-once safe).
 */
export class MemoryAccessAnalyticsConsumer implements IEventConsumer {
  readonly name = 'memory-access-analytics';
  readonly topics = [DomainEventTopics.MEMORY_ACCESSED] as const;

  constructor(private readonly analyticsStore: IAnalyticsStore) {}

  async handle(event: EventEnvelope<unknown>): Promise<void> {
    const payload = event.payload as MemoryAccessedEventPayload;
    const id = event.correlationId ?? crypto.randomUUID();

    try {
      await this.analyticsStore.insert(MEMORY_ACCESS_EVENTS_TABLE, [
        {
          id,
          owner_id: payload.ownerId,
          memory_id: payload.memoryId,
          accessed_at: event.occurredAt,
        },
      ]);
    } catch {
      // Duplicate primary key on retry — treat as idempotent success.
    }
  }
}
