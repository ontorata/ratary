# ADR-004: Repository Port Type Boundaries

**Status:** Implemented  
**Date:** 2026-07-01  
**Deciders:** Project owner  

---

## Context

`IMemoryReader` / `IMemoryWriter` / `IMemoryRepository` exist (milestone E). Services depend on interfaces (milestone A). However, `InsertMemoryData`, `SearchFilters`, and related types live in `memory.repository.ts` beside D1 SQL — the port imports concrete infrastructure file.

`MemoryRepository` (~729 lines) combines CRUD, search, retrieval, and backfill SQL.

## Problem

Ports that import concrete repository files break Dependency Inversion for Postgres swap. A monolithic D1 class encourages new methods instead of new adapters, weakening ISP and OCP.

## Constraints

- No rename `MemoryRepository` class (constitution canonical name).
- No behavior change in Phase 4 production paths from type move alone.
- Interface method signatures stable for REST/MCP.
- One concern per commit when implementing.

## Alternatives

### Option A — Extract types to `types/memory-persistence.ts`; keep single `MemoryRepository` class

- Pros: Low risk; fixes DIP leak; one PR.
- Cons: God-class size unchanged.

### Option B — Option A + split impl into `D1MemoryReader` / `D1MemoryWriter` delegating to shared SQL helpers

- Pros: ISP at impl level; clearer swap path.
- Cons: Larger refactor; more files; mock D1 test updates.

### Option C — Defer; add Phase 5 methods to monolith

- Pros: Fastest short term.
- Cons: Increases rewrite cost for Postgres; violates storage replaceability mandate.

## Decision

**Adopt Option A immediately; Option B deferred until Postgres migration is scheduled.**

Phase 1 (approved when this ADR is approved):

- Move `InsertMemoryData`, `UpdateMemoryData`, `ListFilters`, `SearchFilters` to `src/types/memory-persistence.ts` (or `src/ports/memory-persistence.types.ts`).
- `memory.repository.interface.ts` imports from types file only.
- `memory.repository.ts` imports same types — zero runtime change.

Phase 2 (future ADR or amendment when Postgres planned):

- Extract `D1MemoryReader` / `D1MemoryWriter` internal classes or separate files behind `MemoryRepository` facade.

## Tradeoffs

- **Gain:** Port is portable; Postgres adapter can import same DTOs.
- **Accept:** Single large D1 class remains until Phase 2.
- **Accept:** Small churn in import paths across repo.

## Migration

1. Create types file; re-export from `repositories/index.ts` for backward compatibility.
2. Update imports in services (if any pointed at concrete file for types only).
3. Run full test suite — no SQL changes.

## Rollback

- Revert types file; restore imports to `memory.repository.ts`.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | New writer methods on interface, not on concrete file imports |
| 6 Hybrid Retrieval | Unaffected |
| 7 Agent Runtime | Unaffected |
| 8 Knowledge Graph | Pattern for `IMemoryRelationRepository` types |
| 9 Multi AI | Tenant fields per [ADR-002](adr/002-workspace-identity-model.md) added to persistence types |
| 10 Enterprise | Prerequisite for multi-region Postgres |

---

## References

- [11-AI-RULES.md](../.ai/ai-rules/11-AI-RULES.md)
- [POLICY.md](POLICY.md)
