# ADR-043: Cloud Federation Sync Topology (Phase 25)

**Status:** Implemented
**Date:** 2026-07-04
**Deciders:** Project owner

---

## Context

Phase 14 exchanges knowledge bundles peer-to-peer; Phase 18 runs a cloud control plane. Phase 25 needs a **unified synchronization topology** — Workspace → Organization → Cloud → Edge → Developer — plus multi-device, offline sync, conflict resolution, and event replication, **without duplicating business logic**.

Design: [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md) §5, §6, §10.

## Problem

Teams work across many devices, IDEs, repositories, workspaces, and organizations, sometimes offline. There is no single orchestrator routing sync across tiers, reconciling offline journals, and resolving conflicts consistently.

## Constraints

- Reuse Phase 14 ports (registry/transport/trust/policy/scope/conflict) — no duplication.
- Tiers are **descriptor + policy filters**, never `switch(tier)` / `switch(cloud)` code branches.
- No shared primary database; each node persists via its own `MemoryService`.
- `merge` conflict path only via stewardship policy (Phase 04.7) — no silent content merge.
- Default OFF; additive REST/MCP.

## Alternatives

### Option A — Separate sync engine per tier
- Pros: tier isolation.
- Cons: duplicates orchestration logic five times; violates single-canonical-owner; rejected.

### Option B — One `IGlobalSyncOrchestrator` over Phase 14 exchange (chosen)
- Pros: single business logic; tiers differ only by registry/policy/transport selection; offline journal + vector-clock conflict added once.
- Cons: orchestrator must map tier → adapter set.

### Option C — CRDT full auto-merge
- Pros: automatic convergence.
- Cons: silent content merge violates Vision #3; unbounded semantics; rejected for MVP.

## Decision

Adopt a single `IGlobalSyncOrchestrator` that routes `pull/push/bidirectional` sync per `SyncTier` (`workspace|organization|cloud|edge|developer`) by delegating to Phase 14 `IKnowledgeExchangeService`. Add `ISyncSession` (multi-device), `IOfflineJournal` (durable local queue + reconcile), and `ISyncConflictPolicy` (version + vector-clock; `merge` via stewardship only). Event replication via Phase 12 bus → Phase 14 fan-out. Flag gated under `GLOBAL_INTELLIGENCE_PLATFORM`.

## Tradeoffs

Accept a tier-routing orchestrator and offline journal for globally consistent sync that never forks business logic and never creates a single global primary DB.

## Migration

Add sync ports + noop adapters → offline journal adapter → orchestrator over Phase 14 exchange → cloud/edge transport adapters → device session tracking. Additive, gated.

## Rollback

Master flag OFF → orchestrator noop; Phase 14 behavior unchanged; local writes unaffected.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 14 Federation | Orchestrated (no change) |
| 18 Cloud | Region hub/metering reused |
| 09.8 Multi-client sync | Reconciled through offline journal |
| 04.7 Stewardship | Owns `merge` conflict path |

---

## References

- [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md)
- [ADR-029 Federation Layer](../../.ai/adr/029-federation-layer.md) · [ADR-033 Cloud Platform](../../.ai/adr/033-cloud-platform.md) · [ADR-042 Multi-client Memory Sync](042-multi-client-memory-sync.md)
- [POLICY.md](POLICY.md)
