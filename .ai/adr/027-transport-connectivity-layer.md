# ADR-027: Transport & Connectivity Layer (Phase 10.5)

**Status:** Approved  
**Date:** 2026-07-04  
**Approved:** 2026-07-04 (Lutfi Ramadhan — Phase 11 gate PASS; Phase 10.5 authorized)  
**Deciders:** Project owner  

---

## Context

Phases 1–10 established a memory foundation with **REST (Fastify)** and **MCP (stdio)** as inbound protocols. Both invoke the same application services per [04-ARCHITECTURE.md](../core/architecture/04-ARCHITECTURE.md). Constitution §7 and §17 already require transport as a distinct layer, but implementation is scattered: `routes/`, `controllers/`, `mcp/`, and dual composition roots (`server.ts`, `mcp/server.ts`).

Phase 7.5 delivered `GET /api/v1/capabilities` and MCP `get_capabilities` (ADR-025 Implemented). Post–Phase 10 roadmap (Phases 11–14) focuses on **storage cutover and operational maturity**. Enterprise deployments and internal workers (batch embedding, vector ingest, cross-region sync) need **typed, stream-capable** connectivity without duplicating business logic.

## Problem

1. **No canonical transport module** — edge code spread across folders; risk of REST/MCP/gRPC drift.
2. **No shared handler boundary** — controllers and MCP tools may diverge in mapping logic over time.
3. **gRPC gap** — REST is unsuitable for high-throughput batch ingest and server-streaming context; MCP stdio is unsuitable for service mesh.
4. **Manifest incomplete** — ADR-025 manifest reports `mcp.transport: 'stdio'` only; no transport registry for future protocols.
5. **Future MCP HTTP/SSE** — without a transport registry, each new protocol requires ad hoc wiring.

## Constraints

- Constitution: inward dependencies; services must not import Fastify, MCP SDK, or gRPC.
- **Zero behavior change** at default env (D1 + REST + MCP stdio).
- REST `/api/v1/*` and MCP tool schemas remain **stable** (additive only).
- gRPC **opt-in** via `GRPC_ENABLED=false` default.
- gRPC **not** on Vercel serverless edge initially (long-running Node/K8s/VM only).
- SDK (`@ai-brain/client`) **outside** this repository (Phase 7.5 DESIGN).
- No agent runtime, planner, or executor in repo.
- Phase 11 P0 (Postgres cutover) must not be blocked.

## Alternatives

### Option A — Formalize `src/transport/` + shared handlers + optional gRPC (recommended)

- Pros: Aligns with constitution; enables gRPC without service rewrite; handler parity tests prevent drift; prepares MCP HTTP/SSE.
- Cons: Folder migration churn; two composition roots consolidated gradually.

### Option B — gRPC only, no folder restructure

- Pros: Minimal file moves.
- Cons: Drift risk persists; does not solve structural debt; violates "single canonical owner" for transport.

### Option C — GraphQL BFF alongside REST

- Pros: Flexible client queries.
- Cons: New query layer duplicates orchestration risk; speculative; deferred.

### Option D — Defer until Phase 14 complete

- Pros: No near-term churn.
- Cons: Phase 12 event consumers and Phase 13 batch ingest benefit from gRPC now; drift accumulates.

## Decision

**Adopt Option A — Phase 10.5 Transport & Connectivity Layer:**

1. Introduce `src/transport/` as canonical transport root with submodules `shared/`, `rest/`, `mcp/`, `grpc/` (opt-in), `registry/`.
2. Introduce `TransportContext` and shared `IApplicationHandler` pattern — thin protocol adapters delegate to handlers; handlers call existing services.
3. Introduce `ITransportServer` lifecycle interface and `TransportRegistry` at composition root.
4. Add gRPC v1 behind `GRPC_ENABLED=false` — Memory, Context (server-stream), Health services only in v1.
5. Extend `AICapabilityManifest` with additive `transport` section (REST, MCP, gRPC, SDK status).
6. Migrate `routes/` + `controllers/` → `transport/rest/` via strangler re-exports (zero import break in single commit tracks).

**Role assignment (unchanged externally):**

| Protocol | Role |
|----------|------|
| REST | Public API |
| MCP stdio | AI client protocol |
| gRPC | Internal / enterprise opt-in |
| SDK | External consumer of OpenAPI + proto |

## Tradeoffs

- **Gain:** Protocol-agnostic foundation; streaming path for context and ingest; enterprise mTLS; federated memory fabric readiness.
- **Accept:** Temporary re-export aliases during folder migration.
- **Accept:** gRPC deployment documented as separate from Vercel default.
- **Defer:** GraphQL, MCP HTTP transport, full gRPC parity with all REST endpoints.

## Migration

### Track sequence (each track = one or more commits)

| Track | Action | Runtime impact |
|-------|--------|----------------|
| 10.5A | Add `transport/shared/` types + scope resolver unify | None |
| 10.5B | Extract shared handlers for top use cases | None |
| 10.5C | Move REST under `transport/rest/` + re-exports | None |
| 10.5D | Move MCP under `transport/mcp/` + re-exports | None |
| 10.5E | Add gRPC server + proto v1 | None when flag off |
| 10.5F | Manifest extension + PANDUAN + 04-ARCHITECTURE | Additive |

### Rollback

- Set `GRPC_ENABLED=false` (default) — no gRPC listener.
- Revert folder moves via git; re-exports preserve import paths during transition.
- Delete `src/transport/grpc/` — zero impact on REST/MCP.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 11 Production Ops | Independent — parallel after 11A |
| 12 Event Pipeline | gRPC consumers can subscribe to event fan-out |
| 13 Content Scale | Client-streaming vector/blob ingest via gRPC |
| 14 Search/Graph Prod | gRPC reindex triggers; no REST change |
| Distributed fabric | Transport registry + metadata propagation via `TransportContext` |
| External SDK | Consumes OpenAPI + `.proto` artifacts from repo |

---

## References

- [00-CONSTITUTION.md](../core/constitution/00-CONSTITUTION.md) §7, §17–18
- [04-ARCHITECTURE.md](../core/architecture/04-ARCHITECTURE.md)
- [ADR-025 Capability discovery](../../docs/adr/025-capability-discovery-api.md)
- [Phase 10.5 DESIGN](../phases/10.5-transport-connectivity/DESIGN.md)
- [10-POST-ROADMAP.md](../phases/roadmap/10-POST-ROADMAP.md)
