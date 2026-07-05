import { describe, it, expect } from 'vitest';
import { InMemoryUsageMeter } from '../../src/cloud/adapters/in-memory-usage-meter.js';
import { UsageMeterEventConsumer } from '../../src/cloud/consumers/usage-meter-event.consumer.js';
import { DomainEventTopics } from '../../src/events/domain-event-topics.js';

describe('UsageMeterEventConsumer', () => {
  it('records memory.created events', async () => {
    const meter = new InMemoryUsageMeter();
    const consumer = new UsageMeterEventConsumer(meter);

    await consumer.handle({
      topic: DomainEventTopics.MEMORY_CREATED,
      payload: { ownerId: 'owner-1', workspaceId: 'ws-1', memoryId: 'mem-1' },
      occurredAt: new Date().toISOString(),
      correlationId: 'corr-1',
    });

    const exported = await meter.export({ ownerId: 'owner-1' });
    expect(exported.records).toHaveLength(1);
    expect(exported.records[0]?.metricType).toBe('memory.created');
  });
});
