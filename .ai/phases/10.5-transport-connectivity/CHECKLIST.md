# Phase 10.5 — Transport & Connectivity — CHECKLIST

**Phase status:** 🔲 Reserved — Design draft (2026-07-04); awaiting owner approval  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-027](../../adr/027-transport-connectivity-layer.md)

---

## Readiness Review (Phase 10 → Phase 10.5)

### A — Governance

- [ ] [constitution/INDEX.md](../../core/constitution/INDEX.md) — authority chain verified for Phase 10.5 scope
- [x] Phase 10 **PASS** — [10-enterprise/REVIEW.md](../10-enterprise/REVIEW.md)
- [x] Phase 7.5 complete — ADR-025 Implemented
- [ ] Architecture Review 2026-07-04 recorded in [DESIGN.md](DESIGN.md)
- [ ] No constitutional violation — transport = adapter only

### B — Dependencies

- [x] Hard dependency Phase 10 ✅
- [x] Hard dependency ADR-025 ✅ (`CapabilityManifestBuilder`)
- [x] Phase 3 auth at edge ✅
- [ ] Phase 11 not blocked — owner confirms parallel OK after 11A
- [ ] No breaking change identified — ADR-027 Proposed sufficient

### C — ADR gates

- [ ] [ADR-027](../../adr/027-transport-connectivity-layer.md) — **Approved** (currently Proposed)
- [x] ADR-025 — Implemented (additive manifest amend only)
- [ ] No conflicting Proposed ADRs

### D — Extension points

- [x] `CapabilityManifestBuilder` — extend `transport` section
- [x] `resolve-request-scope.ts` — unify into `TransportContext`
- [x] `MCP_TOOL_NAMES` — SSOT for tool registry
- [x] Composition roots `server.ts`, `mcp/server.ts` — migrate to registry
- [ ] Reuse assessment documented in DESIGN §1.3

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

- [ ] Owner explicit authorization for Phase 10.5 open
- [ ] ADR-027 Approved
- [ ] Root [TASK_PROMPT.md](../../TASK_PROMPT.md) rotation decision (10.5 vs continue 11)
- [ ] Implementation **not started** until §F complete

---

## Readiness decision record

| Field | Value |
|-------|-------|
| **Closing context** | Phase 10 ✅ · Phase 7.5 ✅ |
| **Opening phase** | 10.5 — Transport & Connectivity |
| **Date** | _pending owner_ |
| **Reviewer** | _pending_ |
| **Verdict** | _pending_ |
| **ADR gates** | ADR-027 Proposed |
| **Conditions** | Phase 11 P0 not blocked; owner approves parallel or sequential |

---

## §1 — Design

- [ ] [DESIGN.md](DESIGN.md) complete
- [ ] [RISKS.md](RISKS.md) initial register
- [ ] Boundary table reviewed
- [ ] Non-goals confirmed (no service/repo/storage change)
- [ ] Breaking change assessment PASS (none identified)

## §2 — Implementation tracks

### 10.5A — Shared transport context

- [ ] `TransportContext` types
- [ ] Unified scope resolver (REST + MCP + gRPC metadata)
- [ ] Transport error mapping
- [ ] Zero behavior change verified

### 10.5B — Shared handlers

- [ ] `IApplicationHandler` contract
- [ ] ≥10 handlers extracted (save, search, get, context, capabilities, …)
- [ ] REST controller delegates to handler
- [ ] MCP tool delegates to same handler

### 10.5C — REST migration

- [ ] `transport/rest/` structure
- [ ] Re-exports from legacy `routes/`, `controllers/`
- [ ] All REST E2E green

### 10.5D — MCP migration

- [ ] `transport/mcp/` structure
- [ ] Re-exports from legacy `mcp/`
- [ ] All MCP tests green; 20 tools unchanged

### 10.5E — gRPC opt-in

- [ ] Proto v1 `ai.brain.v1`
- [ ] `GrpcServer implements ITransportServer`
- [ ] `GRPC_ENABLED=false` default
- [ ] Memory + Context (stream) + Health RPCs
- [ ] Optional CI job (not default gate)

### 10.5F — Docs & manifest

- [ ] `AICapabilityManifest.transport` additive fields
- [ ] Contract tests for manifest transport section
- [ ] [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) updated
- [ ] PANDUAN § transport added
- [ ] [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) status updated

## §3 — Testing

- [ ] Handler parity suite
- [ ] Transport contract tests (OpenAPI, MCP, proto)
- [ ] Layer lint: no transport imports in `services/`
- [ ] Default `npm test` — 457+ pass
- [ ] [TESTING.md](TESTING.md) authored at implementation

## §4 — Gate

- [ ] [REVIEW.md](REVIEW.md) architecture review PASS
- [ ] [COMPLETION.md](COMPLETION.md) evidence filled
- [ ] [RETROSPECTIVE.md](RETROSPECTIVE.md) within 7 days of gate
- [ ] ADR-027 status → **Implemented**
- [ ] [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md) updated if metrics change

---

*Frozen at gate PASS. Subordinate to [08-REVIEW.md](../../core/standards/08-REVIEW.md).*
