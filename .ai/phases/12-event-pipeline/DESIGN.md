# Phase 12 — Event Pipeline — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**ADR gate:** [ADR-020 Implemented](../../adr/020-event-consumer-architecture.md)

---

## 1. Purpose

Phase 10 landed `IEventBus` ([ADR-016](../../adr/016-redis-streams-event-bus.md)) and opt-in memory access audit ([ADR-017](../../adr/017-memory-access-audit.md)) **without hot-path consumers**. Phase 12 wires **async fan-out** so compliance, analytics, and downstream integrations can subscribe without changing `MemoryService` contracts.

**Problem Phase 12 solves:**

1. **No consumer registry** — Redis Streams adapter exists but nothing subscribes in production paths.
2. **Audit gap** — `memory.accessed` rows optional; no fan-out to analytics store or webhooks.
3. **Deferred Phase 10 work** — DuckDB `memory_access_events`, identity/IP on context audit → 12B/12C.
4. **Phase 13 blocker (soft)** — WS/SSE event subscriptions need a business event schema.

---

## 2. Scope

| Track | Deliverable | Hot path impact |
|-------|-------------|-----------------|
| **12A** | `IEventConsumer` registry + idempotent handlers | None — async only |
| **12B** | `memory.accessed` → `IAnalyticsStore` / webhook sink | None — post-commit |
| **12C** | Identity/IP on audit when `MEMORY_ACCESS_AUDIT=true` | Minimal — middleware hook |
| **12D** | OTel production runbook | Docs only |

### Non-goals

- Replacing Phase 19 Observability Platform (metrics/traces/logs exporters)
- Business logic in event handlers (mapping + dispatch only)
- Mandatory Redis in default deploy (`EVENT_BUS_PROVIDER=none` preserved)
- Dual-write or synchronous event blocking on CRUD

---

## 3. Architecture

```
MemoryService / ContextService (unchanged)
        │
        ▼ publish (async, fire-and-forget)
   IEventBus ──► Redis Streams (opt-in)
        │
        ├──► Consumer: analytics fan-out (12B)
        ├──► Consumer: webhook dispatcher (12A)
        └──► Consumer: usage meter stub (Phase 18 hook)

AuditRepository (sync) ──► audit_logs (unchanged)
MemoryAccessAuditor ──► optional memory.accessed + event publish
```

### Ports (new / extended)

| Port | Module | Role |
|------|--------|------|
| `IEventConsumer` | `events/consumers/` | Idempotent handler contract |
| `IEventConsumerRegistry` | `events/consumers/` | Register consumers at composition root |
| `IWebhookDispatcher` | `events/webhooks/` | Optional HTTP sink (flag-gated) |

### Event schema (draft)

| Event | Source | Phase |
|-------|--------|-------|
| `memory.created` | MemoryService post-commit | 12A |
| `memory.updated` | MemoryService post-commit | 12A |
| `memory.deleted` | MemoryService post-commit | 12A |
| `memory.accessed` | ContextService / auditor | 12B |
| `memory.signal.received` | Signal ingest (8.5 alignment) | 12A |
| `memory.compressed` | Consolidator (5.5 optional) | 12A deferred |

---

## 4. Gating

| Env | Default | Purpose |
|-----|---------|---------|
| `EVENT_BUS_PROVIDER` | `none` | Master switch (unchanged) |
| `EVENT_CONSUMERS_ENABLED` | `false` | Phase 12 consumer registry |
| `MEMORY_ACCESS_AUDIT` | `false` | ADR-017 (extended in 12C) |
| `ANALYTICS_PROVIDER` | `none` | Sink for 12B fan-out |

---

## 5. Success criteria

- [x] Consumer(s) idempotent; at-least-once documented
- [x] Default `EVENT_BUS_PROVIDER=none` unchanged
- [x] Compliance query path documented (`audit_logs` and/or analytics export)
- [x] No `MemoryService` logic rewrite
- [x] Phase 13 can stub `subscribe.events` against documented schema

---

## 6. Distinct from Phase 19

| Concern | Phase 12 | Phase 19 |
|---------|----------|----------|
| Bus type | Business domain events | Operational telemetry |
| Handlers | Audit, analytics, webhooks | OTLP/Prometheus/Loki exporters |
| Hot path | Async sidecar only | Middleware instrumentation |

**Rule:** Observability exporters **must not** register on the Phase 12 business bus.

---

## References

- [10-POST-ROADMAP.md § Phase 12](../roadmap/10-POST-ROADMAP.md)
- [ADR-016 Redis Streams event bus](../../adr/016-redis-streams-event-bus.md)
- [ADR-017 Memory access audit](../../adr/017-memory-access-audit.md)
- [ADR-013 DuckDB analytics store](../../adr/013-duckdb-analytics-store.md)
- Phase 13 [DESIGN.md](../13-protocol-layer/DESIGN.md) — event subscription dependency
