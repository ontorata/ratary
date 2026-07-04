# Phase 10.5 — Transport & Connectivity Layer

**Status:** 🔲 Reserved — Design draft awaiting owner approval (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 10.5  
**ADR gate:** [ADR-027](../../adr/027-transport-connectivity-layer.md) — **Proposed**

---

## Summary

Formalize **Transport & Connectivity** as a canonical outer layer. REST and MCP remain default; optional gRPC for internal/enterprise workloads. Application services unchanged.

| Track | Focus |
|-------|-------|
| 10.5A | `TransportContext` + shared scope resolution |
| 10.5B | Shared application handlers (anti-drift) |
| 10.5C | REST folder migration (`transport/rest/`) |
| 10.5D | MCP consolidation (`transport/mcp/`) |
| 10.5E | gRPC opt-in (`GRPC_ENABLED=false` default) |
| 10.5F | Manifest + documentation |

**Hard dependency:** Phase 10 ✅ · Phase 7.5 ✅ (`GET /api/v1/capabilities`)  
**Parallel OK with:** Phase 11 (after 11A runbook exists) — **must not block** SC-11-01 / SC-11-05

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Approved design intent (this phase) |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Implementation prompt (activate after ADR-027 Approved) |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [COMPLETION_TEMPLATE.md](COMPLETION_TEMPLATE.md) | Closure evidence form |
| [RISKS.md](RISKS.md) | Phase risk register |

**Not yet created (post-approval):** IMPLEMENTATION.md · MIGRATION.md · TESTING.md · REVIEW.md · COMPLETION.md · RETROSPECTIVE.md

---

## Non-goals

- Business logic changes in `MemoryService`, `SearchService`, `KnowledgeService`
- Repository or storage port changes
- Breaking REST v1 or MCP tool schemas
- Agent runtime inside repo
- GraphQL (deferred)
- SDK npm package inside repo (`@ai-brain/client` remains external)

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Implementation blocked until ADR-027 **Approved**.*
