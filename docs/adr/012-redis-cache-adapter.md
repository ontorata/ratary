# ADR-012: Redis / Valkey Cache Adapter

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T4)  
**Deciders:** Project owner  

---

## Context

Phase 9.5 declared `ICache` ([ADR-008](008-platform-architecture.md)). Phase 10 ships `MemoryCache` (in-process) and `NoOpCache`. Architecture target T-03 documents batching `recordAccess` via cache — **no domain consumer is required for adapter landing**.

## Problem

Enterprise deployments may need distributed cache (Redis/Valkey) for multi-instance REST workers. Implementing Redis without an ADR risks vendor imports in services or premature hot-path coupling before consumers exist.

## Constraints

- `ICache` contract unchanged.
- Default `CACHE_PROVIDER=none` preserves current behavior.
- No `ioredis` / Redis imports in `services/`, controllers, or domain.
- Adapter-only landing — wiring consumers is a future milestone.

## Alternatives

### Option A — Redis adapter behind `ICache` at composition root

- Pros: Matches platform port pattern; Valkey-compatible; testable via injectable client interface.
- Cons: No consumer on hot path yet.

### Option B — Defer until `recordAccess` batch consumer exists

- Pros: Less unused infrastructure.
- Cons: Blocks staging proof of cache layer for Phase 12+.

## Decision

**Adopt Option A — Redis/Valkey as an opt-in cache provider:**

1. `RedisCacheAdapter` in `src/infrastructure/cache/redis/redis-cache.adapter.ts`
2. `CACHE_PROVIDER=redis` + `REDIS_URL` at composition root via `createCache()`
3. JSON-serialized values; keys prefixed via `REDIS_KEY_PREFIX` (default `ai-brain:cache:`)
4. Valkey uses the same Redis protocol client (single adapter)

Default `CACHE_PROVIDER=none` unchanged.

## Tradeoffs

- **Gain:** Reference external cache adapter; contract tests prove port compliance.
- **Accept:** Adapter ships before domain reads/writes cache keys.

## Migration

1. Deploy adapter; default remains `none` or `memory`.
2. Set `CACHE_PROVIDER=redis` when consumers wired (future milestone).
3. Rollback: `CACHE_PROVIDER=none`.

## Rollback

Set `CACHE_PROVIDER=none` or `memory`. Redis keys optional to flush.

## References

- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `RedisCacheAdapter` | `src/infrastructure/cache/redis/redis-cache.adapter.ts` |
| Injectable client interface | `src/infrastructure/cache/redis/redis-string-client.interface.ts` |
| `MemoryCache` / `NoOpCache` | `src/infrastructure/cache/` |
| Factory | `src/infrastructure/composition/create-cache.ts` |
| Contract tests | `tests/infrastructure/contracts/icache.contract.ts` |

**Default:** `CACHE_PROVIDER=none`.
