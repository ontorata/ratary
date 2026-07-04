# Phase 23 — Enterprise Knowledge Fabric — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-047 Implemented](../../adr/047-enterprise-knowledge-fabric.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 23A | `IKnowledgeConnector` + env/catalog registry | ✅ |
| 23B | `DefaultFabricNormalizer` + `RuleBasedFabricPolicy` | ✅ |
| 23C | `IFabricExternalRefStore` + SQL migration | ✅ |
| 23D | `KnowledgeFabricOrchestrator` | ✅ |
| 23E | REST `/knowledge-fabric/*` admin API | ✅ |
| 23F | Capabilities `knowledgeFabric` section | ✅ |

---

## File map

```
src/knowledge-fabric-platform/
  types/           connector + ingest types
  ports/           IKnowledgeConnector, IFabricNormalizer, IFabricPolicy, stores
  adapters/        connector registry, normalizer, policy
  services/        KnowledgeFabricOrchestrator
  builders/        KnowledgeFabricManifestBuilder
src/infrastructure/knowledge-fabric-platform/
  sql-knowledge-fabric-store.ts
src/composition/create-knowledge-fabric-ports.ts
src/controllers/knowledge-fabric.controller.ts
src/routes/v1/knowledge-fabric.routes.ts
tests/knowledge-fabric-platform/
tests/api/knowledge-fabric.test.ts
tests/db/knowledge-fabric-platform-migration.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `KNOWLEDGE_FABRIC_ENABLED` | `false` | Master gate for fabric admin API |
| `KNOWLEDGE_FABRIC_CATALOG_JSON` | `{}` | Dev/test catalog per connector |
| `SLACK_BOT_TOKEN`, `GITHUB_TOKEN`, … | — | Per-connector credentials (MVP: presence check) |
| `NOTION_API_TOKEN` | — | Notion connector credential |

Catalog JSON shape:

```json
{
  "notion": [
    {
      "externalId": "page-1",
      "title": "Runbook",
      "body": "Content…",
      "updatedAt": "2026-07-04T00:00:00.000Z",
      "metadata": {}
    }
  ]
}
```

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/knowledge-fabric/status` | Platform status |
| GET | `/api/v1/knowledge-fabric/manifest` | Production manifest |
| GET | `/api/v1/knowledge-fabric/connectors` | Connector registry |
| GET | `/api/v1/knowledge-fabric/ingest/runs` | Recent ingest runs |
| GET | `/api/v1/knowledge-fabric/ingest/state/:connectorId` | Cursor/watermark |
| POST | `/api/v1/knowledge-fabric/ingest/:connectorId` | Trigger ingest (full/incremental) |

---

## Invariants

- All writes via `MemoryService` (not direct repository)
- Default env = pre-Phase-23 behavior (no external ingest)
- Provenance: `tags` include `fabric:<connectorId>`, `notes` holds JSON provenance
