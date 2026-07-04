# ADR-020: Event Consumer Architecture

**Status:** Implemented  
**Date:** 2026-07-04  
**Approved:** 2026-07-04  
**Implemented:** 2026-07-04 (Phase 12 event pipeline)  
**Deciders:** Project owner  

---

## Context

Phase 10 landed `IEventBus` ([ADR-016](016-redis-streams-event-bus.md)) and memory access audit ([ADR-017](017-memory-access-audit.md)) without async consumers. Phase 12 wires **business domain event fan-out** so analytics and downstream integrations subscribe without changing `MemoryService` contracts.

## Problem

Without a consumer registry and composition root, event handlers would be ad-hoc wired in transport servers or skipped entirely. Hot-path CRUD must remain synchronous; fan-out must be fire-and-forget and idempotent under at-least-once delivery.

## Constraints

- Default `EVENT_BUS_PROVIDER=none` unchanged.
- `EVENT_CONSUMERS_ENABLED=false` by default.
- When consumers are enabled, `EVENT_BUS_PROVIDER=redis` is required.
- Observability exporters (Phase 19) must not register on the business bus.
- No business logic in consumers — mapping and dispatch only.

## Alternatives

### Option A — Consumer registry + composition root

- Pros: Mirrors Phase 8.6/9.7 extension pattern; testable; idempotent handlers.
- Cons: Requires Redis when enabled.

### Option B — Synchronous dual-write in services

- Pros: Simpler initially.
- Cons: Violates hot-path isolation; couples CRUD to analytics.

## Decision

**Adopt Option A — `IEventConsumer` registry with `createEventPipelinePorts()`:**

1. `DomainEventPublisher` publishes post-commit domain events via `IEventBus`.
2. `IMemoryDomainEventCoordinator` hooks `MemoryService` create/update/delete (fire-and-forget).
3. `EventPublishingMemoryAccessAuditor` decorates `IMemoryAccessAuditor` for `memory.accessed`.
4. `EventConsumerRegistry` + `EventConsumerRunner` subscribe at transport boot.
5. `MemoryAccessAnalyticsConsumer` fan-out to `IAnalyticsStore` (12B).
6. `EVENT_CONSUMERS_ENABLED` master switch; manifest `supportsEventConsumers`.

## Tradeoffs

- **Gain:** Phase 13 can stub event subscriptions against documented schema.
- **Accept:** 12C identity/IP on context audit deferred — fields exist on payload but REST/MCP do not yet populate them.

## Migration

1. Deploy with `EVENT_CONSUMERS_ENABLED=false` (default).
2. Enable in staging: `EVENT_CONSUMERS_ENABLED=true`, `EVENT_BUS_PROVIDER=redis`, optional `ANALYTICS_PROVIDER=duckdb`.
3. Rollback: `EVENT_CONSUMERS_ENABLED=false`.

## Rollback

Set `EVENT_CONSUMERS_ENABLED=false`. Redis stream data optional to trim.

## References

- [ADR-016 Redis Streams event bus](016-redis-streams-event-bus.md)
- [ADR-017 Memory access audit](017-memory-access-audit.md)
- [ADR-013 DuckDB analytics store](013-duckdb-analytics-store.md)
- [.ai/phases/12-event-pipeline/IMPLEMENTATION.md](../../.ai/phases/12-event-pipeline/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| Domain event publisher | `src/events/domain-event-publisher.ts` |
| Consumer registry / runner | `src/events/event-consumer-registry.ts`, `event-consumer-runner.ts` |
| Analytics consumer (12B) | `src/events/consumers/memory-access-analytics.consumer.ts` |
| Access auditor decorator | `src/infrastructure/audit/event-publishing-memory-access-auditor.ts` |
| Composition root | `src/composition/create-event-pipeline-ports.ts` |
| Env flag | `EVENT_CONSUMERS_ENABLED` |
| Manifest | `supportsEventConsumers` |
