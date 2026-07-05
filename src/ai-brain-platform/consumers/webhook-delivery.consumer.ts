import type { EventEnvelope } from '../../ports/events/ievent-bus.port.js';
import type { IEventConsumer } from '../../events/ievent-consumer.interface.js';
import { DomainEventTopics } from '../../events/domain-event-topics.js';
import type { IWebhookDispatcher } from '../ports/iwebhook-dispatcher.port.js';
import type { IWebhookSubscriptionStore } from '../ports/iwebhook-subscription-store.port.js';
import type {
  MemoryAccessedEventPayload,
  MemoryCreatedEventPayload,
} from '../../events/domain-event.types.js';

const WEBHOOK_TOPICS = [
  DomainEventTopics.MEMORY_CREATED,
  DomainEventTopics.MEMORY_UPDATED,
  DomainEventTopics.MEMORY_DELETED,
  DomainEventTopics.MEMORY_ACCESSED,
  DomainEventTopics.MEMORY_SIGNAL_RECEIVED,
] as const;

function ownerIdFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const ownerId = (payload as { ownerId?: string }).ownerId;
  return ownerId ?? null;
}

/** Fan-out domain events to registered webhook subscriptions (Phase 24). */
export class WebhookDeliveryConsumer implements IEventConsumer {
  readonly name = 'webhook-delivery';
  readonly topics = WEBHOOK_TOPICS;

  constructor(
    private readonly store: IWebhookSubscriptionStore,
    private readonly dispatcher: IWebhookDispatcher,
  ) {}

  async handle(event: EventEnvelope<unknown>): Promise<void> {
    const ownerId = ownerIdFromPayload(event.payload);
    if (!ownerId) return;

    const subscriptions = await this.store.findActiveByTopic(event.topic, ownerId);
    await Promise.all(subscriptions.map((sub) => this.dispatcher.dispatch(sub, event)));
  }
}

export type { MemoryCreatedEventPayload, MemoryAccessedEventPayload };
