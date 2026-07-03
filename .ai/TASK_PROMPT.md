# Task Prompt — Phase 9.5 Platform Architecture

**Status:** ✅ Complete — ADR-008 Implemented (2026-07-03)  
**Template:** [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md)

---

# TASK

Implement **Phase 9.5 — Platform Architecture** per [ADR-008](../docs/adr/008-platform-architecture.md).

**Objective:** Storage-agnostic port registry. **No** new user features. **No** provider implementations.

**Evidence:** [.ai/phases/09.5-platform-architecture/](phases/09.5-platform-architecture/)

---

## ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [008](../docs/adr/008-platform-architecture.md) | Platform architecture ports | **Approved** |

---

## Implementation order

1. [x] ADR-008 Approved
2. [x] `src/ports/` registry (10 interfaces)
3. [x] Contract tests (`tests/ports/platform-ports.test.ts`)
4. [x] Phase gate docs (DESIGN, IMPLEMENTATION, MIGRATION, TESTING, RISKS)
5. [x] REVIEW + COMPLETION + quality gate (310 tests)

---

## Definition of Done

- [x] All required ports defined in `src/ports/`
- [x] Services unchanged; D1 adapters unchanged
- [x] No provider implementations
- [x] 310 tests green
- [x] Gate REVIEW PASS

---

## Next

**Phase 10 — Enterprise** per [phases/roadmap/09-ROADMAP.md](phases/roadmap/09-ROADMAP.md).

---

*Rotated from Phase 9 completion 2026-07-03.*
