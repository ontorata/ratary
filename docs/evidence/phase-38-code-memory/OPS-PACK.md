# Phase 38 / ADR-070 — Code Memory Ops Pack

**Status:** Staging **E Accepted** · Production **F Complete** (fixture-first)  
**Date:** 2026-07-29  
**Authority:** ADR-070 C5 · CONFIGURATION Code Memory · ARCH-0248 · ARCH-0251–0253 · Owner Accept F  

## Hard rules

1. Production flag is **on** after F ([PROD-F-2026-07-29.md](./PROD-F-2026-07-29.md)). Full-monorepo index still requires Owner-agreed repo set.
2. Prefer process-env override for CLI `index:code:execute`; confirm `D1_DATABASE_ID` prefix before writes (`1d01e219` prod · `72947c9f` staging).
3. Indexer is CLI-only — never on `save_memory`.

## Fixture

`docs/evidence/phase-38-code-memory/fixture/` — two TS modules (`greet.ts`, `index.ts`).

## Prove ladder

| Step | Command / check | Persist? |
|------|-----------------|----------|
| A | Full-repo dry-run (done ARCH-0248) | No |
| B | Fixture dry-run flag **off** | No |
| C | Fixture dry-run flag **on** (`CODE_MEMORY_ENABLED=true` · `CODE_STORE_PROVIDER=sql`) | No |
| D | In-memory execute prove (`npm run prove:code-memory`) | Memory only |
| E | Staging D1 execute (Owner) | Yes — staging only · **DONE** 2026-07-29 |
| F | Production enable | **DONE** — [PROD-F-2026-07-29.md](./PROD-F-2026-07-29.md) |

### A–C (CLI)

```powershell
cd D:\Apps\ai-brain
$owner = "<uuid>"   # MCP_OWNER_ID

# B — flag off
npm run index:code -- --owner=$owner --repository=fixture/phase38 --root=docs/evidence/phase-38-code-memory/fixture

# C — flag on, still dry-run (no write)
$env:CODE_MEMORY_ENABLED = "true"
$env:CODE_STORE_PROVIDER = "sql"
npm run index:code -- --owner=$owner --repository=fixture/phase38 --root=docs/evidence/phase-38-code-memory/fixture
Remove-Item Env:CODE_MEMORY_ENABLED
Remove-Item Env:CODE_STORE_PROVIDER
```

### D — in-memory execute (safe)

```powershell
npm run prove:code-memory
```

Asserts: extract → upsert nodes/edges → `runId` set → `getById` round-trip. Uses **in-memory** ports (does not touch D1).

### E — staging D1 (Owner-gated) — **DONE**

Evidence: [STAGING-D1-E-2026-07-29.md](./STAGING-D1-E-2026-07-29.md)

1. Provisioned Cloudflare D1 **`ratary-staging`** (separate from prod `ai-cloud`).
2. Staging-only env: `.env.staging` (gitignored) + shell `D1_DATABASE_ID` override before process start.
3. `npm run db:migrate` against staging — OK.
4. `npm run index:code:execute` on fixture — runId `53db0bbe-…` · 2/8/13 · status `completed`.
5. Port-level `getNode` + `traverse` against staging D1 — PASS (hosted prod MCP not used).
6. Prod isolation: zero `fixture/phase38` nodes on `ai-cloud`.

### F — production (**DONE**)

Evidence: [PROD-F-2026-07-29.md](./PROD-F-2026-07-29.md) · checklist history: [F-READINESS-HOLD.md](./F-READINESS-HOLD.md)

- Vercel: `CODE_MEMORY_ENABLED=true` · `CODE_STORE_PROVIDER=sql`
- Prod migrate + fixture execute · hosted REST traverse PASS

## Rollback

Set `CODE_MEMORY_ENABLED=false` (and optionally `CODE_STORE_PROVIDER=none`). Tables may remain (I0: unused on recall).

## Evidence files

| File | Role |
|------|------|
| [DRY-RUN-2026-07-29.md](./DRY-RUN-2026-07-29.md) | Full-repo dry-run |
| [STAGING-PROVE-2026-07-29.md](./STAGING-PROVE-2026-07-29.md) | Fixture B–D results |
| [STAGING-D1-E-2026-07-29.md](./STAGING-D1-E-2026-07-29.md) | Staging D1 E execute + traverse |
| [F-READINESS-HOLD.md](./F-READINESS-HOLD.md) | F checklist (complete) |
| [PROD-F-2026-07-29.md](./PROD-F-2026-07-29.md) | Production enable F |
| [DOCKER-GPU-SMOKE-SKIPPED-2026-07-29.md](./DOCKER-GPU-SMOKE-SKIPPED-2026-07-29.md) | Optional C skipped |
| [OPS-PACK.md](./OPS-PACK.md) | This pack |
