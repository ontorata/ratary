# Phase 12 — Event Pipeline & Observability

**Status:** ✅ Implemented (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 12  
**ADR gate:** [ADR-020 Implemented](../../../docs/adr/020-event-consumer-architecture.md)

---

## Summary

Activate **async paths** declared in Phase 10 but not on the hot path: domain event consumers, audit fan-out, and optional analytics wiring. Default `EVENT_BUS_PROVIDER=none` unchanged.

| Track | Deliverable | Status |
|-------|-------------|--------|
| 12A | Domain event consumers via `IEventBus` | ✅ |
| 12B | Audit fan-out — `memory.accessed` → analytics store | ✅ |
| 12C | Request context on audit — identity/IP | ⏸ Deferred |
| 12D | OTel production runbook | ⏸ Deferred (Phase 19) |

**Note:** Full observability platform (Grafana, SLO dashboards) is **Phase 19** — separate from Phase 12 **business** event bus.

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Design intent |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy |
| [REVIEW.md](REVIEW.md) | Gate verdict — PASS |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [RISKS.md](RISKS.md) | Risk register |

---

## Prerequisites

| Dependency | Status |
|------------|--------|
| Phase 10 Enterprise (`IEventBus`, Redis Streams adapter) | ✅ ADR-016 |
| Phase 11 Production Ops | ✅ Gate PASS |
| ADR-017 Memory access audit | ✅ Implemented |
| ADR-013 DuckDB analytics store | ✅ Implemented |

**Recommended before:** Phase 13 Protocol Layer (WS/SSE event subscriptions)

---

## Gating

| Env | Default |
|-----|---------|
| `EVENT_CONSUMERS_ENABLED` | `false` |
| `EVENT_BUS_PROVIDER` | `none` |

Enable staging: `EVENT_CONSUMERS_ENABLED=true`, `EVENT_BUS_PROVIDER=redis`, `REDIS_URL=...`

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md).*
