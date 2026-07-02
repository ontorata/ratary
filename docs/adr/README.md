# Architecture Decision Records (ADR)

Index of structural decisions. **Policy:** [ADR-POLICY.md](../ADR-POLICY.md)

| ADR | Title | Status | Unblocks |
|-----|-------|--------|----------|
| [000-template.md](000-template.md) | Template | — | — |
| [001-multi-source-retrieval.md](001-multi-source-retrieval.md) | Multi-source retrieval (Phase 6) | **Proposed** | Hybrid RAG |
| [002-workspace-identity-model.md](002-workspace-identity-model.md) | Workspace & identity model (future contract) | **Approved** | Phases 8–10 path |
| [003-embedding-storage-mvp.md](003-embedding-storage-mvp.md) | Embedding storage MVP | **Proposed** | Phase 5 coding |
| [004-repository-port-types.md](004-repository-port-types.md) | Repository port type boundaries | **Proposed** | Postgres swap |
| [005-content-object-store.md](005-content-object-store.md) | Content offload via IContentStore | **Proposed** | R2/S3/MinIO |

**Rule:** No implementation of Proposed ADRs until owner marks **Approved**.

**Pre–Phase 5:** [ADR-002](002-workspace-identity-model.md) is **Approved** (contract only — no schema/code).

**Active task:** [TASK_PROMPT.md](../TASK_PROMPT.md) — Phase 5 Embedding (blocked until ADR-003 + ADR-004 Approved).
