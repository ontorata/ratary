# Phase 38 / ADR-070 — Code Memory Ops Pack

**Status:** Staging prove pack (flag-on path without production enable)  
**Date:** 2026-07-29  
**Authority:** ADR-070 C5 · CONFIGURATION Code Memory · ARCH-0248 dry-run  

## Hard rules

1. **Production `CODE_MEMORY_ENABLED` stays `false`** until Owner Accept of a live staging prove on a **dedicated** staging D1 (not prod).
2. Do **not** run `npm run index:code:execute` against production D1 from laptop `.env` without an explicit staging database id.
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
| E | Staging D1 execute (Owner) | Yes — staging only |
| F | Production enable | **Blocked** until E Accept |

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

### E — staging D1 (Owner-gated)

1. Provision / select **staging** Cloudflare D1 (separate from prod `D1_DATABASE_ID`).
2. Set in a **staging-only** env file (never commit):

```env
SQL_PROVIDER=d1
CODE_MEMORY_ENABLED=true
CODE_STORE_PROVIDER=sql
D1_DATABASE_ID=<staging-id>
# …account + token…
```

3. `npm run db:migrate` against staging.
4. `npm run index:code:execute -- --owner=<uuid> --repository=fixture/phase38 --root=docs/evidence/phase-38-code-memory/fixture`
5. MCP/REST: `traverse_code` / `get_code_node` against staging API with flag on.
6. Record evidence under `docs/evidence/phase-38-code-memory/`.

### F — production

Only after Owner Accept of E. Set Vercel/production:

- `CODE_MEMORY_ENABLED=true`
- `CODE_STORE_PROVIDER=sql`
- Migrate prod · execute index on agreed repo set · monitor

## Rollback

Set `CODE_MEMORY_ENABLED=false` (and optionally `CODE_STORE_PROVIDER=none`). Tables may remain (I0: unused on recall).

## Evidence files

| File | Role |
|------|------|
| [DRY-RUN-2026-07-29.md](./DRY-RUN-2026-07-29.md) | Full-repo dry-run |
| [STAGING-PROVE-2026-07-29.md](./STAGING-PROVE-2026-07-29.md) | Fixture B–D results |
| [OPS-PACK.md](./OPS-PACK.md) | This pack |
