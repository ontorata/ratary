# Phases 32–34 (implemented)

**Status:** ✅ Code merged main @ `28e6719` (PR #30) · gates PASS (2026-07-06)  
**Governance:** `.ai/phases/32-*` … `34-*` COMPLETION.md

All three phases ship **default OFF** — enable via env only.

---

## Phase 32 — Universal memory fabric

| | |
|---|---|
| **Flag** | `UNIVERSAL_MEMORY_FABRIC_ENABLED=true` (+ `KNOWLEDGE_FABRIC_ENABLED`, `FEDERATION_ENABLED`) |
| **Orchestrator** | `src/knowledge-fabric-platform/services/universal-memory-fabric-orchestrator.ts` |
| **Provenance** | `knowledge_fabric_provenance` table — run `npm run db:migrate` |
| **REST** | `POST /knowledge-fabric/sync/peer/:peerId` · `GET /knowledge-fabric/provenance` |

---

## Phase 33 — Neptune full graph traversal

| | |
|---|---|
| **Flag** | `GRAPH_PROVIDER=neptune` + `NEPTUNE_ENDPOINT` |
| **Client** | `src/infrastructure/graph/neptune/neptune-gremlin-client.ts` (HTTP Gremlin) |
| **Provider** | `src/infrastructure/graph/neptune/neptune-graph-provider.ts` |

Neptune SigV4 IAM auth: use HTTPS endpoint; full IAM signing not bundled — document in ops runbook when cluster requires it.

---

## Phase 34 — Enterprise connectors

| Connector | Required env |
|-----------|----------------|
| **SharePoint** | `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_SITE_ID` |
| **Teams** | Graph creds above + `TEAMS_TEAM_ID`, `TEAMS_CHANNEL_ID` |
| **Also live** | Notion, Confluence, Google Drive (Phase 29+) |

Smoke:

```powershell
npx tsx scripts/test-connector-sync.ts --connector sharepoint --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector teams --url https://ratary.ontorata.com --dry-run
```

---

## What is still open (ops — not code phases)

| Item | Status | Action |
|------|--------|--------|
| Confluence/Drive/SharePoint creds in Vercel prod | ⏳ | `.env` → `vercel-production-env.ps1` → `vercel --prod` |
| Universal fabric in prod | ⏳ | Flags + `db:migrate` + federation peers configured |
| SDK codegen CI on GitHub | ⏳ | Push workflow per [SDK-CODEGEN-CI.md](SDK-CODEGEN-CI.md) |
| ChatGPT OAuth | ⏳ | Provision DCR IdP (Keycloak/Okta) — [MCP-CHATGPT-OAUTH.md](MCP-CHATGPT-OAUTH.md) |
| MCP directory PRs | ⏳ | [MCP/submission/directory-status.md](../MCP/submission/directory-status.md) |
| Glama ownership claim | ⏳ | Login as `lutfi04` |
| Smithery API key | ⏳ | Rotate leaked key |
| Neptune production smoke | ⏳ | Requires AWS Neptune cluster |

**No proposed or deferred code phases** remain in the 32–34 track.

---

*Index: [README roadmap](../README.md#roadmap)*
