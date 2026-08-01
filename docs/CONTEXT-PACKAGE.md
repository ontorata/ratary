# Context Package wire (ADR-1011 · ADR-1012 · ADR-1013 · ADR-1014 · ADR-1016 · ADR-1017)

**Status:** Additive on `POST /context` (buildPrompt path)  
**Knowledge:** [docs-ai ADR-1011](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1011-context-assembly-strategy.md) · [ADR-1012](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1012-context-versioning-model.md) · [ADR-1013](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1013-context-lifecycle-state-machine.md) · [ADR-1014](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1014-context-caching-strategy.md) · [ADR-1016](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1016-context-confidence-tracking.md) · [ADR-1017](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1017-context-staleness-detection.md) · [wire evidence](https://github.com/ontorata/docs-ai/blob/main/products/ratary/evidence/ADR-1011-CONTEXT-PACKAGE-WIRE-2026-07-31.md)

## Operator summary

Successful context assembly responses now include a Ratary-issued **Context Package** envelope in addition to existing `system` / `user` / `context` fields:

| Field | Meaning |
|-------|---------|
| `packageId` | UUID minted by Ratary — **also the package version identity** (ADR-1012) |
| `ownerId` | Scope owner |
| `createdAt` | ISO-8601 mint time |
| `confidence` | `high` \| `medium` \| `low` — interim model **`heuristic-top-relevance-v1`** (ADR-1016); advisory, not Ontory gate |
| `updateMechanism` | `ratary-buildContext-v1` — refresh = **remint** (ADR-1017), not patch |
| `sourceLabels` | Rank-order memory codenames/titles |
| `query` | Effective query (or task when query omitted) |

**Versioning (ADR-1012):** Packages are **immutable**. Each successful assembly mints a **new** `packageId`. No semver, parent-child, or delta packages in v1. Memory updates do not rewrite prior packages.

**Lifecycle (ADR-1013):** Normative usage states are `active` → `retired` → `archived` (Horizon `draft` is not a package state). Minted packages behave as **`active`** for the receiving turn. Retire/archive APIs and optional wire `lifecycleState` are **not** shipped yet.

**Caching (ADR-1014):** Do **not** reuse a Context Package across responses. Optional retrieval-stage cache may live inside Ratary later; **no** Redis/edge/desktop package cache in v1.

**Confidence (ADR-1016):** Empty → `low`; else top `relevanceScore` ≥0.7 → `high`, ≥0.3 → `medium`, else `low`. Multi-signal `confidence-product-v1` deferred.

**Staleness (ADR-1017):** New recall turn → new package. Package freshness ≠ ADR-066 memory decay. Optional `staleHint` deferred.

OpenAPI: `BuildContextResponse` in `packages/openapi/ratary-v1.openapi.json`. Regenerated language SDKs under `packages/sdk-*`.
