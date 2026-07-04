# Phase 9.5 — Platform Architecture — RISKS

**Status:** Closed (gate PASS 2026-07-03)  
**ADR:** [ADR-008](../../../docs/adr/008-platform-architecture.md)

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Port drift — duplicate conflicting interfaces | Medium | High | Single barrel `src/ports/index.ts`; ADR-008 registry table | Mitigated |
| Developers bypass ports and import D1 directly | High | Medium | Code review; Phase 10 lint rule (future); document in DESIGN | Accepted |
| Dual naming confusion (`IEmbeddingStore` vs `IVectorStore`) | Medium | Low | JSDoc on legacy ports; migration table in MIGRATION.md | Accepted |
| Over-engineering unused ports (event bus, analytics) | Low | Medium | Interfaces only — no wiring until enterprise ADR | Accepted |
| Premature Postgres adapter without tests | Medium | High | **Blocked** until Phase 10 ADR + harness | Deferred |
| `ISqlDatabase` too SQL-centric for ORMs | Low | Medium | Port stays minimal (`query`/`execute`); ORM adapters wrap internally | Identified |

---

*Cross-phase debt: [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md).*
