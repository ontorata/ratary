# Phase 23 — Enterprise Knowledge Fabric — DESIGN

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-047 Implemented](../../adr/047-enterprise-knowledge-fabric.md)

---

## Purpose

Unified external knowledge plane via `IKnowledgeConnector` adapters. Orchestrator writes via `MemoryService`; provenance in metadata (`notes` JSON + `fabric:*` tags).

## Scope

| Track | Deliverable |
|-------|-------------|
| 23A | Connector registry (Slack, GitHub, GitLab, Jira, Confluence, Drive, SharePoint, Email, Teams, Notion) |
| 23B | `IFabricNormalizer` + `IFabricPolicy` |
| 23C | `IFabricExternalRefStore` — dedup + incremental cursors |
| 23D | Admin REST + capabilities manifest |

## Architecture

```
External systems (Slack, GitHub, Notion, …)
       │
       ▼
  IKnowledgeConnector.pull()
       │
       ▼
  IFabricNormalizer → IFabricPolicy
       │
       ▼
  KnowledgeFabricOrchestrator
       │
       ├─► MemoryService.createMemory / updateMemory
       └─► IFabricExternalRefStore (external_id → memory_id)

REST /api/v1/knowledge-fabric/*  (KNOWLEDGE_FABRIC_ENABLED)
```

## Ports

- `IKnowledgeFabricOrchestrator`
- `IKnowledgeConnector`
- `IFabricNormalizer`
- `IFabricPolicy`
- `IFabricExternalRefStore`
- `IKnowledgeFabricIngestStore` (run audit)

## Distinct from

| Phase | Scope |
|-------|-------|
| Phase 14 | AI-Brain node ↔ node federation |
| Phase 09.8 | AI client sync (Cursor, MCP) |
| Phase 23 | Enterprise SaaS connectors → SSOT |

## Deferred

- Vendor SDK live pull (Slack/GitHub API clients)
- OAuth per-connector (Phase 17 SSO integration)
- Async webhook/event-driven ingest
