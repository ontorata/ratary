# Enterprise modules (opt-in)

**Purpose:** Operator guide for optional platform adapters (federation, fabric, observability, marketplace, …).  
**Default:** all flags **OFF** — core memory path unchanged.

> **Skip this doc** on first install. Use only when enabling section 7 in [`.env.example`](../.env.example). OSS/local MCP needs `.env.example` sections 1–2 only.

See also: [CONFIGURATION.md](CONFIGURATION.md) · [DOCKER.md](DOCKER.md) · [CHANGELOG.md](../CHANGELOG.md)

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

| Module | Master flag(s) |
|--------|----------------|
| Memory stewardship | `MEMORY_STEWARDSHIP_ENABLED` |
| Semantic compression | `COMPRESSION_ENABLED`, `COMPRESSION_POLICY=llm` |
| Precision search | `PRECISION_SEARCH_ENABLED` |
| Agent Forge | Workflow only (`.cursor/skills/forge-*`) |
| Quality signals | `SIGNAL_INGEST_ENABLED`, `RANKING_ADAPTATION_ENABLED` |
| Learning intelligence | `LEARNING_ENGINE_ENABLED` |
| Graph relation inference | `RELATION_INFERENCE_ENABLED` |
| Inspection ledger | `INSPECTION_LEDGER_ENABLED`, `INSPECTION_CHARTER_ENABLED` |
| Memory evolution | `MEMORY_EVOLUTION_ENABLED` |
| Multi-client sync | `MULTI_CLIENT_SYNC_ENABLED` |

Event consumers: `EVENT_CONSUMERS_ENABLED=true` requires `EVENT_BUS_PROVIDER=redis`.

---

## Transport & protocol

| Module | Master flag |
|--------|-------------|
| gRPC transport | `GRPC_ENABLED` |
| SSE streaming | `SSE_ENABLED` |
| WebSocket | `WEBSOCKET_ENABLED` |
| Remote MCP | `REMOTE_MCP_ENABLED` |

---

## Enterprise platform

| Module | Master flag |
|--------|-------------|
| Federation | `FEDERATION_ENABLED` |
| Enterprise security | `ENTERPRISE_SECURITY_V2`, `SSO_ENABLED`, OPA paths |
| Cloud platform | `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED` |
| Observability | `OBSERVABILITY_PLATFORM`, `OTEL_ENABLED` |
| Plugin marketplace | `PLUGIN_MARKETPLACE_ENABLED` |
| Search & graph prod | `SEARCH_GRAPH_PLATFORM_ENABLED` |
| Content scale | `CONTENT_SCALE_PLATFORM_ENABLED` |
| Knowledge fabric | `KNOWLEDGE_FABRIC_ENABLED`, `CONNECTOR_SYNC_ENABLED` |
| Platform umbrella | `RATARY_PLATFORM_ENABLED`, `RATARY_PLATFORM_EDITION` |
| Global intelligence | `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED` |

Developer SDK/npm packages (`@ratary/sdk`, `@ratary/cli`, `@ratary/mcp-server`) ship regardless of platform flags.

---

## Storage peers

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
