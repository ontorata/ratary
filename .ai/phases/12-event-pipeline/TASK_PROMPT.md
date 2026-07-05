# Task Prompt — Phase 12 Event Pipeline

**Status:** 🔲 Blocked — awaiting ADR-020 **Approved**  
**Design:** [DESIGN.md](DESIGN.md) · **Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 12

---

# TASK

Implement **Phase 12 — Event Pipeline**: wire async domain event consumers on top of existing `IEventBus` (ADR-016), audit/analytics fan-out (ADR-017/013), and document event schema for Phase 13 — **without changing** `MemoryService` business rules or default `EVENT_BUS_PROVIDER=none`.

---

## ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| ADR-020 | Event consumer architecture | **Planned** — must Approve before code |
| ADR-016 | Redis Streams event bus | ✅ Implemented |
| ADR-017 | Memory access audit | ✅ Implemented (fan-out deferred) |

---

## Constraints

- Async only — no synchronous consumer in request path
- Idempotent consumers; at-least-once documented
- No observability exporters on business bus (Phase 19 rule)
- Default env unchanged when flags off

---

*Activate after ADR-020 Approved and owner authorization.*
