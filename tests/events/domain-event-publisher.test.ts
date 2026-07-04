import { describe, it, expect } from 'vitest';
import { DomainEventPublisher } from '../../src/events/domain-event-publisher.js';
import { DomainEventTopics } from '../../src/events/domain-event-topics.js';
import { InMemoryEventBus } from '../helpers/in-memory-event-bus.js';
import type { Memory } from '../../src/types/memory.js';

const sampleMemory: Memory = {
  id: 'mem-1',
  codename: null,
  slug: null,
  title: 'Test',
  project: 'ai-brain',
  content: 'content',
  summary: '',
  tags: [],
  keywords: [],
  category: '',
  memoryType: 'note',
  importance: 50,
  language: 'en',
  notes: '',
  favorite: false,
  archived: false,
  ownerId: 'owner-1',
  projectId: 'ai-brain',
  level: 'note',
  lastAccessed: null,
  accessCount: 0,
  embeddingId: null,
  objectKey: null,
  semanticHash: null,
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
};

describe('DomainEventPublisher (Phase 12)', () => {
  it('publishes memory.created without throwing on noop failures', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];
    await bus.subscribe(DomainEventTopics.MEMORY_CREATED, async (event) => {
      received.push((event.payload as { memoryId: string }).memoryId);
    });

    const publisher = new DomainEventPublisher(bus);
    await publisher.publishMemoryCreated({ ownerId: 'owner-1' }, sampleMemory);

    expect(received).toEqual(['mem-1']);
  });

  it('publishes memory.signal.received (D85-02)', async () => {
    const bus = new InMemoryEventBus();
    const payloads: unknown[] = [];
    await bus.subscribe(DomainEventTopics.MEMORY_SIGNAL_RECEIVED, async (event) => {
      payloads.push(event.payload);
    });

    const publisher = new DomainEventPublisher(bus);
    await publisher.publishMemorySignalReceived(
      { ownerId: 'owner-1' },
      {
        signalId: 'sig-1',
        signalType: 'explicit_feedback',
        memoryId: 'mem-1',
        ownerId: 'owner-1',
        payload: { value: 'helpful' },
        observedAt: '2026-07-05T00:00:00.000Z',
      },
      { accepted: true, duplicate: false, appliedDelta: 5 },
    );

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      signalId: 'sig-1',
      memoryId: 'mem-1',
      appliedDelta: 5,
    });
  });

  it('isolates publish errors from callers', async () => {
    const publisher = new DomainEventPublisher({
      publish: async () => {
        throw new Error('bus down');
      },
      subscribe: async () => ({ unsubscribe: async () => {} }),
    });

    await expect(
      publisher.publishMemoryDeleted({ ownerId: 'owner-1' }, 'mem-1'),
    ).resolves.toBeUndefined();
  });
});
