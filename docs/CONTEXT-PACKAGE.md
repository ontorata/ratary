# Context Package wire (ADR-1010…1014 · 1016–1019)

**Status:** Additive on `POST /context` (buildPrompt path)  
**Knowledge:** [docs-ai Area 2 ADRs](https://github.com/ontorata/docs-ai/tree/main/architecture/acos) · [wire evidence](https://github.com/ontorata/docs-ai/blob/main/products/ratary/evidence/ADR-1011-CONTEXT-PACKAGE-WIRE-2026-07-31.md)

## Operator summary

Successful context assembly responses include a Ratary-issued **Context Package** envelope plus `system` / `user` / `context`:

| Field | Meaning |
|-------|---------|
| `packageId` | UUID — version identity (ADR-1012); remint every success |
| `ownerId` | Scope owner |
| `createdAt` | ISO-8601 mint time |
| `confidence` | `high` \| `medium` \| `low` — `heuristic-top-relevance-v1` (ADR-1016); advisory |
| `updateMechanism` | `ratary-buildContext-v1` — refresh/propagate = **remint** (ADR-1017/1019) |
| `sourceLabels` | Rank-order memory codenames/titles |
| `query` | Effective query (or task when query omitted) |

| Topic | Rule |
|-------|------|
| Lifecycle (1013) | `active`→`retired`→`archived` vocabulary; wire FSM deferred |
| Caching (1014) | No package reuse; optional Ratary retrieval cache only |
| Staleness (1017) | New turn → remint; ≠ ADR-066 memory decay |
| Retrieval opt (1018) | Optimizations inside Ratary only |
| Update prop (1019) | Pull/remint; no push invalidation bus in v1 |

OpenAPI: `BuildContextResponse` in `packages/openapi/ratary-v1.openapi.json`.
