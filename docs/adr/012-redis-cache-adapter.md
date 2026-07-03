# ADR-012: Redis / Valkey Cache Adapter

**Status:** Approved  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phase 9.5 declared `ICache` ([ADR-008](008-platform-architecture.md)). Phase 10 ships `MemoryCache` (in-process) and `NoOpCache`. Architecture target T-03 documents batching `recordAccess` via cache — **no domain consumer is required for adapter landing**.

## Decision

**Adopt Redis/Valkey as an opt-in cache provider:**

1. `RedisCacheAdapter` in `src/infrastructure/cache/redis/redis-cache.adapter.ts`
2. `CACHE_PROVIDER=redis` + `REDIS_URL` at composition root via `createCache()`
3. JSON-serialized values; keys prefixed via `REDIS_KEY_PREFIX` (default `ai-brain:cache:`)
4. Valkey uses the same Redis protocol client (single adapter)

Default `CACHE_PROVIDER=none` unchanged.

## Migration

1. Deploy adapter; default remains `none` or `memory`.
2. Set `CACHE_PROVIDER=redis` when consumers wired (future milestone).
3. Rollback: `CACHE_PROVIDER=none`.

## References

- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)
