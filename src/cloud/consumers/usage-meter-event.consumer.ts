import type { EventEnvelope } from '../../ports/events/ievent-bus.port.js';
import { DomainEventTopics } from '../../events/domain-event-topics.js';
import type { IEventConsumer } from '../../events/ievent-consumer.interface.js';
import type { IUsageMeter } from '../ports/iusage-meter.port.js';
import type { UsageMetricType } from '../types/usage.types.js';

interface MemoryEventPayload {
  memoryId?: string;
  ownerId: string;
  workspaceId?: string | null;
  project?: string | null;
}

const TOPIC_TO_METRIC: Record<string, UsageMetricType> = {
  [DomainEventTopics.MEMORY_CREATED]: 'memory.created',
  [DomainEventTopics.MEMORY_UPDATED]: 'memory.updated',
  [DomainEventTopics.MEMORY_DELETED]: 'memory.deleted',
  [DomainEventTopics.MEMORY_ACCESSED]: 'memory.accessed',
};

/** Phase 12 event subscriber for billing usage export (ADR-033). */
export class UsageMeterEventConsumer implements IEventConsumer {
  readonly name = 'cloud-usage-meter';
  readonly topics = [
    DomainEventTopics.MEMORY_CREATED,
    DomainEventTopics.MEMORY_UPDATED,
    DomainEventTopics.MEMORY_DELETED,
    DomainEventTopics.MEMORY_ACCESSED,
  ] as const;

  constructor(private readonly usageMeter: IUsageMeter) {}

  async handle(event: EventEnvelope<unknown>): Promise<void> {
    const metricType = TOPIC_TO_METRIC[event.topic];
    if (!metricType) return;

    const payload = event.payload as MemoryEventPayload;
    await this.usageMeter.recordUsage({
      ownerId: payload.ownerId,
      workspaceId: payload.workspaceId ?? undefined,
      metricType,
      quantity: 1,
      occurredAt: event.occurredAt,
      correlationId: event.correlationId,
      metadata: {
        memoryId: payload.memoryId,
        project: payload.project,
      },
    });
  }
}
