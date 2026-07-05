# ADR-019: Memory Repository Module Split (Phase 11C — Optional)

**Status:** Proposed  
**Date:** 2026-07-05  
**Deciders:** Project owner  
**Phase:** 11 — Production Operations (optional track **11C**)  
**Related:** [ADR-004](004-repository-port-types.md) Option B · [ADR-018](018-production-postgres-cutover.md) · [11-production-ops DESIGN](../phases/11-production-ops/DESIGN.md#11c--repository-hardening-optional)

---

## Context

Phase 11 gate **PASS** (2026-07-04). Postgres staging harness green (11B). `MemoryRepository` remains a single class (~860 lines) implementing `IMemoryRepository` via `ISqlDatabase` — acceptable for cutover per ADR-018.

ADR-004 **Option A** (persistence types extracted) is **Implemented**. **Option B** (reader/writer implementation split behind the same facade) was deferred to optional track **11C** to avoid coupling a large refactor to production cutover.

Risk **R11-06 / Repository split scope creep** (Medium/Medium): without explicit boundaries, 11C could expand into port moves, service rewrites, or dual-repo governance changes unrelated to maintainability.

---

## Problem

| Gap | Risk |
|-----|------|
| Monolithic `MemoryRepository` | Harder navigation; higher merge conflict rate |
| No filed ADR for 11C | Ad-hoc splits change layer boundaries without review |
| Ambiguous “repository split” | Confusion with Ratary vs ai-brain **git** boundary (`.gitignore` production split) |

**11C is optional.** Phase 11 gate does **not** require implementation. This ADR **bounds** work if an owner approves 11C later.

---

## Constraints

- **Constitution:** `MemoryRepository` **class name unchanged** (canonical).
- **Ports unchanged at public boundary:** `IMemoryRepository`, `IMemoryReader`, `IMemoryWriter` — no new public interfaces without a separate ADR.
- **No behavior change** in a refactor-only 11C PR — same SQL, same tests green.
- **Composition root only** for provider selection — repositories stay on `ISqlDatabase`.
- **One concern per commit** when implementing.
- **Not in scope:** Ratary/ai-brain git remotes, `.gitignore` boundary, or extracting `tests/` / `.ai/`.
- **Prerequisite:** 11B staging harness PASS (✅ 2026-07-04) before any 11C code merge.

---

## Alternatives

### Option A — Do nothing (status quo)

- Pros: Zero churn; cutover complete; tests stable.
- Cons: Large file remains; ISP only at interface level.

### Option B — Internal reader/writer modules behind `MemoryRepository` facade *(recommended if 11C proceeds)*

- Pros: Clear read vs write SQL ownership; aligns with ADR-004 Phase 2 intent; no port churn.
- Cons: Multi-file refactor; mock/test import updates.

### Option C — Split ports + multiple repository classes

- Pros: Strongest ISP at type level.
- Cons: **Out of scope for 11C** — requires new ADR; high blast radius across services and composition root.

## Decision

**Adopt Option A as default (no 11C work).**

**If owner marks this ADR Approved and requests 11C:** implement **Option B only** per module map below. Option C is rejected for 11C.

### Allowed module map (Option B)

| File (proposed) | Responsibility | Visibility |
|-----------------|----------------|------------|
| `memory-reader.sql.ts` | SELECT, search, list, retrieval projections | `src/repositories/` internal |
| `memory-writer.sql.ts` | INSERT, UPDATE, DELETE, `recordAccessBatch` | `src/repositories/` internal |
| `memory.repository.ts` | Facade delegating to reader/writer; **same export** | Public via `repositories/index.ts` |

Shared SQL helpers may live in `memory-sql.helpers.ts` if duplication appears — still internal, no new ports.

### Explicit non-goals (scope creep prevention)

| Non-goal | Rationale |
|----------|-----------|
| Rename or remove `MemoryRepository` | Constitution |
| Move ports out of `src/ports/` | Layer law |
| Change `MemoryService` / `Retriever` signatures | Not 11C |
| Postgres-specific repository class | Already unified via `ISqlDatabase` |
| Split `RelationRepository` in same PR | Separate track; separate ADR if structural |
| Dual git repo / submodule split | Operational boundary — not ADR-019 |

---

## Tradeoffs

- **Gain:** Documented gate prevents unbounded 11C refactors.
- **Accept:** Large monolith remains until owner approves and schedules 11C.
- **Accept:** ADR-019 Proposed alone ships **no code**.

---

## Migration (when Approved → Implemented)

1. Owner marks ADR-019 **Approved**.
2. Extract reader methods to `memory-reader.sql.ts` — **zero behavior change**, tests green.
3. Extract writer methods to `memory-writer.sql.ts` — tests green.
4. `MemoryRepository` delegates; remove duplicated SQL from facade.
5. Run full suite: default D1 env + `npm run test:postgres-staging`.
6. Mark ADR-019 **Implemented** when merged.

**Estimated commits:** 2–3 refactor-only PRs (reader, writer, cleanup). No feature flags.

---

## Rollback

Revert refactor commits. No DDL or data migration — rollback is git-only.

---

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 11 Production Ops | Optional 11C bounded; gate already PASS without it |
| 12+ Event pipeline | None — repositories unchanged at port level |
| Postgres primary | Easier navigation for ops engineers if 11C done |
| Ratary release | 11C code (if any) ships via normal ratary cherry-pick; governance stays ai-brain |

---

## Risk register linkage

| Risk ID | Treatment |
|---------|-----------|
| R11-06 Repository split scope creep | **Accepted** — 11C optional; this ADR bounds scope; implementation requires **Approved** status |

---

## References

- [ADR-004 Option B deferral](004-repository-port-types.md)
- [ADR-018 §11C deferral](018-production-postgres-cutover.md)
- [Phase 11 IMPLEMENTATION §Optional track 11C](../phases/11-production-ops/IMPLEMENTATION.md)
- [POLICY.md](POLICY.md)
