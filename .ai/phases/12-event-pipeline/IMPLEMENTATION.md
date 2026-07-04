# Phase 12 — Event Pipeline — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-020 Accepted](../../../docs/adr/020-event-consumer-architecture.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 12A | `IEventConsumer` registry + idempotent handlers | ✅ |
| 12A | `DomainEventPublisher` + `IMemoryDomainEventCoordinator` | ✅ |
| 12A | Post-commit hooks on MemoryService (fire-and-forget) | ✅ |
| 12B | `memory.accessed` → `IAnalyticsStore` fan-out | ✅ |
| 12C | Identity/IP on context audit | ⏸ Deferred (payload fields ready) |
| 12D | OTel production runbook | ⏸ Deferred (Phase 19 overlap) |
| Composition | `create-event-pipeline-ports.ts` | ✅ |
| Env | `EVENT_CONSUMERS_ENABLED=false` default | ✅ |
| Manifest | `supportsEventConsumers` | ✅ |

---

## File map

```
src/events/
  domain-event-topics.ts
  domain-event.types.ts
  idomain-event-publisher.port.ts
  domain-event-publisher.ts
  ievent-consumer.interface.ts
  event-consumer-registry.ts
  event-consumer-runner.ts
  memory-domain-event-coordinator.ts
  consumers/memory-access-analytics.consumer.ts
  index.ts
src/infrastructure/audit/event-publishing-memory-access-auditor.ts
src/composition/create-event-pipeline-ports.ts
```

Wired in: `rest-server.ts`, `grpc-server.ts`, `mcp-server.ts` (stdio bootstrap).

---

## Gating

| Env | Default | When enabled |
|-----|---------|--------------|
| `EVENT_CONSUMERS_ENABLED` | `false` | Master switch for Phase 12 |
| `EVENT_BUS_PROVIDER` | `none` | Must be `redis` when consumers ON |
| `ANALYTICS_PROVIDER` | `none` | `duckdb` registers analytics consumer |
| `MEMORY_ACCESS_AUDIT` | `false` | Sync audit unchanged; events still publish when consumers ON |

---

## Event schema

| Topic | Source |
|-------|--------|
| `memory.created` | MemoryService post-commit |
| `memory.updated` | MemoryService post-commit |
| `memory.deleted` | MemoryService post-commit |
| `memory.accessed` | EventPublishingMemoryAccessAuditor |
| `memory.signal.received` | Deferred (8.5 bridge) |

---

## Deferred

- `memory.signal.received` publisher on signal ingest
- REST/MCP request metadata → audit entry (12C)
- Webhook dispatcher consumer
- CLI `events:status`

---

## References

- [DESIGN.md](DESIGN.md)
- [ADR-016](../../../docs/adr/016-redis-streams-event-bus.md)
- [ADR-017](../../../docs/adr/017-memory-access-audit.md)
