export { DomainEventTopics, type DomainEventTopic } from './domain-event-topics.js';
export type {
  MemoryCreatedEventPayload,
  MemoryUpdatedEventPayload,
  MemoryDeletedEventPayload,
  MemoryAccessedEventPayload,
  MemorySignalReceivedEventPayload,
} from './domain-event.types.js';
export type { IDomainEventPublisher } from './idomain-event-publisher.port.js';
export { DomainEventPublisher } from './domain-event-publisher.js';
export type { IEventConsumer } from './ievent-consumer.interface.js';
export { EventConsumerRegistry } from './event-consumer-registry.js';
export { EventConsumerRunner } from './event-consumer-runner.js';
export {
  MemoryDomainEventCoordinator,
  NoOpMemoryDomainEventCoordinator,
  type IMemoryDomainEventCoordinator,
} from './memory-domain-event-coordinator.js';
export { MemoryAccessAnalyticsConsumer } from './consumers/memory-access-analytics.consumer.js';
