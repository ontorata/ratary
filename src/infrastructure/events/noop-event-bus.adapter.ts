import type {
  EventEnvelope,
  EventSubscription,
  IEventBus,
} from '../../ports/events/ievent-bus.port.js';

export class NoOpEventBus implements IEventBus {
  async publish<T>(_topic: string, _payload: T): Promise<void> {}

  async subscribe<T>(
    _topic: string,
    _handler: (event: EventEnvelope<T>) => Promise<void>,
  ): Promise<EventSubscription> {
    return { unsubscribe: async () => {} };
  }
}
