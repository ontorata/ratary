import type { EventEnvelope } from '../ports/events/ievent-bus.port.js';

export interface IEventConsumer {
  readonly name: string;
  readonly topics: readonly string[];
  handle(event: EventEnvelope<unknown>): Promise<void>;
}
