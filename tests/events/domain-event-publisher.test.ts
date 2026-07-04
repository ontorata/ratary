import { describe, it, expect } from 'vitest';
import { DomainEventPublisher } from '../../src/events/domain-event-publisher.js';
import { DomainEventTopics } from '../../src/events/domain-event-topics.js';
import { InMemoryEventBus } from '../helpers/in-memory-event-bus.js';
import type { Memory } from '../../src/types/memory.js';

const sampleMemory: Memory = {
  id: 'mem-1',
  title: 'Test',
  project: 'ai-brain',
  content: 'content',
  summary: null,
  tags: [],
  keywords: [],
  category: null,
  memoryType: 'note',
  importance: 50,
  language: 'en',
  notes: null,
  codename: null,
  slug: null,
  favorite: false,
  archived: false,
  ownerId: 'owner-1',
  workspaceId: null,
  level: 'note',
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
  lastModifiedByAgentId: null,
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
