# ADR-016: Redis Streams Event Bus

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 events tier)  
**Deciders:** Project owner  

---

## Context

Phase 9.5 declared `IEventBus` ([ADR-008](008-platform-architecture.md)). Phase 10 ships `NoOpEventBus`. Future async enrichment (audit fan-out, analytics ingestion) requires a real bus — Redis Streams is the first reference external provider.

## Problem

Domain services must not publish events directly to Redis. Without a port-backed adapter, Phase 12 pipeline work would ad-hoc wire Redis in composition roots or skip contract tests.

## Constraints

- `IEventBus` contract unchanged.
- Default `EVENT_BUS_PROVIDER=none` preserves behavior.
- Subscribers optional at landing — adapter proves publish/subscribe port compliance.
- Kafka / RabbitMQ / Cloudflare Queues require separate Approved ADRs.

## Alternatives

### Option A — Redis Streams adapter

- Pros: Reuses Redis infra with cache (ADR-012); consumer groups; at-least-once semantics.
- Cons: Operational Redis dependency when enabled.

### Option B — In-process event emitter only

- Pros: Simpler for single-node.
- Cons: Not replaceable; violates platform port goal.

## Decision

**Adopt Option A — Redis Streams as an opt-in event bus:**

1. `RedisStreamsEventBus` in `src/infrastructure/events/redis-streams/`
2. `EVENT_BUS_PROVIDER=redis` + `REDIS_URL` via `createEventBus()`
3. At-least-once delivery via consumer groups (`REDIS_STREAM_CONSUMER_GROUP`, `REDIS_STREAM_CONSUMER_NAME`)
4. Stream keys prefixed via `REDIS_STREAM_PREFIX` (default `ai-brain:events:`)
5. Subscribers optional; adapter ships before domain consumers exist

Default `EVENT_BUS_PROVIDER=none` unchanged.

## Tradeoffs

- **Gain:** Event port proven; Phase 12 can wire consumers without new port family.
- **Accept:** No hot-path publisher in Phase 10 — adapter-only.

## Migration

1. Deploy adapter; keep `EVENT_BUS_PROVIDER=none`.
2. Enable `redis` in staging when Phase 12 consumers ready.
3. Rollback: `EVENT_BUS_PROVIDER=none`.

## Rollback

Set `EVENT_BUS_PROVIDER=none`. Stream data optional to trim.

## References

- [ADR-008 Platform architecture](008-platform-architecture.md)
- [ADR-017 Memory access audit](017-memory-access-audit.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `RedisStreamsEventBus` | `src/infrastructure/events/redis-streams/redis-streams-event-bus.adapter.ts` |
| Client interface | `src/infrastructure/events/redis-streams/redis-streams-client.interface.ts` |
| `NoOpEventBus` (default) | wired via `createEventBus()` |
| Factory | `src/infrastructure/composition/create-event-bus.ts` |
| Contract tests | `tests/infrastructure/contracts/ievent-bus.contract.ts` |

**Default:** `EVENT_BUS_PROVIDER=none`. Domain publishers deferred to Phase 12.
