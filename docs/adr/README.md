# Architecture Decision Records (ADR)

Index of structural decisions. **Policy:** [ADR-POLICY.md](../ADR-POLICY.md)

| ADR | Title | Status | Unblocks |
|-----|-------|--------|----------|
| [000-template.md](000-template.md) | Template | — | — |
| [001-multi-source-retrieval.md](001-multi-source-retrieval.md) | Multi-source retrieval (Phase 6) | **Proposed** | Hybrid RAG |
| [002-workspace-identity-model.md](002-workspace-identity-model.md) | Workspace & identity model (future contract) | **Approved** | Phases 8–10 path |
| [003-embedding-storage-mvp.md](003-embedding-storage-mvp.md) | Embedding storage MVP | **Implemented** | Phase 5 ✅ |
| [004-repository-port-types.md](004-repository-port-types.md) | Repository port type boundaries | **Implemented** | Postgres swap |
| [005-content-object-store.md](005-content-object-store.md) | Content offload via IContentStore | **Proposed** | R2/S3/MinIO |

**Rule:** No implementation of Proposed ADRs until owner marks **Approved**.

**Phase 5 complete:** [ADR-003](003-embedding-storage-mvp.md) and [ADR-004](004-repository-port-types.md) are **Implemented**.

**Next:** [ADR-001](001-multi-source-retrieval.md) — approve before Phase 6 Hybrid Retrieval.
