# Architecture Decision Records (ADR)

Index of structural decisions. **Policy:** [POLICY.md](POLICY.md)

| ADR | Title | Status | Unblocks |
|-----|-------|--------|----------|
| [000-template.md](000-template.md) | Template | — | — |
| [001-multi-source-retrieval.md](001-multi-source-retrieval.md) | Multi-source retrieval (Phase 6) | **Implemented** | Hybrid RAG |
| [002-workspace-identity-model.md](002-workspace-identity-model.md) | Workspace & identity model (future contract) | **Approved** | Phases 8–10 path |
| [003-embedding-storage-mvp.md](003-embedding-storage-mvp.md) | Embedding storage MVP | **Implemented** | Phase 5 ✅ |
| [004-repository-port-types.md](004-repository-port-types.md) | Repository port type boundaries | **Implemented** | Postgres swap |
| [005-content-object-store.md](005-content-object-store.md) | Content offload via IObjectStorage / R2 | **Approved** | R2/S3/MinIO |
| [006-igraph-provider.md](006-igraph-provider.md) | Graph provider port (Phase 8) | **Implemented** | Knowledge Graph ✅ |
| [007-multi-ai-workspace-scope.md](007-multi-ai-workspace-scope.md) | Multi-AI workspace scope (Phase 9) | **Implemented** | Shared workspace memory |
| [008-platform-architecture.md](008-platform-architecture.md) | Platform ports — storage-agnostic layer (Phase 9.5) | **Implemented** | Enterprise adapter swap |
| [009-postgresql-metadata-adapter.md](009-postgresql-metadata-adapter.md) | PostgreSQL metadata adapter (Phase 10) | **Approved** | Postgres swap |
| [010-workspace-membership-rbac.md](010-workspace-membership-rbac.md) | Workspace membership RBAC (Phase 10) | **Implemented** | Enterprise tenancy |
| [011-pgvector-store-adapter.md](011-pgvector-store-adapter.md) | pgvector vector store adapter | **Approved** | Vector scale |
| [012-redis-cache-adapter.md](012-redis-cache-adapter.md) | Redis / Valkey cache adapter | **Approved** | Cache layer |
| [013-duckdb-analytics-store.md](013-duckdb-analytics-store.md) | DuckDB analytics store (dev reference) | **Approved** | Analytics port |
| [014-meilisearch-retrieval-source.md](014-meilisearch-retrieval-source.md) | Meilisearch retrieval source | **Approved** | External search index |
| [015-neo4j-graph-store-adapter.md](015-neo4j-graph-store-adapter.md) | Neo4j graph store adapter | **Approved** | Graph scale |
| [016-redis-streams-event-bus.md](016-redis-streams-event-bus.md) | Redis Streams event bus | **Approved** | Async events |
| [017-memory-access-audit.md](017-memory-access-audit.md) | Memory access audit (opt-in) | **Implemented** | Compliance trail |

**Rule:** No implementation of Proposed ADRs until owner marks **Approved**.

**Phase 9 complete:** ADR-007 Implemented (2026-07-03).

**Phase 9.5 complete:** ADR-008 Implemented (2026-07-03).

**Phase 10:** ADR-005–017 Approved/Implemented; gate PASS (2026-07-03).

**Implementation plan:** [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)
