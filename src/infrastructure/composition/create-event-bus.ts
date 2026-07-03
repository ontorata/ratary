import { Redis } from 'ioredis';
import type { Env } from '../../config/env.js';
import type { IEventBus } from '../../ports/events/ievent-bus.port.js';
import { NoOpEventBus } from '../events/noop-event-bus.adapter.js';
import { RedisStreamsEventBus } from '../events/redis-streams/redis-streams-event-bus.adapter.js';
import type { RedisStreamsGroupClient } from '../events/redis-streams/redis-streams-client.interface.js';

export function createEventBus(env: Env): IEventBus {
  if (env.EVENT_BUS_PROVIDER === 'redis') {
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL is required when EVENT_BUS_PROVIDER=redis');
    }
    const client = new Redis(env.REDIS_URL, { lazyConnect: true });
    return new RedisStreamsEventBus(wrapIoRedisStreamsClient(client), {
      streamPrefix: env.REDIS_STREAM_PREFIX,
      consumerGroup: env.REDIS_STREAM_CONSUMER_GROUP,
      consumerName: env.REDIS_STREAM_CONSUMER_NAME,
    });
  }

  if (env.EVENT_BUS_PROVIDER !== 'none' && env.EVENT_BUS_PROVIDER !== 'noop') {
    throw new Error(`EVENT_BUS_PROVIDER=${env.EVENT_BUS_PROVIDER} is not implemented`);
  }

  return new NoOpEventBus();
}

function wrapIoRedisStreamsClient(client: Redis): RedisStreamsGroupClient {
  const redis = client as Redis & {
    xadd(stream: string, id: string, ...args: string[]): Promise<string>;
    xread(...args: unknown[]): Promise<Array<[string, Array<[string, string[]]>]> | null>;
    xgroup(...args: unknown[]): Promise<'OK'>;
    xreadgroup(...args: unknown[]): Promise<Array<[string, Array<[string, string[]]>]> | null>;
    xack(stream: string, group: string, ...ids: string[]): Promise<number>;
  };

  return {
    xadd: async (stream, id, ...fieldValuePairs) => {
      const entryId = await redis.xadd(stream, id, ...fieldValuePairs);
      return entryId ?? '';
    },
    xread: (count, blockMs, streams, ...streamKeysAndIds) =>
      redis.xread('COUNT', count, 'BLOCK', blockMs, streams, ...streamKeysAndIds),
    xgroupCreate: (stream, group, id, mkstream) =>
      redis.xgroup('CREATE', stream, group, id, mkstream ?? ''),
    xreadgroup: (group, consumer, count, blockMs, streams, ...streamKeysAndIds) =>
      redis.xreadgroup(
        'GROUP',
        group,
        consumer,
        'COUNT',
        count,
        'BLOCK',
        blockMs,
        streams,
        ...streamKeysAndIds,
      ),
    xack: (stream, group, ...ids) => redis.xack(stream, group, ...ids),
  };
}
