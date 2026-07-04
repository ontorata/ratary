import type { IEventConsumer } from './ievent-consumer.interface.js';

export class EventConsumerRegistry {
  private readonly consumers: IEventConsumer[] = [];

  register(consumer: IEventConsumer): void {
    this.consumers.push(consumer);
  }

  list(): readonly IEventConsumer[] {
    return this.consumers;
  }
}
