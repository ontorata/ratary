import type {
  EventEnvelope,
  EventSubscription,
  IEventBus,
} from '../../src/ports/events/ievent-bus.port.js';

type Handler = (event: EventEnvelope<unknown>) => Promise<void>;

/**
 * In-process event bus for unit tests — delivers publish to subscribers synchronously.
 */
export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<Handler>>();

  async publish<T>(
    topic: string,
    payload: T,
    options?: { correlationId?: string },
  ): Promise<void> {
    const event: EventEnvelope<T> = {
      topic,
      payload,
      occurredAt: new Date().toISOString(),
      correlationId: options?.correlationId,
    };

    const topicHandlers = this.handlers.get(topic);
    if (!topicHandlers) {
      return;
    }

    await Promise.all([...topicHandlers].map((handler) => handler(event as EventEnvelope<unknown>)));
  }

  async subscribe<T>(
    topic: string,
    handler: (event: EventEnvelope<T>) => Promise<void>,
  ): Promise<EventSubscription> {
    const wrapped: Handler = (event) => handler(event as EventEnvelope<T>);
    const set = this.handlers.get(topic) ?? new Set<Handler>();
    set.add(wrapped);
    this.handlers.set(topic, set);

    return {
      unsubscribe: async () => {
        set.delete(wrapped);
      },
    };
  }
}
