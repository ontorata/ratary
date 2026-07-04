import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { DefaultSignalNormalizer } from '../ingest/default-signal-normalizer.js';
import { MemorySignalIngestor } from '../ingest/memory-signal-ingestor.js';
import type { IMemorySignalIngestor } from '../ingest/imemory-signal-ingestor.interface.js';
import type { ISignalNormalizer } from '../ingest/isignal-normalizer.interface.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { SqlMemorySignalStore } from '../infrastructure/signals/sql-memory-signal-store.js';

export interface SignalIngestPorts {
  enabled: boolean;
  normalizer: ISignalNormalizer;
  ingestor: IMemorySignalIngestor;
}

export function createSignalIngestPorts(sql: ISqlDatabase, env: Env): SignalIngestPorts {
  const repository = new MemoryRepository(sql);
  const normalizer = new DefaultSignalNormalizer();
  const signalStore =
    env.SIGNAL_STORE_PROVIDER === 'sql' ? new SqlMemorySignalStore(sql) : undefined;

  return {
    enabled: env.SIGNAL_INGEST_ENABLED,
    normalizer,
    ingestor: new MemorySignalIngestor(repository, signalStore),
  };
}
