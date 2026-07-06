# Vercel Production — Knowledge fabric env setup

**Scope:** Enabling **knowledge fabric** and optional **universal fabric** on hosted Ratary.  
**Canonical hosted API:** `https://ratary.ontorata.com`  
**Status (2026-07-06):** Notion live — `supportsKnowledgeFabric: true` verified.

**Baseline production** (AUTH_SECRET, SQL, MCP): [GUIDE — Security](GUIDE.md#3-security) · [CONFIGURATION — Tier 0](CONFIGURATION.md#tier-0--core-required-sql--auth--mcp).

## Prerequisites

- Tier 0–1 working locally
- Vercel CLI linked to the Ratary project

```powershell
npm i -g vercel
vercel login
cd /path/to/ratary
vercel link
```

## Required variables (Production)

| Variable | Example |
|----------|---------|
| `KNOWLEDGE_FABRIC_ENABLED` | `true` |
| `CONNECTOR_SYNC_ENABLED` | `true` |
| `NOTION_API_TOKEN` | `ntn_...` |
| `NOTION_API_VERSION` | `2022-06-28` |

## Optional — live connectors

| Variable | Connector |
|----------|-----------|
| `CONFLUENCE_BASE_URL`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN` | Confluence |
| `GOOGLE_DRIVE_CREDENTIALS_JSON`, `GOOGLE_DRIVE_FOLDER_ID` | Google Drive |
| `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_SITE_ID` | SharePoint |
| `TEAMS_TEAM_ID`, `TEAMS_CHANNEL_ID` (+ Graph creds) | Teams |

## Optional — universal memory fabric (Phase 32)

| Variable | Example |
|----------|---------|
| `FEDERATION_ENABLED` | `true` |
| `UNIVERSAL_MEMORY_FABRIC_ENABLED` | `true` |
| `FEDERATION_PEERS_JSON` | `[{"nodeId":"...","displayName":"peer",...}]` |

After enabling universal fabric: run `npm run db:migrate` against production DB (provenance table).

## Run

```powershell
.\scripts\vercel-production-env.ps1
vercel --prod
```

## Verify

```powershell
npx tsx scripts/test-connector-sync.ts --connector notion --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector confluence --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector drive --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector sharepoint --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector teams --url https://ratary.ontorata.com --dry-run
```

Phases reference: [PHASES-32-34.md](PHASES-32-34.md)

---

*Ops script — secrets stay in Vercel / local `.env` only.*
