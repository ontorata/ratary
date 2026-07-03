/**
 * Vendor-neutral async event distribution port.
 * Adapters: Kafka, RabbitMQ, NATS, Redis Streams, Cloudflare Queues.
 * @see docs/adr/008-platform-architecture.md
 */
export interface EventEnvelope<TPayload = unknown> {
  topic: string;
  payload: TPayload;
  occurredAt: string;
  correlationId?: string;
}

export interface EventSubscription {
  unsubscribe(): Promise<void>;
}

export interface IEventBus {
  publish<T>(
    topic: string,
    payload: T,
    options?: { correlationId?: string },
  ): Promise<void>;
  subscribe<T>(
    topic: string,
    handler: (event: EventEnvelope<T>) => Promise<void>,
  ): Promise<EventSubscription>;
}
