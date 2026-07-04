# ADR-030: Autonomous Agent Ecosystem — External Runtime Boundary (Phase 15)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

AI Brain is a **memory foundation** consumed by multiple AI coding assistants. Phases 7 and 7.5 defined the agent runtime **outside** the repository and implemented capability discovery (ADR-025). Phase 9 added workspace-scoped **agent identity** (`IAgentIdentity`, `register_agent` MCP tool). Phases 10.5–14 add transport, streaming protocols, and federation.

Users need **Cursor, Claude (Code/Desktop), OpenAI (API/Agents SDK), Gemini CLI, Codex, Continue, Qwen** — and future clients — to operate on the **same Memory Cloud** without forking memory per vendor.

Constitution §3 and §55: reasoning, planning, execution, and agent orchestration **must not** enter this repository.

## Problem

1. **Client fragmentation** — each AI tool has different connection patterns (MCP stdio vs REST vs gRPC); no canonical ecosystem manifest.
2. **Agent taxonomy gap** — `agent_type` exists but no SSOT catalog linking client → protocol → scope env vars.
3. **Discovery incomplete** — ADR-025 manifest lacks per-client connection templates and certified compatibility rows.
4. **Scope confusion** — risk of implementing agent loops inside repo to "support" new clients.
5. **Roadmap collision** — POST-ROADMAP Phase 15 was Content Scale; ecosystem work is orthogonal → renumber Content Scale to **Phase 17**.

## Constraints

- **Agent runtime outside repo** — non-negotiable (Constitution, Phase 7).
- Repository exposes **REST, MCP, gRPC** only (Phase 13) — no agent SDK package inside repo.
- **`MemoryService` unchanged** — ecosystem layer is metadata + manifest + optional catalog ports.
- **Additive** — existing MCP tools and REST v1 stable.
- Agent **identity** uses existing `IAgentIdentity` — no new orchestration service.
- External `@ai-brain/client` SDK remains **outside** repo (ADR-025).

## Alternatives

### Option A — Ecosystem catalog + manifest extension + client profiles (recommended)

- Pros: Constitution-safe; enables multi-client Memory Cloud; testable compatibility matrix.
- Cons: Documentation + manifest maintenance.

### Option B — Embed lightweight agent runner in repo

- Pros: "Batteries included."
- Cons: **Violates constitution**; rejected.

### Option C — Documentation only (PANDUAN) — no manifest

- Pros: Zero code.
- Cons: Drift; agents cannot discover client profiles programmatically; insufficient.

## Decision

**Adopt Option A — Phase 15 Autonomous Agent Ecosystem:**

1. Introduce **`src/ecosystem/`** module — **catalog and manifest only** (no agent execution).
2. **`IAgentClientCatalog`** port — SSOT for external client profiles (Cursor, Claude, …).
3. **`AgentEcosystemManifestBuilder`** — extends capability manifest with `ecosystem.clients[]`, connection templates, protocol hints.
4. **`GET /api/v1/ecosystem/clients`** — public read-only catalog (additive).
5. Canonical **`AgentClientType`** enum / registry — maps to Phase 9 `agent_type` values.
6. **PANDUAN § ecosystem** — human setup per client; generated from same SSOT where possible.
7. **Compatibility matrix** — client × REST × MCP × gRPC × workspace × handoff (contract tests).
8. Renumber Content Scale → **Phase 17**.

**Explicit non-goals:** Planner, executor, tool router, LangGraph/CrewAI runtime, OpenAI Agents loop inside repo.

## Tradeoffs

- **Gain:** One Memory Cloud, many agents; clear boundary; SDK consumers get machine-readable profiles.
- **Accept:** Catalog must update when new clients emerge (additive rows).
- **Defer:** Certified third-party agent marketplace; hosted agent runtime product.

## Migration

| Track | Action | MemoryService |
|-------|--------|---------------|
| 15A | Client catalog types + SSOT JSON/TS registry | None |
| 15B | `IAgentClientCatalog` + builder | None |
| 15C | Manifest + REST endpoint | None |
| 15D | MCP optional `list_agent_clients` or embed in `get_capabilities` | None |
| 15E | PANDUAN + compatibility tests | None |

## Rollback

- Remove `src/ecosystem/` and ecosystem routes — zero impact on memory CRUD.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 17 Content Scale | Blob refs in handoff bundles |
| 14 Federation | Multi-node Memory Cloud + multi-agent |
| External SDK | Consumes ecosystem manifest |

---

## References

- [Phase 7 Agent Runtime DESIGN](../phases/07-agent-runtime/DESIGN.md)
- [ADR-007 Multi-AI workspace](../../../docs/adr/007-multi-ai-workspace-scope.md)
- [ADR-025 Capability discovery](../../../docs/adr/025-capability-discovery-api.md)
- [Phase 15 DESIGN](../phases/15-autonomous-agent-ecosystem/DESIGN.md)
