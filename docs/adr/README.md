# Architecture Decision Records (ADR)

Index of structural decisions. **Policy:** [POLICY.md](POLICY.md)

| ADR | Title | Status | Unblocks |
|-----|-------|--------|----------|
| [000-template.md](000-template.md) | Template | — | — |
| [001-multi-source-retrieval.md](001-multi-source-retrieval.md) | Multi-source retrieval (Phase 6) | **Approved** | Hybrid RAG |
| [002-workspace-identity-model.md](002-workspace-identity-model.md) | Workspace & identity model (future contract) | **Approved** | Phases 8–10 path |
| [003-embedding-storage-mvp.md](003-embedding-storage-mvp.md) | Embedding storage MVP | **Implemented** | Phase 5 ✅ |
| [004-repository-port-types.md](004-repository-port-types.md) | Repository port type boundaries | **Implemented** | Postgres swap |
| [005-content-object-store.md](005-content-object-store.md) | Content offload via IContentStore | **Proposed** | R2/S3/MinIO |
| [006-igraph-provider.md](006-igraph-provider.md) | Graph provider port (Phase 8) | **Approved** | Knowledge Graph retrieval |

**Rule:** No implementation of Proposed ADRs until owner marks **Approved**.

**Phase 7 complete:** Agent boundary documented; foundation ready for Phase 8.

**Next:** Phase 8 implementation per [ADR-006](006-igraph-provider.md) (Approved 2026-07-03).
