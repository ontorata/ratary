import { describe, it, expect, beforeEach } from 'vitest';
import { MemorySignalIngestor } from '../../src/ingest/memory-signal-ingestor.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';
import { SqlMemorySignalStore } from '../../src/infrastructure/signals/sql-memory-signal-store.js';

describe('MemorySignalIngestor', () => {
  let ingestor: MemorySignalIngestor;
  let repository: ReturnType<typeof createTestMemoryRepository>;
  const ownerId = 'owner-signals';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    ingestor = new MemorySignalIngestor(repository, new SqlMemorySignalStore(mockDb));
  });

  async function seedMemory(importance = 50): Promise<string> {
    const memory = await repository.insert({
      title: 'Signal target',
      project: 'p',
      content: 'content',
      summary: 'summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance,
      language: 'id',
      notes: '',
      codename: 'NOTE-0001',
      slug: 'signal-target',
      favorite: false,
      ownerId,
    });
    return memory.id;
  }

  it('applies helpful feedback and rejects duplicate signalId', async () => {
    const memoryId = await seedMemory(50);
    const signalId = crypto.randomUUID();

    const first = await ingestor.ingest(
      { ownerId },
      {
        signalId,
        signalType: 'explicit_feedback',
        memoryId,
        ownerId,
        payload: { value: 'helpful' },
        observedAt: new Date().toISOString(),
      },
    );

    expect(first.accepted).toBe(true);
    expect(first.appliedDelta).toBe(5);

    const updated = await repository.findById(memoryId, ownerId);
    expect(updated?.importance).toBe(55);

    const duplicate = await ingestor.ingest(
      { ownerId },
      {
        signalId,
        signalType: 'explicit_feedback',
        memoryId,
        ownerId,
        payload: { value: 'helpful' },
        observedAt: new Date().toISOString(),
      },
    );

    expect(duplicate.duplicate).toBe(true);
  });
});
