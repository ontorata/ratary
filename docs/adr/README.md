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
| [018-production-postgres-cutover.md](018-production-postgres-cutover.md) | Production Postgres cutover | **Implemented** | Phase 11 gate PASS |
| [020-event-consumer-architecture.md](020-event-consumer-architecture.md) | Event consumer architecture (Phase 12) | **Implemented** | Analytics fan-out, Phase 13 events |
| [023-semantic-compression-policy.md](023-semantic-compression-policy.md) | Semantic compression policy (Phase 5.5) | **Implemented** | Token scale / consolidation |
| [024-progressive-retrieval-policy.md](024-progressive-retrieval-policy.md) | Progressive retrieval policy (Phase 6.5) | **Implemented** | Context budget / staged hydration |
| [025-capability-discovery-api.md](025-capability-discovery-api.md) | Capability discovery API (Phase 7.5) | **Implemented** | `GET /capabilities`, MCP manifest |
| [026-memory-quality-signals.md](026-memory-quality-signals.md) | Memory quality signals — ingest not agent learning (Phase 8.5) | **Implemented** | Ranking adaptation / Phase 12 |
| [027](../../.ai/adr/027-transport-connectivity-layer.md) | Transport & Connectivity Layer (Phase 10.5) | **Implemented** | gRPC opt-in, transport registry |
| [028-protocol-layer.md](../../.ai/adr/028-protocol-layer.md) | Protocol Layer — WS/SSE/stream/benchmark (Phase 13) | **Proposed** | Multi-protocol streaming |
| [029-federation-layer.md](../../.ai/adr/029-federation-layer.md) | Federation Layer — cross-node knowledge exchange (Phase 14) | **Proposed** | Global memory fabric |
| [030-autonomous-agent-ecosystem.md](../../.ai/adr/030-autonomous-agent-ecosystem.md) | Autonomous Agent Ecosystem (Phase 15) | **Proposed** | Multi-client Memory Cloud |
| [031-developer-platform.md](../../.ai/adr/031-developer-platform.md) | Developer Platform (Phase 16) | **Proposed** | SDK, CLI, remote MCP |
| [032-enterprise-security.md](../../.ai/adr/032-enterprise-security.md) | Enterprise Security (Phase 17) | **Proposed** | SSO, OPA, ABAC |
| [033-cloud-platform.md](../../.ai/adr/033-cloud-platform.md) | Cloud Platform (Phase 18) | **Proposed** | Control plane, metering |
| [034-observability-platform.md](../../.ai/adr/034-observability-platform.md) | Observability Platform (Phase 19) | **Proposed** | OTel, Grafana |
| [035-ai-infrastructure-platform.md](../../.ai/adr/035-ai-infrastructure-platform.md) | AI Infrastructure Platform (Phase 20) | **Proposed** | Plugin marketplace |
| [036-global-ai-intelligence-platform.md](036-global-ai-intelligence-platform.md) | Global AI Intelligence Platform — capstone (Phase 25) | **Proposed** | Distributed telemetry/analytics/sync |
| [037-ai-telemetry-event-model.md](037-ai-telemetry-event-model.md) | AI Telemetry Event Model (Phase 25) | **Proposed** | Semantic OTLP telemetry |
| [038-usage-analytics-engine.md](038-usage-analytics-engine.md) | Usage Analytics Engine (Phase 25) | **Proposed** | Quality/adoption/cost KPIs |
| [043-cloud-federation-sync-topology.md](043-cloud-federation-sync-topology.md) | Cloud Federation Sync Topology (Phase 25) | **Proposed** | 5-tier global sync |

**Planned (POST-ROADMAP, not yet filed):** ADR-019 (repo split, optional), ADR-021 (content blob lifecycle), ADR-022 (search/graph cutover) — see [10-POST-ROADMAP.md](../../.ai/phases/roadmap/10-POST-ROADMAP.md).

**Extension ADR (Proposed):** [ADR-048 Remote MCP transport](../../.ai/adr/048-remote-mcp-transport.md) — Phase 13.1 ChatGPT / web MCP clients.

**Rule:** No implementation of Proposed/Draft ADRs until owner marks **Approved**.

**Phases 1–10 ADR closure:** ADR-001–017 **Implemented** (2026-07-03).

**Phase 11 ADR gate:** [ADR-018](018-production-postgres-cutover.md) **Implemented** (gate PASS 2026-07-04).

**Extension tracks (5.5–8.5):** ADR-023–026 **Implemented** (2026-07-04).

**Phase 10.5 ADR gate:** [ADR-027](../../.ai/adr/027-transport-connectivity-layer.md) **Implemented** (2026-07-04).

**Phase 12 ADR gate:** [ADR-020](020-event-consumer-architecture.md) **Implemented** (2026-07-04).

**Phase 13 ADR gate:** [ADR-028](../../.ai/adr/028-protocol-layer.md) **Proposed** (2026-07-04) — requires ADR-027 Implemented.

**Phase 14 ADR gate:** [ADR-029](../../.ai/adr/029-federation-layer.md) **Proposed** (2026-07-04) — requires Phase 13 Implemented.

**Phase 15 ADR gate:** [ADR-030](../../.ai/adr/030-autonomous-agent-ecosystem.md) **Proposed**.

**Enterprise Phases 16–20:** [11-ENTERPRISE-ROADMAP.md](../../.ai/phases/roadmap/11-ENTERPRISE-ROADMAP.md) · ADR-031–035 **Proposed**.

**Post–Phase 10:** [10-POST-ROADMAP.md](../../.ai/phases/roadmap/10-POST-ROADMAP.md) — Phase 11 P0; Phase 10.5 extension parallel after 11A.

**Implementation plan:** [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)
