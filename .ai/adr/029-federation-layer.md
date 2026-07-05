# ADR-029: Federation Layer — Cross-Node Knowledge Exchange (Phase 14)

**Status:** Implemented  

---

## Context

Ratary today operates as a **single-node memory foundation** with workspace/org scope (Phases 9–10), optional multi-protocol access (Phase 13), and event pipeline (Phase 12). Enterprise deployments need **multiple Ratary instances** to share knowledge across:

- **Workspaces** (different teams, same org)
- **Regions** (data residency, latency)
- **Organizations** (B2B, partner trust boundaries)
- **Clouds** (AWS, GCP, Cloudflare, on-prem — without code forks)

Constitution §3: external coordination at protocol boundaries. Constitution §26–27: scope isolation — federation must not leak existence across unauthorized boundaries.

`MemoryService` is the canonical CRUD orchestrator (ADR-007: no rewrite). Federation must **compose** existing services, not embed sync logic inside them.

## Problem

1. **No cross-node contract** — backup import/export is manual; no peer discovery or policy-governed exchange.
2. **Hardcoding risk** — without ports, federation would branch on `if (aws)` / `if (region === 'ap')` in services.
3. **Scope explosion** — cross-org/cross-region requires explicit trust and mapping, not implicit repository filters.
4. **Sync conflation** — Phase 9 `ISyncManager` handles **local** cross-client writes; cross-node needs separate port family.
5. **Roadmap slot** — POST-ROADMAP Phase 14 was Search/Graph prod; federation is orthogonal → renumber Search/Graph to **Phase 16**.

## Constraints

- **`MemoryService` unchanged** — federation calls existing public service methods only.
- **All federation via interfaces** — no vendor/cloud/region hardcoding in domain or services.
- **Provider agnostic** — transport, registry, trust, metadata stores are swappable adapters.
- **Fail closed** — unauthorized cross-boundary → same not-found/deny semantics as ADR-007.
- **Additive** — `FEDERATION_ENABLED=false` default; no breaking REST/MCP.
- **No agent runtime** in repo.
- Federation metadata **not** in `MemoryRepository` core queries — separate port `IFederationMetadataStore`.

## Alternatives

### Option A — Federation port layer + `IKnowledgeExchangeService` orchestrator (recommended)

- Pros: Clean boundary; MemoryService untouched; testable policies; cloud-agnostic.
- Cons: New module + additive API surface.

### Option B — Extend MemoryService with sync methods

- Pros: Single entry point.
- Cons: **Violates** phase constraint; couples business CRUD with distributed sync; rejected.

### Option C — External federation service only (outside repo)

- Pros: Zero repo change.
- Cons: No standard contract; duplicates memory logic at boundary; rejected.

### Option D — Event-sourcing rewrite

- Pros: Strong consistency story.
- Cons: Massive rewrite; violates constitution extensibility; rejected.

## Decision

**Adopt Option A — Phase 14 Federation Layer:**

1. Introduce `src/federation/` module with **port registry** (mirrors ADR-008 pattern for connectivity).
2. Core ports: `IFederationRegistry`, `IFederationTransport`, `IFederationPolicy`, `IFederationTrustStore`, `IFederationScopeMapper`, `IFederationConflictResolver`, `IFederationMetadataStore`, `IKnowledgeExchangePort`.
3. New application orchestrator **`IKnowledgeExchangeService`** — **only** federation flows; delegates local writes to **`MemoryService`** (existing methods: create, update, import, search).
4. Extend **`ISyncManager`** with optional **`IFederatedSyncPort`** adapter (cross-node reconcile) — does not modify `AcceptSyncManager` signature; composition root wires composite or separate handler.
5. Transport binds to Phase 13 **`IProtocolServer`** capabilities via **`IFederationTransport`** — no direct gRPC/REST imports in federation domain.
6. Additive REST under `/api/v1/federation/*` when `FEDERATION_ENABLED=true`.
7. Manifest extension: `capabilities.supportsFederation`, `federation.peers`, policy summary.
8. Renumber former Phase 14 Search/Graph → **Phase 16**.

## Tradeoffs

- **Gain:** Standard cross-node knowledge exchange; multi-cloud; policy-governed.
- **Accept:** Operational complexity (peer trust, conflict policy).
- **Accept:** Eventual consistency default — strong consistency opt-in per policy.
- **Defer:** Full CRDT memory merge; automatic bi-directional sync without policy approval.

## Migration

| Track | Action | MemoryService |
|-------|--------|---------------|
| 14A | Federation ports + types | None |
| 14B | `IKnowledgeExchangeService` + local apply via MemoryService | Call only |
| 14C | Registry + trust adapters (config, file, mesh) | None |
| 14D | Transport adapters (gRPC, REST, event-bus) | None |
| 14E | Policy engine + scope mapper | None |
| 14F | REST + manifest + docs | None |

Optional schema: `federation_*` tables via **`IFederationMetadataStore`** adapter only — not required in `memories` DDL for MVP.

## Rollback

- `FEDERATION_ENABLED=false` — no federation routes, no background sync jobs.
- Remove `src/federation/` — MemoryService unaffected.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 15 Content Scale | Federated blob refs via `IObjectStorage` + exchange bundles |
| 16 Search/Graph | Federated graph traverse as optional `IGraphProvider` federation source |
| Global fabric | Phase 14 is the foundation |

---

## References

- [ADR-007 Multi-AI workspace scope](../../adr/007-multi-ai-workspace-scope.md)
- [ADR-008 Platform architecture](../../adr/008-platform-architecture.md)
- [ADR-028 Protocol layer](../../adr/028-protocol-layer.md)
- [Phase 14 DESIGN](../phases/14-federation/DESIGN.md)
