import { describe, it, expect, beforeEach } from 'vitest';
import { MemorySignalIngestor } from '../../src/ingest/memory-signal-ingestor.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';
import { SqlMemorySignalStore } from '../../src/infrastructure/signals/sql-memory-signal-store.js';

describe('MemorySignalIngestor inspection_outcome (8.8A)', () => {
  let ingestor: MemorySignalIngestor;
  const ownerId = 'owner-inspection';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    const repository = createTestMemoryRepository(mockDb);
    ingestor = new MemorySignalIngestor(repository, new SqlMemorySignalStore(mockDb));
  });

  it('accepts inspection_outcome without memoryId', async () => {
    const result = await ingestor.ingest(
      { ownerId },
      {
        signalId: crypto.randomUUID(),
        signalType: 'inspection_outcome',
        ownerId,
        payload: {
          kind: 'inspection_outcome',
          source: 'forge_inspect',
          severity: 'major',
          category: 'testing',
          resolved: true,
        },
        observedAt: new Date().toISOString(),
      },
    );

    expect(result.accepted).toBe(true);
    expect(result.appliedDelta).toBe(0);
  });

  it('dedupes inspection_outcome by signalId', async () => {
    const signalId = crypto.randomUUID();
    const signal = {
      signalId,
      signalType: 'inspection_outcome' as const,
      ownerId,
      payload: {
        kind: 'inspection_outcome',
        source: 'mcp' as const,
        severity: 'critical' as const,
        category: 'boundary' as const,
        resolved: true,
      },
      observedAt: new Date().toISOString(),
    };

    const first = await ingestor.ingest({ ownerId }, signal);
    const second = await ingestor.ingest({ ownerId }, signal);

    expect(first.accepted).toBe(true);
    expect(second.duplicate).toBe(true);
  });
});
