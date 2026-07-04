import { describe, it, expect } from 'vitest';
import { InMemoryEventBus } from '../helpers/in-memory-event-bus.js';
import { DomainEventPublisher } from '../../src/events/domain-event-publisher.js';
import { DomainEventTopics } from '../../src/events/domain-event-topics.js';
import { processSignalIngest } from '../../src/ingest/process-signal-ingest.js';
import { DefaultSignalNormalizer } from '../../src/ingest/default-signal-normalizer.js';
import { MemorySignalIngestor } from '../../src/ingest/memory-signal-ingestor.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';

describe('processSignalIngest (D85-02)', () => {
  it('publishes memory.signal.received after successful ingest', async () => {
    const mockDb = new MockD1Client();
    const repository = createTestMemoryRepository(mockDb);
    const ownerId = 'owner-signal-bus';
    const memory = await repository.insert({
      title: 'Bus target',
      project: 'p',
      content: 'content',
      summary: 'summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-bus1',
      slug: 'bus-target',
      favorite: false,
      ownerId,
    });

    const bus = new InMemoryEventBus();
    const payloads: unknown[] = [];
    await bus.subscribe(DomainEventTopics.MEMORY_SIGNAL_RECEIVED, async (event) => {
      payloads.push(event.payload);
    });

    const publisher = new DomainEventPublisher(bus);
    const result = await processSignalIngest(
      { ownerId },
      {
        type: 'explicit_feedback',
        memoryId: memory.id,
        value: 'helpful',
      },
      {
        normalizer: new DefaultSignalNormalizer(),
        ingestor: new MemorySignalIngestor(repository),
        domainEventPublisher: publisher,
      },
    );

    expect(result.accepted).toBe(true);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      signalType: 'explicit_feedback',
      memoryId: memory.id,
      ownerId,
      accepted: true,
      appliedDelta: 5,
    });
  });
});
