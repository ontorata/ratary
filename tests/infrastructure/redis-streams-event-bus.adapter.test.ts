import { describe, expect, it } from 'vitest';
import { RedisStreamsEventBus } from '../../src/infrastructure/events/redis-streams/redis-streams-event-bus.adapter.js';
import type { RedisStreamsGroupClient } from '../../src/infrastructure/events/redis-streams/redis-streams-client.interface.js';
import { describeEventBusContract } from './contracts/ievent-bus.contract.js';

class InMemoryRedisStreamsClient implements RedisStreamsGroupClient {
  readonly streams = new Map<string, Array<{ id: string; fields: string[] }>>();
  private readonly groups = new Set<string>();

  async xadd(stream: string, id: string, ...fieldValuePairs: string[]): Promise<string> {
    const entries = this.streams.get(stream) ?? [];
    const entryId = id === '*' ? String(entries.length + 1) : id;
    entries.push({ id: entryId, fields: fieldValuePairs });
    this.streams.set(stream, entries);
    return entryId;
  }

  async xread(): Promise<Array<[string, Array<[string, string[]]>]> | null> {
    return null;
  }

  async xgroupCreate(stream: string, group: string, _id: string, _mkstream?: 'MKSTREAM'): Promise<'OK'> {
    this.groups.add(`${stream}:${group}`);
    return 'OK';
  }

  async xreadgroup(
    _group: string,
    _consumer: string,
    count: number,
    _blockMs: number,
    _streams: string,
    stream: string,
    _cursor: string,
  ): Promise<Array<[string, Array<[string, string[]]>]> | null> {
    const entries = this.streams.get(stream) ?? [];
    if (entries.length === 0) {
      return null;
    }
    const slice = entries.slice(0, count);
    return [[stream, slice.map((entry) => [entry.id, entry.fields])]];
  }

  async xack(): Promise<number> {
    return 1;
  }
}

describe('RedisStreamsEventBus', () => {
  describeEventBusContract('redis streams in-memory', () => {
    return new RedisStreamsEventBus(new InMemoryRedisStreamsClient(), {
      streamPrefix: 'test:events:',
      consumerGroup: 'test-group',
      consumerName: 'test-consumer',
    });
  });

  it('should write to prefixed stream keys', async () => {
    const client = new InMemoryRedisStreamsClient();
    const bus = new RedisStreamsEventBus(client, {
      streamPrefix: 'prefix:',
      consumerGroup: 'group',
      consumerName: 'worker',
    });
    await bus.publish('topic-a', { ok: true });
    expect(client.streams.has('prefix:topic-a')).toBe(true);
  });
});
