# Phase 10.5 — Transport & Connectivity — CHECKLIST

**Phase status:** ✅ Gate PASS — ADR-027 Implemented (2026-07-04); tracks 10.5A–10.5F ✅  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-027](../../adr/027-transport-connectivity-layer.md)

---

## Readiness Review (Phase 10 → Phase 10.5)

### A — Governance

- [x] [constitution/INDEX.md](../../core/constitution/INDEX.md) — authority chain verified for Phase 10.5 scope
- [x] Phase 10 **PASS** — [10-enterprise/REVIEW.md](../10-enterprise/REVIEW.md)
- [x] Phase 7.5 complete — ADR-025 Implemented
- [x] Architecture Review 2026-07-04 recorded in [DESIGN.md](DESIGN.md)
- [x] No constitutional violation — transport = adapter only

### B — Dependencies

- [x] Hard dependency Phase 10 ✅
- [x] Hard dependency ADR-025 ✅ (`CapabilityManifestBuilder`)
- [x] Phase 3 auth at edge ✅
- [x] Phase 11 gate PASS — parallel OK (2026-07-04)
- [x] No breaking change identified — ADR-027 Approved

### C — ADR gates

- [x] [ADR-027](../../adr/027-transport-connectivity-layer.md) — **Approved** (2026-07-04)
- [x] ADR-025 — Implemented (additive manifest amend only)
- [x] No conflicting Proposed ADRs — audit 2026-07-05: all structural ADRs Implemented/Accepted

### D — Extension points

- [x] `CapabilityManifestBuilder` — extend `transport` section
- [x] `resolve-request-scope.ts` — unify into `TransportContext`
- [x] `MCP_TOOL_NAMES` — SSOT for tool registry
- [x] Composition roots `server.ts`, `mcp/server.ts` — migrate to registry
- [x] Reuse assessment documented in DESIGN §1.3

### E — Impact preview

| Area | Assessed | Notes |
|------|----------|-------|
| Migration (schema) | None | No DDL |
| Folder structure | Yes | Strangler re-exports |
| REST API | None | v1 stable |
| MCP | None | Tool schemas stable |
| gRPC | Additive | `GRPC_ENABLED=false` default |
| Services | None | Logic unchanged |
| Repositories | None | |
| Storage ports | None | |
| Tests | Additive | Parity + contract suites |
| Deployment | Default unchanged | gRPC = long-running Node |
| Security | Yes | gRPC mTLS optional; same auth semantics |
| Rollback | Yes | Flag off + git revert per track |

### F — Authorization

- [x] Owner explicit authorization for Phase 10.5 open — Lutfi Ramadhan 2026-07-04
- [x] ADR-027 Approved
- [x] Root [TASK_PROMPT.md](../../TASK_PROMPT.md) rotated to Phase 10.5
- [x] Implementation started — track 10.5A

---

## Readiness decision record

| Field | Value |
|-------|-------|
| **Closing context** | Phase 10 ✅ · Phase 7.5 ✅ |
| **Opening phase** | 10.5 — Transport & Connectivity |
| **Date** | 2026-07-04 |
| **Reviewer** | AI assistant + owner authorization |
| **Verdict** | **PASS** — ADR-027 Approved; 10.5A in progress |
| **ADR gates** | ADR-027 ✅ Approved |
| **Conditions** | Phase 11 gate PASS ✅ |

---

## §1 — Design

- [x] [DESIGN.md](DESIGN.md) complete
- [x] [RISKS.md](RISKS.md) initial register
- [x] Boundary table reviewed
- [x] Non-goals confirmed (no service/repo/storage change)
- [x] Breaking change assessment PASS (none identified)

## §2 — Implementation tracks

### 10.5A — Shared transport context

- [x] `TransportContext` types — `src/transport/shared/transport-context.types.ts`
- [x] Unified scope resolver (REST + MCP + gRPC metadata) — `resolve-transport-scope.ts`
- [x] Transport error mapping — `transport-errors.ts`
- [x] Strangler re-export — `src/scope/resolve-request-scope.ts`
- [x] Zero behavior change verified — existing scope tests + `tests/transport/transport-shared.test.ts`

### 10.5B — Shared handlers

- [x] `IApplicationHandler` contract
- [x] ≥10 handlers extracted (save, search, get, context, capabilities, …)
- [x] REST controller delegates to handler
- [x] MCP tool delegates to same handler

### 10.5C — REST migration

- [x] `transport/rest/` structure — `rest-server.ts` + `RestTransportServer implements ITransportServer`
- [x] Re-exports from legacy `src/server.ts` (strangler shim)
- [x] All REST E2E green (api, auth, knowledge, workspaces, cross-scope leak suites)

### 10.5D — MCP migration

- [x] `transport/mcp/` structure — `mcp-server.ts` + `McpTransportServer`
- [x] Re-exports from legacy `src/mcp/server.ts`; `src/mcp/stdio.ts` entrypoint unchanged
- [x] All MCP tests green; 20 tools unchanged

### 10.5E — gRPC opt-in

- [x] Proto v1 `ontorata.ratary.v1` — `transport/grpc/proto/ontorata/ratary/v1/ratary.proto`
- [x] `GrpcTransportServer implements ITransportServer`
- [x] `GRPC_ENABLED=false` default; `@grpc/grpc-js` loaded only when enabled
- [x] Memory (unary) + Search (unary) + Context (server-stream) + Health RPCs
- [x] gRPC boot test on ephemeral port (not part of default socket gate)
- [x] Deps `@grpc/grpc-js` + `@grpc/proto-loader` added (`package.json`/`package-lock.json`); dynamic-imported only when `GRPC_ENABLED=true`

### 10.5F — Docs & manifest

- [x] `AICapabilityManifest.transport` additive fields (rest/mcp/grpc/sdk)
- [x] Contract tests for manifest transport section
- [x] [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) updated
- [x] PANDUAN § transport added
- [x] [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) status updated

## §3 — Testing

- [x] Handler parity suite (`tests/transport/handler-parity.test.ts`)
- [x] Transport contract tests (manifest transport; gRPC proto load + mappers)
- [x] Layer lint: no transport imports in `services/` (`tests/transport/layer-boundaries.test.ts`)
- [x] Default `npm test` — 546 pass (3 skipped)
- [x] Registry + gRPC boot tests authored at implementation

## §4 — Gate

- [x] [REVIEW.md](REVIEW.md) architecture review PASS
- [x] [COMPLETION.md](COMPLETION.md) evidence filled
- [x] [RETROSPECTIVE.md](RETROSPECTIVE.md) within 7 days of gate
- [x] ADR-027 status → **Implemented**
- [x] [IMPLEMENTATION.md](IMPLEMENTATION.md), [TESTING.md](TESTING.md), [MIGRATION.md](MIGRATION.md) authored

---

*Frozen at gate PASS. Subordinate to [08-REVIEW.md](../../core/standards/08-REVIEW.md).*
