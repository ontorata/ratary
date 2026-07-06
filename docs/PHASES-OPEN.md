# Open phases (32–34)

**Status:** Implemented (2026-07-06) — enable via env flags.

---

## Phase 32 — Universal memory fabric

**Flag:** `UNIVERSAL_MEMORY_FABRIC_ENABLED=true` (requires `KNOWLEDGE_FABRIC_ENABLED`, `FEDERATION_ENABLED`)

| Component | Path |
|-----------|------|
| Orchestrator | `src/knowledge-fabric-platform/services/universal-memory-fabric-orchestrator.ts` |
| Provenance store | `src/infrastructure/knowledge-fabric-platform/sql-fabric-provenance-store.ts` |
| REST | `POST /knowledge-fabric/sync/peer/:peerId` · `GET /knowledge-fabric/provenance` |

---

## Phase 33 — Neptune full graph traversal

**Flag:** `GRAPH_PROVIDER=neptune` + `NEPTUNE_ENDPOINT`

| Component | Path |
|-----------|------|
| Gremlin HTTP client | `src/infrastructure/graph/neptune/neptune-gremlin-client.ts` |
| Provider | `src/infrastructure/graph/neptune/neptune-graph-provider.ts` |

---

## Phase 34 — Enterprise connectors (SharePoint, Teams)

**Flags:** Microsoft Graph creds + `CONNECTOR_SYNC_ENABLED`

| Connector | Env |
|-----------|-----|
| SharePoint | `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_SITE_ID` |
| Teams | Same Graph creds + `TEAMS_TEAM_ID`, `TEAMS_CHANNEL_ID` |

Smoke: `npx tsx scripts/test-connector-sync.ts --connector sharepoint|teams --dry-run`

---

*Index: [README roadmap](../README.md#roadmap)*
