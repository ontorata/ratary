# Phase 38 / ADR-070 — Code Memory Ops Pack

**Status:** Staging prove pack — **E Accepted** · **Hold** (F deferred; prod flag OFF)  
**Date:** 2026-07-29  
**Authority:** ADR-070 C5 · CONFIGURATION Code Memory · ARCH-0248 · ARCH-0251 · ARCH-0252 · Owner Accept E + Hold  



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
| E | Staging D1 execute (Owner) | Yes — staging only · **DONE** 2026-07-29 |
| F | Production enable | **Hold** — E Accepted; Owner deferred F (2026-07-29) |

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

### F — production (**Hold**)

Owner **Accepted E** then chose **Hold** (2026-07-29). Do not enable until Owner re-opens F.

Readiness (not Accept): [F-READINESS-HOLD.md](./F-READINESS-HOLD.md)

When re-opened, set Vercel/production:

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
| [STAGING-D1-E-2026-07-29.md](./STAGING-D1-E-2026-07-29.md) | Staging D1 E execute + traverse |
| [F-READINESS-HOLD.md](./F-READINESS-HOLD.md) | F checklist while Hold |
| [OPS-PACK.md](./OPS-PACK.md) | This pack |
