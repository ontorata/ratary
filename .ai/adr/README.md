# Architecture Decision Records (ADR)

**Canonical location:** `.ai/adr/` — single SSOT for structural decisions.  
**Policy:** [POLICY.md](POLICY.md)

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
| [026-memory-quality-signals.md](026-memory-quality-signals.md) | Memory quality signals (Phase 8.5) | **Implemented** | Ranking adaptation / Phase 12 |
| [027-transport-connectivity-layer.md](027-transport-connectivity-layer.md) | Transport & Connectivity Layer (Phase 10.5) | **Implemented** | gRPC opt-in, transport registry |
| [028-protocol-layer.md](028-protocol-layer.md) | Protocol Layer (Phase 13) | **Implemented** | Multi-protocol streaming |
| [029-federation-layer.md](029-federation-layer.md) | Federation Layer (Phase 14) | **Implemented** | Global memory fabric |
| [030-autonomous-agent-ecosystem.md](030-autonomous-agent-ecosystem.md) | Autonomous Agent Ecosystem (Phase 15) | **Implemented** | Multi-client Memory Cloud |
| [031-developer-platform.md](031-developer-platform.md) | Developer Platform (Phase 16) | **Implemented** | SDK, CLI, remote MCP |
| [032-enterprise-security.md](032-enterprise-security.md) | Enterprise Security (Phase 17) | **Implemented** | SSO, OPA, ABAC |
| [033-cloud-platform.md](033-cloud-platform.md) | Cloud Platform (Phase 18) | **Implemented** | Control plane, metering |
| [034-observability-platform.md](034-observability-platform.md) | Observability Platform (Phase 19) | **Implemented** | OTel, Grafana |
| [035-ai-infrastructure-platform.md](035-ai-infrastructure-platform.md) | AI Infrastructure Platform (Phase 20) | **Implemented** | Plugin marketplace |
| [040-memory-evolution-version-control.md](040-memory-evolution-version-control.md) | Memory evolution & version control (Phase 9.7) | **Implemented** | Version history |
| [041-automatic-graph-relation-inference.md](041-automatic-graph-relation-inference.md) | Graph relation inference (Phase 8.7) | **Implemented** | Inferred edges |
| [042-multi-client-memory-sync.md](042-multi-client-memory-sync.md) | Multi-client memory sync (Phase 9.8) | **Implemented** | LWW / field merge |
| [045-self-managing-memory-stewardship.md](045-self-managing-memory-stewardship.md) | Self-managing memory stewardship (Phase 4.7) | **Implemented** | Maintenance pipeline |
| [057-learning-intelligence-engine.md](057-learning-intelligence-engine.md) | Learning intelligence engine (Phase 8.6) | **Implemented** | Ranking snapshots |
| [059-inspection-pattern-ledger.md](059-inspection-pattern-ledger.md) | Inspection pattern ledger (Phase 8.8) | **Implemented** | Forge/MCP inspection memory |
| [021-content-vector-scale-platform.md](021-content-vector-scale-platform.md) | Content & Vector Scale Platform (Phase 22) | **Implemented** | R2/pgvector sync ops |
| [022-search-graph-production-platform.md](022-search-graph-production-platform.md) | Search & Graph Production Platform (Phase 21) | **Implemented** | Meilisearch/Neo4j sync |
| [036-global-ai-intelligence-platform.md](036-global-ai-intelligence-platform.md) | Global AI Intelligence Platform (Phase 25) | **Implemented** | Distributed telemetry/analytics |
| [037-ai-telemetry-event-model.md](037-ai-telemetry-event-model.md) | AI Telemetry Event Model (Phase 25) | **Implemented** | Semantic OTLP telemetry |
| [038-usage-analytics-engine.md](038-usage-analytics-engine.md) | Usage Analytics Engine (Phase 25) | **Implemented** | Quality/adoption/cost KPIs |
| [043-cloud-federation-sync-topology.md](043-cloud-federation-sync-topology.md) | Cloud Federation Sync Topology (Phase 25) | **Implemented** | 5-tier global sync |
| [044-ai-brain-platform-architecture.md](044-ai-brain-platform-architecture.md) | AI-Brain Platform Architecture (Phase 24) | **Implemented** | Umbrella manifest + webhooks |
| [047-enterprise-knowledge-fabric.md](047-enterprise-knowledge-fabric.md) | Enterprise Knowledge Fabric (Phase 23) | **Implemented** | External connector ingest |
| [048-remote-mcp-transport.md](048-remote-mcp-transport.md) | Remote MCP transport (Phase 13.1) | **Implemented** | Streamable HTTP MCP |

**Planned (POST-ROADMAP, not yet filed):** ADR-019 (repo split, optional) — see [10-POST-ROADMAP.md](../phases/roadmap/10-POST-ROADMAP.md).

**Rule:** No implementation of **Draft** ADRs until owner marks **Approved**. **Implemented** ADRs reflect shipped code (opt-in where noted).

**Phases 1–10 ADR closure:** ADR-001–017 **Implemented** (2026-07-03).

**Extension tracks (5.5–9.8, 08.8):** ADR-023–026, ADR-040–042, ADR-045, ADR-057 **Implemented**; ADR-059 **Implemented** (2026-07-05).

**Phases 10.5–25 ADR gates:** ADR-027–048 **Implemented** (2026-07-04) — platform phases default OFF via env where noted.

**POST-ROADMAP:** [10-POST-ROADMAP.md](../phases/roadmap/10-POST-ROADMAP.md) — optional ADR-019 (repo split).
