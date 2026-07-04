# ADR-017: Memory Access Audit (Opt-In)

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phase 10 auth layer already persists auth and sync events to `audit_logs` via `AuditService` and `AuditRepository`. Context retrieval (`ContextService.buildContext`) updates `access_count` / `last_accessed` per memory via `IMemoryRepository.recordAccess` but does not emit compliance audit rows.

Enterprise deployments need an optional, queryable trail of which memories were surfaced during context builds without changing default behavior.

## Problem

- Compliance queries cannot distinguish "memory ranked into context" from generic counter bumps.
- Wiring audit directly inside `MemoryRepository` would mix analytics counters with audit semantics.
- Full request attribution (identity, IP) is not available inside `ContextService` without leaking transport concerns into the memory module.

## Decision

**Adopt opt-in memory access audit at the composition root:**

| Component | Role |
|-----------|------|
| `IMemoryAccessAuditor` port | `recordAccess(entry)` — single extension point |
| `NoOpMemoryAccessAuditor` | Default when `MEMORY_ACCESS_AUDIT=false` |
| `AuditLogMemoryAccessAuditor` | Appends `memory.accessed` rows to `audit_logs` |
| `createMemoryAccessAuditor()` | Env-driven factory in `src/infrastructure/composition/` |
| `ContextService` | Optional third constructor dep; calls auditor after `recordAccess` |

**Event shape (`audit_logs`):**

| Field | Value |
|-------|-------|
| `event` | `memory.accessed` |
| `resource` | `memory` |
| `resource_id` | memory UUID |
| `owner_id` | scope owner |
| `metadata.source` | `context.build` |
| `metadata.workspaceId` | workspace when scoped |

**Scope (Phase 10):** Context build path only. Direct `GET /memory/:id` reads remain counter-only unless a future ADR extends `MemoryAccessSource` to `memory.read`.

**Future (not Phase 10):** Fan-out to `IEventBus` or `IAnalyticsStore.memory_access_events` via async consumer — documented in DuckDB analytics DDL as reference schema only.

**Default:** `MEMORY_ACCESS_AUDIT=false` — no new rows; 397-test baseline unchanged.

## Consequences

- Audit expansion satisfies Phase 10 compliance milestone without mandatory overhead.
- Identity / request context fields on the port are optional for future controller wiring.
- `AuditRepository` remains the single SQL sink; no duplicate DDL.

## References

- [ADR-010 Workspace membership RBAC](010-workspace-membership-rbac.md)
- [ADR-013 DuckDB analytics store](013-duckdb-analytics-store.md)
- [.ai/phases/10-enterprise/DESIGN.md](../../.ai/phases/10-enterprise/DESIGN.md)
