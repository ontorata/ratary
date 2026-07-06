# Enterprise modules (opt-in)

**Purpose:** Operator guide for Phase **10.5–25** platform adapters and extension tracks.  
**Default:** all flags **OFF** — core memory path (Phases 1–11) unchanged.

> **Skip this doc** on first install. Use only when enabling section 7 (Enterprise platform) in [`.env.example`](../.env.example). OSS/local MCP needs Tier 0–1 only.

See also: [CONFIGURATION.md](CONFIGURATION.md) · [CROSS-PHASE-DEBT.md](CROSS-PHASE-DEBT.md) · [DOCKER.md](DOCKER.md)

---

## Core retrieval (common first steps)

| Module | Env flag | Also set |
|--------|----------|----------|
| Hybrid SQL + vector | `HYBRID_RETRIEVAL=true` | `EMBEDDING_PROVIDER=openai`, pgvector via `DATABASE_URL` / `PGVECTOR_DATABASE_URL` |
| Graph retrieval | `GRAPH_RETRIEVAL=true` | `GRAPH_PROVIDER=d1` (default), `neo4j`, or `neptune` + creds |
| Vector graph seeds | `GRAPH_VECTOR_SEEDS_ENABLED=true` | Requires hybrid + graph both ON |
| Precision search | `PRECISION_SEARCH_ENABLED=true` | Optional `SEARCH_RERANK_ENABLED`, rerank model path |
| Memory access audit | `MEMORY_ACCESS_AUDIT=true` | SQL store for audit rows |

---

## Extension tracks

| Phase | Module | Master flag(s) |
|-------|--------|----------------|
| 4.7 | Memory stewardship | `MEMORY_STEWARDSHIP_ENABLED` |
| 5.5 | Semantic compression | `COMPRESSION_ENABLED`, `COMPRESSION_POLICY=llm` |
| 6.6 | Precision search | `PRECISION_SEARCH_ENABLED` |
| 7.1 | Agent Forge | Workflow only (`.cursor/skills/forge-*`) |
| 8.5 | Quality signals | `SIGNAL_INGEST_ENABLED`, `RANKING_ADAPTATION_ENABLED` |
| 8.6 | Learning intelligence | `LEARNING_ENGINE_ENABLED` |
| 8.7 | Graph relation inference | `RELATION_INFERENCE_ENABLED` |
| 8.8 | Inspection ledger | `INSPECTION_LEDGER_ENABLED`, `INSPECTION_CHARTER_ENABLED` |
| 9.7 | Memory evolution | `MEMORY_EVOLUTION_ENABLED` |
| 9.8 | Multi-client sync | `MULTI_CLIENT_SYNC_ENABLED` |

Event consumers (Phase 12): `EVENT_CONSUMERS_ENABLED=true` requires `EVENT_BUS_PROVIDER=redis`.

---

## Transport & protocol

| Phase | Module | Master flag |
|-------|--------|-------------|
| 10.5 | gRPC transport | `GRPC_ENABLED` |
| — | SSE streaming | `SSE_ENABLED` |
| — | WebSocket | `WEBSOCKET_ENABLED` |
| 13.1 | Remote MCP | `REMOTE_MCP_ENABLED` |

---

## Enterprise platform (14–25)

| Phase | Module | Master flag |
|-------|--------|-------------|
| 14 | Federation | `FEDERATION_ENABLED` |
| 17 | Enterprise security | `ENTERPRISE_SECURITY_V2`, `SSO_ENABLED`, OPA paths |
| 18 | Cloud platform | `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED` |
| 19 | Observability | `OBSERVABILITY_PLATFORM`, `OTEL_ENABLED` |
| 20 | AI infrastructure / marketplace | `PLUGIN_MARKETPLACE_ENABLED` |
| 21 | Search & graph prod | `SEARCH_GRAPH_PLATFORM_ENABLED` |
| 22 | Content scale | `CONTENT_SCALE_PLATFORM_ENABLED` |
| 23–29 | Knowledge fabric | `KNOWLEDGE_FABRIC_ENABLED`, `CONNECTOR_SYNC_ENABLED` |
| 24 | Ratary platform umbrella | `RATARY_PLATFORM_ENABLED`, `RATARY_PLATFORM_EDITION` |
| 25 | Global intelligence | `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED` |

Developer SDK/npm packages (`@ratary/sdk`, `@ratary/cli`, `@ratary/mcp-server`) ship regardless of platform flags.

---

## Storage peers (Phase 30)

| Adapter | Env |
|---------|-----|
| MariaDB/MySQL | `SQL_PROVIDER=mariadb`, `MARIADB_CONNECTION_STRING` |
| MinIO / S3 | `OBJECT_STORAGE_PROVIDER=minio` |
| ClickHouse | `ANALYTICS_PROVIDER=clickhouse` |
| OpenSearch | `SEARCH_PROVIDER=opensearch` |
| Azure / GCS | `OBJECT_STORAGE_PROVIDER=azure` / `gcs` |
| Neptune (stub) | `GRAPH_PROVIDER=neptune`, `NEPTUNE_ENDPOINT` |

Docker: `docker compose --profile enterprise up` — see [DOCKER.md](DOCKER.md).

---

## Enable checklist

1. Start with **one module** — verify `npm test` / smoke with flag ON in staging.
2. Set **SQL + AUTH** baseline first (`DATABASE_URL`, `AUTH_SECRET`).
3. Enable **audit** for compliance: `MEMORY_ACCESS_AUDIT=true`.
4. Production fabric: [PRODUCTION-ENABLE.md](PRODUCTION-ENABLE.md).

---

*Human operator guide · flags authoritative in [CONFIGURATION.md](CONFIGURATION.md) and `.env.example`.*
