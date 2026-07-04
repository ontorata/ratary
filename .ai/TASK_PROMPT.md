# Task Prompt — Phase 10.5 Transport & Connectivity Layer

**Status:** 🔄 In Progress — ADR-027 ✅ Approved (2026-07-04); tracks 10.5A–10.5B ✅  
**Handoff:** [10.5-transport-connectivity/TASK_PROMPT.md](phases/10.5-transport-connectivity/TASK_PROMPT.md)  
**Template:** [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md)  
**Roadmap:** [phases/roadmap/10-POST-ROADMAP.md](phases/roadmap/10-POST-ROADMAP.md) § Phase 10.5

---

# TASK

**Phase 10.5 — Transport & Connectivity Layer** (P1 extension post–Phase 11)

**Objective:** Formalize `src/transport/`, shared application handlers, optional gRPC (default OFF), manifest transport section — **without changing** application services, repositories, or storage ports.

**Authorized:** Lutfi Ramadhan — 2026-07-04 (after Phase 11 gate PASS)

---

## ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [027](../../docs/adr/027-transport-connectivity-layer.md) | Transport & Connectivity Layer | ✅ **Approved** (2026-07-04) |
| [025](../../docs/adr/025-capability-discovery-api.md) | Capability discovery (transport block amend) | ✅ Implemented |

---

## Milestones

- [x] ADR-027 Approved (2026-07-04)
- [x] Phase 11 gate PASS — parallel OK
- [x] 10.5A — `TransportContext`, `resolve-transport-scope`, transport errors
- [x] 10.5B — Shared `IApplicationHandler` (≥10 use cases)
- [ ] 10.5C — REST → `transport/rest/` (strangler re-exports)
- [ ] 10.5D — MCP → `transport/mcp/` (strangler re-exports)
- [ ] 10.5E — gRPC v1 behind `GRPC_ENABLED=false`
- [ ] 10.5F — Manifest transport section + docs
- [ ] Gate REVIEW PASS

---

## Definition of Done

- [ ] SC-10.5-01 through SC-10.5-08 PASS ([DESIGN.md](phases/10.5-transport-connectivity/DESIGN.md) §10)
- [ ] 457+ tests green at default env
- [ ] No service/repository logic change
- [ ] `GRPC_ENABLED=false` default

---

## Quality gate (every commit)

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

---

*Rotated from Phase 11 gate PASS 2026-07-04.*
