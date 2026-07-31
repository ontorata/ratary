# Context Package wire (ADR-1011 · ADR-1012)

**Status:** Additive on `POST /context` (buildPrompt path)  
**Knowledge:** [docs-ai ADR-1011](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1011-context-assembly-strategy.md) · [ADR-1012](https://github.com/ontorata/docs-ai/blob/main/architecture/acos/ADR-1012-context-versioning-model.md) · [wire evidence](https://github.com/ontorata/docs-ai/blob/main/products/ratary/evidence/ADR-1011-CONTEXT-PACKAGE-WIRE-2026-07-31.md)

## Operator summary

Successful context assembly responses now include a Ratary-issued **Context Package** envelope in addition to existing `system` / `user` / `context` fields:

| Field | Meaning |
|-------|---------|
| `packageId` | UUID minted by Ratary — **also the package version identity** (ADR-1012) |
| `ownerId` | Scope owner |
| `createdAt` | ISO-8601 mint time |
| `confidence` | `high` \| `medium` \| `low` (v1 heuristic from top relevance / empty → `low`) |
| `updateMechanism` | `ratary-buildContext-v1` |
| `sourceLabels` | Rank-order memory codenames/titles |
| `query` | Effective query (or task when query omitted) |

**Versioning (ADR-1012):** Packages are **immutable**. Each successful assembly mints a **new** `packageId`. No semver, parent-child, or delta packages in v1. Memory updates do not rewrite prior packages.

OpenAPI: `BuildContextResponse` in `packages/openapi/ratary-v1.openapi.json`. Regenerated language SDKs under `packages/sdk-*`.
