import type { Env } from '../config/env.js';
import type { IEventBus } from '../ports/events/ievent-bus.port.js';
import type { IAnalyticsStore } from '../ports/analytics/ianalytics-store.port.js';
import type { IMemoryAccessAuditor } from '../ports/audit/imemory-access-auditor.port.js';
import { DomainEventPublisher } from '../events/domain-event-publisher.js';
import { EventConsumerRegistry } from '../events/event-consumer-registry.js';
import { EventConsumerRunner } from '../events/event-consumer-runner.js';
import { MemoryAccessAnalyticsConsumer } from '../events/consumers/memory-access-analytics.consumer.js';
import {
  MemoryDomainEventCoordinator,
  NoOpMemoryDomainEventCoordinator,
  type IMemoryDomainEventCoordinator,
} from '../events/memory-domain-event-coordinator.js';
import { EventPublishingMemoryAccessAuditor } from '../infrastructure/audit/event-publishing-memory-access-auditor.js';

export interface EventPipelinePorts {
  enabled: boolean;
  coordinator: IMemoryDomainEventCoordinator;
  runner: EventConsumerRunner | null;
  wrapMemoryAccessAuditor(auditor: IMemoryAccessAuditor): IMemoryAccessAuditor;
}

/**
 * Composition root for Phase 12 event pipeline (ADR-020).
 * Gated by EVENT_CONSUMERS_ENABLED; requires EVENT_BUS_PROVIDER=redis for fan-out.
 */
export function createEventPipelinePorts(
  env: Env,
  eventBus: IEventBus,
  analyticsStore: IAnalyticsStore,
): EventPipelinePorts {
  const passthroughAuditor = (auditor: IMemoryAccessAuditor): IMemoryAccessAuditor => auditor;

  if (!env.EVENT_CONSUMERS_ENABLED) {
    return {
      enabled: false,
      coordinator: new NoOpMemoryDomainEventCoordinator(),
      runner: null,
      wrapMemoryAccessAuditor: passthroughAuditor,
    };
  }

  const publisher = new DomainEventPublisher(eventBus);
  const coordinator = new MemoryDomainEventCoordinator(publisher);
  const registry = new EventConsumerRegistry();

  if (env.ANALYTICS_PROVIDER !== 'none') {
    registry.register(new MemoryAccessAnalyticsConsumer(analyticsStore));
  }

  const runner = new EventConsumerRunner(eventBus, registry);

  return {
    enabled: true,
    coordinator,
    runner,
    wrapMemoryAccessAuditor: (auditor) =>
      new EventPublishingMemoryAccessAuditor(auditor, publisher),
  };
}
