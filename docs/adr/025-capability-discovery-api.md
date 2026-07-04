# ADR-025: Capability Discovery API

**Status:** Implemented  
**Date:** 2026-07-04  
**Approved:** 2026-07-04 (owner — DESIGN + implementation plan)  
**Implemented:** 2026-07-04 — `GET /api/v1/capabilities`, MCP `get_capabilities`, `CapabilityManifestBuilder`  
**Deciders:** Project owner  

---

## Context

Phase 7 (Agent Runtime Boundary) DESIGN approved `AICapabilityManifest` (§10), compatibility matrix (§13), OpenAPI references (§12), and MCP/REST protocol contracts. **`GET /api/v1/capabilities` is not yet implemented**; MCP has no manifest tool.

Architecture Review (2026-07-04) classified **Phase 7.5 Runtime Compatibility** as gap closure — high value, small scope, not a new agent runtime.

Design reference: [.ai/phases/07.5-runtime-compatibility/DESIGN.md](../../.ai/phases/07.5-runtime-compatibility/DESIGN.md)

Related: Phase 7 DESIGN §10–§12; `src/plugins/swagger.ts` (`/docs/json`).

---

## Problem

| Gap today | Need |
|-----------|------|
| Agents discover limits by trial-and-error | Machine-readable **capability manifest** |
| Tool count drift (docs vs registry) | Manifest `mcp.toolNames` ↔ `EXPECTED_TOOLS` contract test |
| Deployment flags opaque to clients | Env-derived `capabilities.*` booleans |
| No single SDK contract in repo | OpenAPI + manifest as external SDK source |
| Error codes / rate limits in DESIGN only | Wire `errorCodes`, `rateLimits` arrays |

External agent runtimes (Cursor, Claude Code, custom bots) need discovery **without** reading source or guessing env.

---

## Constraints

- **No agent runtime, planner, or SDK package inside this repository.**
- Manifest builder reads config/registries only — no reasoning.
- REST and MCP share **one** `CapabilityManifestBuilder` code path.
- Additive API fields only; existing endpoints unchanged.
- MCP existing 19 tools — signatures unchanged; optional new `get_capabilities` tool.
- Auth: manifest endpoint public (recommended) or optional auth — owner decides at Approval.
- Implementation blocked until **Approved**.

---

## Alternatives

### Option A — `GET /api/v1/capabilities` + MCP `get_capabilities` + shared builder

- Pros: Matches Phase 7 DESIGN; testable; deployment-accurate.
- Cons: New public surface to maintain.

### Option B — OpenAPI `/docs/json` only

- Pros: Already exists.
- Cons: No runtime flags (hybrid, graph, workspace); no MCP tool list; insufficient for agents.

### Option C — Static JSON file in repo

- Pros: Simple.
- Cons: Drifts from deployment; violates manifest reflects truth invariant; rejected.

---

## Decision

**Adopt Option A** (pending owner Approval):

1. **`CapabilityManifestBuilder`** at composition root — inputs: env, adapter registry, MCP tool list.
2. **`GET /api/v1/capabilities`** — returns `AICapabilityManifest` (Phase 7 §10 shape + extensions for 5.5/6.5).
3. **MCP tool `get_capabilities`** (canonical name; supersedes Phase 7 draft `capabilities`) — same JSON in `content[].text`.
4. **OpenAPI:** register response schema under tag `Capabilities`.
5. **Contract test:** manifest tool count/names === `tests/mcp/tools.test.ts` `EXPECTED_TOOLS`.
6. **Optional:** `X-Protocol-Version` response header (additive track).

Auth default recommendation: **public** (no secrets in manifest); owner may require auth for enterprise deployments via amendment.

---

## Tradeoffs

- Public manifest exposes feature topology (not memory data) — acceptable for discovery.
- Builder must update when new env flags added — mitigated by single module + tests.
- External SDK remains out of repo — manifest is the contract.

---

## Migration

1. No schema migration.
2. Add route + MCP tool + swagger schema.
3. Update Phase 7 DESIGN endpoint table to implemented.
4. No breaking changes to existing clients.

---

## Rollback

1. Remove route and MCP tool (additive — safe).
2. Clients fall back to OpenAPI + documentation.

---

## Impact on future phases

| Phase / track | Impact |
|---------------|--------|
| 5.5 Compression | `supportsSemanticCompression` flag |
| 6.5 Progressive Retrieval | `retrievalPolicyVersion`, `defaultContentMode` |
| 8.5 Quality signals | `supportsQualitySignals` |
| 12 Event pipeline | `supportsEventSubscription` scoped flags |
| External SDK | Consumes manifest; not in repo |

---

## References

- [.ai/phases/07.5-runtime-compatibility/DESIGN.md](../../.ai/phases/07.5-runtime-compatibility/DESIGN.md)
- [.ai/phases/07-agent-runtime/DESIGN.md](../../.ai/phases/07-agent-runtime/DESIGN.md) §10
- [src/plugins/swagger.ts](../../src/plugins/swagger.ts)
- [00-CONSTITUTION.md](../../.ai/core/constitution/00-CONSTITUTION.md) §30
- [POLICY.md](POLICY.md)
