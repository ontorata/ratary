import { nowISO } from '../../../utils/memory-mapper.js';
import type {
  EventEnvelope,
  EventSubscription,
  IEventBus,
} from '../../../ports/events/ievent-bus.port.js';
import type { RedisStreamsGroupClient } from './redis-streams-client.interface.js';

export interface RedisStreamsEventBusConfig {
  streamPrefix: string;
  consumerGroup: string;
  consumerName: string;
}

interface ActiveSubscription {
  topic: string;
  handler: (event: EventEnvelope<unknown>) => Promise<void>;
  timer: ReturnType<typeof setInterval>;
}

/**
 * Redis Streams event bus implementing IEventBus (ADR-016).
 * At-least-once delivery via consumer groups; handlers must be idempotent.
 */
export class RedisStreamsEventBus implements IEventBus {
  private readonly subscriptions = new Map<string, ActiveSubscription[]>();

  constructor(
    private readonly client: RedisStreamsGroupClient,
    private readonly config: RedisStreamsEventBusConfig,
  ) {}

  async publish<T>(
    topic: string,
    payload: T,
    options?: { correlationId?: string },
  ): Promise<void> {
    const stream = this.streamKey(topic);
    const envelope: EventEnvelope<T> = {
      topic,
      payload,
      occurredAt: nowISO(),
      correlationId: options?.correlationId,
    };
    await this.client.xadd(stream, '*', 'payload', JSON.stringify(envelope));
  }

  async subscribe<T>(
    topic: string,
    handler: (event: EventEnvelope<T>) => Promise<void>,
  ): Promise<EventSubscription> {
    const stream = this.streamKey(topic);
    await this.ensureConsumerGroup(stream);

    const timer = setInterval(() => {
      void this.pollTopic(topic, handler as (event: EventEnvelope<unknown>) => Promise<void>);
    }, 250);

    const active: ActiveSubscription = {
      topic,
      handler: handler as (event: EventEnvelope<unknown>) => Promise<void>,
      timer,
    };

    const existing = this.subscriptions.get(topic) ?? [];
    existing.push(active);
    this.subscriptions.set(topic, existing);

    return {
      unsubscribe: async () => {
        clearInterval(timer);
        const list = this.subscriptions.get(topic) ?? [];
        this.subscriptions.set(
          topic,
          list.filter((entry) => entry !== active),
        );
      },
    };
  }

  private async pollTopic(
    topic: string,
    handler: (event: EventEnvelope<unknown>) => Promise<void>,
  ): Promise<void> {
    const stream = this.streamKey(topic);
    const response = await this.client.xreadgroup(
      this.config.consumerGroup,
      this.config.consumerName,
      10,
      100,
      'STREAMS',
      stream,
      '>',
    );

    if (!response) {
      return;
    }

    for (const [, entries] of response) {
      for (const [id, fields] of entries) {
        const payloadIndex = fields.indexOf('payload');
        if (payloadIndex === -1 || payloadIndex + 1 >= fields.length) {
          continue;
        }
        const raw = fields[payloadIndex + 1];
        const envelope = JSON.parse(raw) as EventEnvelope<unknown>;
        await handler(envelope);
        await this.client.xack(stream, this.config.consumerGroup, id);
      }
    }
  }

  private streamKey(topic: string): string {
    return `${this.config.streamPrefix}${topic}`;
  }

  private async ensureConsumerGroup(stream: string): Promise<void> {
    try {
      await this.client.xgroupCreate(stream, this.config.consumerGroup, '0', 'MKSTREAM');
    } catch {
      // Group already exists.
    }
  }
}
