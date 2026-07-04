# Phase 12 — Event Pipeline — RISKS

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R-12-01 | Hot-path blocking on publish | High | Fire-and-forget; never await consumers in CRUD |
| R-12-02 | Duplicate delivery without idempotency | Medium | Consumer idempotency keys; at-least-once docs |
| R-12-03 | Conflation with Phase 19 observability | Medium | Separate bus rule; architecture review |
| R-12-04 | Redis required in default deploy | High | `EVENT_BUS_PROVIDER=none` preserved |
| R-12-05 | Event schema drift vs Phase 13/18 | Medium | Versioned envelope; ADR-020 SSOT |

---

*Initial register 2026-07-04.*
