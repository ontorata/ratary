# Architecture Decision Records (ADR)

Index of structural decisions. **Policy:** [POLICY.md](POLICY.md)

| ADR | Title | Status | Unblocks |
|-----|-------|--------|----------|
| [000-template.md](000-template.md) | Template | — | — |
| [001-multi-source-retrieval.md](001-multi-source-retrieval.md) | Multi-source retrieval (Phase 6) | **Implemented** | Hybrid RAG |
| [002-workspace-identity-model.md](002-workspace-identity-model.md) | Workspace & identity model | **Implemented** | Phases 8–10 scope contract |
| [003-embedding-storage-mvp.md](003-embedding-storage-mvp.md) | Embedding storage MVP | **Implemented** | Phase 5 ✅ |
| [004-repository-port-types.md](004-repository-port-types.md) | Repository port type boundaries | **Implemented** | Postgres swap |
| [005-content-object-store.md](005-content-object-store.md) | Content offload via IObjectStorage / R2 | **Implemented** | R2/S3/MinIO |
| [006-igraph-provider.md](006-igraph-provider.md) | Graph provider port (Phase 8) | **Implemented** | Knowledge Graph ✅ |
| [007-multi-ai-workspace-scope.md](007-multi-ai-workspace-scope.md) | Multi-AI workspace scope (Phase 9) | **Implemented** | Shared workspace memory |
| [008-platform-architecture.md](008-platform-architecture.md) | Platform ports — storage-agnostic layer (Phase 9.5) | **Implemented** | Enterprise adapter swap |
| [009-postgresql-metadata-adapter.md](009-postgresql-metadata-adapter.md) | PostgreSQL metadata adapter (Phase 10) | **Implemented** | Postgres swap |
| [010-workspace-membership-rbac.md](010-workspace-membership-rbac.md) | Workspace membership RBAC (Phase 10) | **Implemented** | Enterprise tenancy |
| [011-pgvector-store-adapter.md](011-pgvector-store-adapter.md) | pgvector vector store adapter | **Implemented** | Vector scale |
| [012-redis-cache-adapter.md](012-redis-cache-adapter.md) | Redis / Valkey cache adapter | **Implemented** | Cache layer |
| [013-duckdb-analytics-store.md](013-duckdb-analytics-store.md) | DuckDB analytics store (dev reference) | **Implemented** | Analytics port |
| [014-meilisearch-retrieval-source.md](014-meilisearch-retrieval-source.md) | Meilisearch retrieval source | **Implemented** | External search index |
| [015-neo4j-graph-store-adapter.md](015-neo4j-graph-store-adapter.md) | Neo4j graph store adapter | **Implemented** | Graph scale |
| [016-redis-streams-event-bus.md](016-redis-streams-event-bus.md) | Redis Streams event bus | **Implemented** | Async events |
| [017-memory-access-audit.md](017-memory-access-audit.md) | Memory access audit (opt-in) | **Implemented** | Compliance trail |
| [018-production-postgres-cutover.md](018-production-postgres-cutover.md) | Production Postgres cutover | **Approved** | Phase 11 |
| [023-semantic-compression-policy.md](023-semantic-compression-policy.md) | Semantic compression policy (Phase 5.5) | **Implemented** | Token scale / consolidation |
| [024-progressive-retrieval-policy.md](024-progressive-retrieval-policy.md) | Progressive retrieval policy (Phase 6.5) | **Implemented** | Context budget / staged hydration |
| [025-capability-discovery-api.md](025-capability-discovery-api.md) | Capability discovery API (Phase 7.5) | **Implemented** | `GET /capabilities`, MCP manifest |
| [026-memory-quality-signals.md](026-memory-quality-signals.md) | Memory quality signals — ingest not agent learning (Phase 8.5) | **Implemented** | Ranking adaptation / Phase 12 |

**Rule:** No implementation of Proposed/Draft ADRs until owner marks **Approved**.

**Phases 1–10 ADR closure:** ADR-001–017 **Implemented** (2026-07-03).

**Phase 11 ADR gate:** [ADR-018](018-production-postgres-cutover.md) **Approved** (2026-07-03) — implementation authorized after Readiness PASS.

**Extension tracks (5.5–8.5):** ADR-023–026 **Implemented** (2026-07-04).

**Planned (POST-ROADMAP, not yet filed):** ADR-019 (repo split, optional), ADR-020 (event consumers), ADR-021 (content blob lifecycle), ADR-022 (search/graph cutover) — see [10-POST-ROADMAP.md](../../.ai/phases/roadmap/10-POST-ROADMAP.md).

**Post–Phase 10:** [10-POST-ROADMAP.md](../../.ai/phases/roadmap/10-POST-ROADMAP.md) — Phase 11 next.

**Implementation plan:** [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)
