import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IEventBus } from '../ports/events/ievent-bus.port.js';
import { DomainEventPublisher } from '../events/domain-event-publisher.js';
import { DefaultSignalNormalizer } from '../ingest/default-signal-normalizer.js';
import { MemorySignalIngestor } from '../ingest/memory-signal-ingestor.js';
import type { IMemorySignalIngestor } from '../ingest/imemory-signal-ingestor.interface.js';
import type { ISignalNormalizer } from '../ingest/isignal-normalizer.interface.js';
import type { SignalIngestDeps } from '../ingest/process-signal-ingest.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { SqlMemorySignalStore } from '../infrastructure/signals/sql-memory-signal-store.js';
import type { LearningPorts } from './create-learning-ports.js';

export interface SignalIngestPorts {
  enabled: boolean;
  normalizer: ISignalNormalizer;
  ingestor: IMemorySignalIngestor;
  ingestDeps: SignalIngestDeps;
}

export function createSignalIngestPorts(
  sql: ISqlDatabase,
  env: Env,
  options?: {
    eventBus?: IEventBus;
    learningPorts?: LearningPorts;
  },
): SignalIngestPorts {
  const repository = new MemoryRepository(sql);
  const normalizer = new DefaultSignalNormalizer();
  const signalStore =
    env.SIGNAL_STORE_PROVIDER === 'sql' ? new SqlMemorySignalStore(sql) : undefined;
  const ingestor = new MemorySignalIngestor(repository, signalStore);
  const domainEventPublisher = options?.eventBus
    ? new DomainEventPublisher(options.eventBus)
    : undefined;

  const ingestDeps: SignalIngestDeps = {
    normalizer,
    ingestor,
    eventRecorder:
      options?.learningPorts?.enabled && options.learningPorts.eventRecorder
        ? options.learningPorts.eventRecorder
        : undefined,
    domainEventPublisher,
  };

  return {
    enabled: env.SIGNAL_INGEST_ENABLED,
    normalizer,
    ingestor,
    ingestDeps,
  };
}
