# Vercel Production — Ratary Server env setup

Sets **Production** environment variables on the Ratary Vercel project for knowledge fabric (Phase 29).

## Prerequisites

```powershell
npm i -g vercel
vercel login
cd d:\Apps\ai-brain
vercel link   # select Ontorata team + ratary project
```

Optional: `$env:VERCEL_TOKEN` from [Vercel account tokens](https://vercel.com/account/tokens) for non-interactive use.

## Required variables (Production)

| Variable | Example |
|----------|---------|
| `KNOWLEDGE_FABRIC_ENABLED` | `true` |
| `CONNECTOR_SYNC_ENABLED` | `true` |
| `NOTION_API_TOKEN` | `ntn_...` (from Notion integration) |
| `NOTION_API_VERSION` | `2022-06-28` |

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
npx tsx scripts/test-notion-sync.ts --url https://ratary.ontorata.com --dry-run
```

---

*Ops script — not run in CI. Secrets stay in Vercel dashboard / local `.env` only.*
