import { describe, it, expect } from 'vitest';
import { MemoryAccessAnalyticsConsumer } from '../../src/events/consumers/memory-access-analytics.consumer.js';
import { DomainEventTopics } from '../../src/events/domain-event-topics.js';
import type { EventEnvelope } from '../../src/ports/events/ievent-bus.port.js';
import type { IAnalyticsStore } from '../../src/ports/analytics/ianalytics-store.port.js';

class RecordingAnalyticsStore implements IAnalyticsStore {
  readonly rows: Record<string, unknown>[] = [];

  async insert(_table: string, rows: readonly Record<string, unknown>[]): Promise<void> {
    for (const row of rows) {
      if (this.rows.some((existing) => existing.id === row.id)) {
        throw new Error('duplicate key');
      }
      this.rows.push(row);
    }
  }

  async query() {
    return [];
  }
}

describe('MemoryAccessAnalyticsConsumer (Phase 12B)', () => {
  it('writes memory.accessed events to analytics store idempotently', async () => {
    const store = new RecordingAnalyticsStore();
    const consumer = new MemoryAccessAnalyticsConsumer(store);

    const event: EventEnvelope<unknown> = {
      topic: DomainEventTopics.MEMORY_ACCESSED,
      payload: {
        memoryId: 'mem-1',
        ownerId: 'owner-1',
        source: 'context.build',
      },
      occurredAt: '2026-07-04T12:00:00.000Z',
      correlationId: 'evt-1',
    };

    await consumer.handle(event);
    await consumer.handle(event);

    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]).toMatchObject({
      id: 'evt-1',
      owner_id: 'owner-1',
      memory_id: 'mem-1',
      accessed_at: '2026-07-04T12:00:00.000Z',
    });
  });
});
