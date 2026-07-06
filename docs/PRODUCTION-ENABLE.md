# Vercel Production — Knowledge fabric env setup

**Scope:** Enabling **knowledge fabric** (Notion sync, connector jobs) on a hosted Ratary Server deployment.  
**Not covered here:** baseline production (AUTH_SECRET, SQL, MCP scope) — see [GUIDE — Security](GUIDE.md#3-security) and [CONFIGURATION — Tier 0](CONFIGURATION.md#tier-0--core-required-sql--auth--mcp).

**Canonical hosted API:** `https://ratary.ontorata.com`

## Prerequisites

- Tier 0–1 working locally (`AUTH_SECRET`, `SQL_PROVIDER`, `DATABASE_URL` or D1 creds)
- Vercel CLI linked to the Ratary project

```powershell
npm i -g vercel
vercel login
cd /path/to/ratary    # repo root
vercel link           # select Ontorata team + ratary project
```

Optional: `$env:VERCEL_TOKEN` from [Vercel account tokens](https://vercel.com/account/tokens) for non-interactive use.

## Required variables (Production)

| Variable | Example |
|----------|---------|
| `KNOWLEDGE_FABRIC_ENABLED` | `true` |
| `CONNECTOR_SYNC_ENABLED` | `true` |
| `NOTION_API_TOKEN` | `ntn_...` (from Notion integration) |
| `NOTION_API_VERSION` | `2022-06-28` |

Optional (live connectors — set when credentials exist):

| Variable | Example |
|----------|---------|
| `CONFLUENCE_BASE_URL` | `https://your-domain.atlassian.net` |
| `CONFLUENCE_EMAIL` | `you@company.com` |
| `CONFLUENCE_API_TOKEN` | Atlassian API token |
| `GOOGLE_DRIVE_CREDENTIALS_JSON` | Service account JSON (single line in Vercel) |
| `GOOGLE_DRIVE_FOLDER_ID` | Optional folder scope |

Ensure existing production vars remain set: `AUTH_SECRET`, `SQL_PROVIDER`, `DATABASE_URL`, etc.

## Run

From repo root (reads secrets from `.env` — **never commit**):

```powershell
.\scripts\vercel-production-env.ps1
vercel --prod   # redeploy production after env change
```

## Verify

```powershell
Invoke-RestMethod https://ratary.ontorata.com/health
# After deploy: capabilities.supportsKnowledgeFabric = true
npx tsx scripts/test-connector-sync.ts --connector notion --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector confluence --url https://ratary.ontorata.com --dry-run
npx tsx scripts/test-connector-sync.ts --connector drive --url https://ratary.ontorata.com --dry-run
```

---

*Ops script — not run in CI. Secrets stay in Vercel dashboard / local `.env` only.*
