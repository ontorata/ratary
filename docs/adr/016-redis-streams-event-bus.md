# ADR-016: Redis Streams Event Bus

**Status:** Approved  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phase 9.5 declared `IEventBus` ([ADR-008](008-platform-architecture.md)). Phase 10 ships `NoOpEventBus`. Future async enrichment requires a real bus — Redis Streams is the first reference external provider.

## Decision

**Adopt Redis Streams as an opt-in event bus:**

1. `RedisStreamsEventBus` in `src/infrastructure/events/redis-streams/`
2. `EVENT_BUS_PROVIDER=redis` + `REDIS_URL` via `createEventBus()`
3. At-least-once delivery via consumer groups (`REDIS_STREAM_CONSUMER_GROUP`, `REDIS_STREAM_CONSUMER_NAME`)
4. Stream keys prefixed via `REDIS_STREAM_PREFIX` (default `ai-brain:events:`)
5. Subscribers optional; adapter ships before domain consumers exist

Kafka / RabbitMQ / CF Queue require separate Approved ADRs.

Default `EVENT_BUS_PROVIDER=none` unchanged.

## References

- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)
