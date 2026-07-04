import type { EventSubscription, IEventBus } from '../ports/events/ievent-bus.port.js';
import type { EventConsumerRegistry } from './event-consumer-registry.js';

export class EventConsumerRunner {
  private subscriptions: EventSubscription[] = [];

  constructor(
    private readonly eventBus: IEventBus,
    private readonly registry: EventConsumerRegistry,
  ) {}

  async start(): Promise<void> {
    if (this.subscriptions.length > 0) {
      return;
    }

    for (const consumer of this.registry.list()) {
      for (const topic of consumer.topics) {
        const subscription = await this.eventBus.subscribe(topic, async (event) => {
          await consumer.handle(event);
        });
        this.subscriptions.push(subscription);
      }
    }
  }

  async stop(): Promise<void> {
    await Promise.all(this.subscriptions.map((subscription) => subscription.unsubscribe()));
    this.subscriptions = [];
  }
}
