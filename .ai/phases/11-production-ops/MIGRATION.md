# Phase 11 — Production Operations — MIGRATION

**Document:** MIGRATION (Cutover Runbook)  
**Phase status:** In Progress — C11-7 Authoring  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR-018:** [Production Postgres cutover](../../../docs/adr/018-production-postgres-cutover.md)

**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) → ADR-018 → this runbook.

---

## Overview

This runbook describes the **owner-run procedure** to migrate AI Brain metadata from Cloudflare D1 to a self-managed PostgreSQL database using the `PostgresSqlDatabaseAdapter` (Phase 10, ADR-009).

**Cutover strategy:** ADR-018 Option A — quiesce + backfill + env flip.

**Scope:** Metadata tables only (`memories`, `organizations`, `identities`, etc.).  
**Out of scope:** Vectors (`VECTOR_PROVIDER`), object storage, search, graph, events — Phases 12–14.

---

## Cutover States (ADR-018)

| State | `SQL_PROVIDER` | Writes | Rollback |
|-------|----------------|--------|----------|
| **S0 — Baseline** | `d1` | D1 | — |
| **S1 — Staging proof** | `postgres` (isolated DB) | Staging only | Drop staging DB |
| **S2 — Backfill complete** | `d1` (prod live) | D1 primary; Postgres has copy | Discard Postgres copy |
| **S3 — Cutover** | `postgres` | Postgres primary | Flip to `d1` (see rollback limits) |
| **S4 — Rollback** | `d1` | D1 primary | Postgres retained for re-attempt |

**Rollback limit:** Rows written only on Postgres during S3 are **NOT** automatically synced back to D1. Run re-backfill if rollback occurs after writes.

---

## Prerequisites

Before starting, verify all of the following:

| # | Requirement | Evidence |
|---|------------|----------|
| P1 | ADR-018 Approved | [docs/adr/018-production-postgres-cutover.md](../../../docs/adr/018-production-postgres-cutover.md) |
| P2 | C11-1…C11-6 implemented + tests green | `npm run typecheck && npm test` — 420+ pass |
| P3 | Postgres staging harness PASS | `npm run test:postgres-staging` green |
| P4 | `DATABASE_URL` stored in vault (not committed) | Cloudflare Workers secrets / Vercel env / 1Password |
| P5 | Maintenance window scheduled | Notify users of brief write freeze |
| P6 | D1 backup / snapshot available | Cloudflare D1 console → "Backups" |

---

## Cutover Commands Reference

### 1. Apply Postgres Schema (idempotent)

```bash
# Option A — via DATABASE_URL env
export SQL_PROVIDER=postgres
export DATABASE_URL=postgresql://user:password@host:5432/dbname
npm run db:apply-postgres-schema

# Option B — via --database-url flag (overrides DATABASE_URL)
npx tsx scripts/apply-postgres-schema.ts --database-url=postgresql://user:pass@host:5432/dbname
```

**Behavior:** Idempotent — safe to re-run. Applies all canonical DDL from `src/db/migrations.ts` + enterprise phases. Uses `BEGIN`/`COMMIT` (not `BEGIN IMMEDIATE`).

### 2. Backfill D1 → Postgres

```bash
# Dry-run (default) — logs counts, no writes
npm run db:backfill-d1-to-postgres

# Execute (writes data)
npm run db:backfill-d1-to-postgres -- --execute

# With --target-url override (overrides DATABASE_URL)
npm run db:backfill-d1-to-postgres -- --target-url=postgresql://user:pass@host:5432/dbname --execute

# Owner-scoped backfill
npm run db:backfill-d1-to-postgres -- --owner=<owner-uuid> --execute

# Custom batch size
npm run db:backfill-d1-to-postgres -- --batch-size=500 --execute
```

**Output example (dry-run):**
```
D1 → Postgres metadata backfill (dry-run)...
organizations: scanned=2 upserted=0 (dry-run)
workspaces: scanned=5 upserted=0 (dry-run)
memories: scanned=127 upserted=0 (dry-run)
...
total: scanned=134 upserted=0 dryRun=true
```

### 3. Verify Parity (D1 ↔ Postgres)

```bash
# Via DATABASE_URL
npm run db:verify-postgres-parity

# Via --target-url override
npm run db:verify-postgres-parity -- --target-url=postgresql://user:pass@host:5432/dbname

# Owner-scoped
npm run db:verify-postgres-parity -- --owner=<owner-uuid>
```

**Output example:**
```
Verifying D1 ↔ Postgres row-count parity...
organizations: source=2 target=2 OK
workspaces: source=5 target=5 OK
memories: source=127 target=127 OK
...
Parity check passed.
```

**Exit codes:** `0` = parity OK. `1` = mismatch detected — block flip until resolved.

---

## Step-by-Step Cutover Procedure

### Phase A — Pre-cutover (S0 → S1 → S2)

| Step | Action | Command |
|------|--------|---------|
| A1 | Schedule maintenance window | Notify users |
| A2 | Create D1 snapshot/backup | Cloudflare D1 console |
| A3 | Create target Postgres database | `CREATE DATABASE ai_brain_prod;` |
| A4 | Apply schema to target Postgres | `npm run db:apply-postgres-schema` |
| A5 | Dry-run backfill (log only) | `npm run db:backfill-d1-to-postgres` |
| A6 | Verify dry-run counts match expectations | Review output |
| A7 | **Quiesce writes** — enable read-only mode or stop write traffic | REST / MCP health check → monitor |
| A8 | Execute backfill | `npm run db:backfill-d1-to-postgres -- --execute` |
| A9 | Verify parity | `npm run db:verify-postgres-parity` |
| A10 | If parity FAIL → investigate, fix, re-backfill affected tables | Manual |

### Phase B — Cutover Flip (S2 → S3)

| Step | Action | Notes |
|------|--------|-------|
| B1 | Update env: `SQL_PROVIDER=postgres` | Vault / Vercel / Cloudflare Workers |
| B2 | Update env: `DATABASE_URL` | Ensure correct connection string |
| B3 | Redeploy application | Vercel deploy or restart server |
| B4 | Health check | `GET /health` → `200 OK` |
| B5 | Smoke test — read memory | `GET /api/v1/memory` |
| B6 | Smoke test — write memory | `POST /api/v1/memory` |
| B7 | Smoke test — context build | `POST /api/v1/memory/:id/context` |
| B8 | Smoke test — cross-scope E2E | Run subset of `cross-owner-leak` tests manually |
| B9 | Open write traffic | Resume normal operations |

### Phase C — Post-cutover (S3)

| Step | Action | Notes |
|------|--------|-------|
| C1 | Monitor error rates | 15 min post-flip |
| C2 | Retain D1 read-only ≥ 30 days | Do NOT delete D1 |
| C3 | Document cutover timestamp | For rollback reference |
| C4 | Archive owner sign-off | [REVIEW.md](REVIEW.md) |

---

## Rollback Procedure

### Trigger
Sustained error rate, parity failure post-flip, or owner decision within retention window.

### Steps

| Step | Action | Command |
|------|--------|---------|
| R1 | Quiesce writes | Stop write traffic |
| R2 | Set `SQL_PROVIDER=d1` | Vault / Vercel / Cloudflare |
| R3 | Remove `DATABASE_URL` from production env | Optional — Postgres retained |
| R4 | Redeploy | Vercel deploy or restart |
| R5 | Verify health | `GET /health` → D1 OK |
| R6 | Verify writes resume | `POST /api/v1/memory` |
| R7 | **If writes occurred during S3** — manual re-backfill required | See below |

### Re-backfill After Rollback (if S3 had writes)

```bash
# 1. Flip back to postgres
export SQL_PROVIDER=postgres
export DATABASE_URL=postgresql://user:pass@host:5432/dbname

# 2. Re-backfill from D1 (source of truth)
npm run db:backfill-d1-to-postgres -- --execute

# 3. Verify parity
npm run db:verify-postgres-parity

# 4. Re-cutover (S2 → S3)
# Repeat Phase B
```

---

## Backfill Table Order (FK-safe)

Tables are backfilled in dependency order (ADR-018):

```
organizations → workspaces → clients → identities → agents
→ memories → memory_embeddings → memory_relations
→ workspace_memberships → audit_logs → settings
```

**No parallel table writes** during backfill — maintain write quiesce until parity verified.

---

## Environment Reference

| Variable | Default | Cutover |
|----------|---------|---------|
| `SQL_PROVIDER` | `d1` | `postgres` after flip |
| `DATABASE_URL` | — | Required when `SQL_PROVIDER=postgres` |
| `CLOUDFLARE_*`, `D1_*` | required for D1 | Still required as backfill source until D1 retired |
| `VECTOR_PROVIDER` | `d1` | **Unchanged** — embeddings stay on same `ISqlDatabase` |
| `OBJECT_STORAGE_PROVIDER` | `inline` | Unchanged |
| `SEARCH_PROVIDER` | `sql` | Unchanged |
| `GRAPH_PROVIDER` | `d1` | Unchanged |
| `CACHE_PROVIDER` | `none` | Unchanged |
| `EVENT_BUS_PROVIDER` | `none` | Unchanged |

---

## Connection Pooling

`PostgresSqlDatabaseAdapter` creates a `pg.Pool` in `createPostgresSqlDatabase()`.

| Setting | Recommended |
|---------|-------------|
| Max connections | Match Postgres provider limit (e.g., 20 for small instances) |
| Idle timeout | 30s |
| Connection timeout | 10s |

Graceful shutdown: `pool.end()` called on server shutdown via `unwrapPool()`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `DATABASE_URL is required` | Env not set | Set `DATABASE_URL` or pass `--target-url=` |
| `SQL_PROVIDER must be "postgres"` | Wrong env | Set `SQL_PROVIDER=postgres` |
| `Parity check failed — counts differ` | Partial backfill or drift | Re-run backfill with `--execute`; investigate source/target |
| `pg.Pool` connection error | Wrong credentials / network | Verify `DATABASE_URL`; check Postgres allowlist |
| Tests fail after flip | DDL mismatch | Ensure schema apply ran on target; check `runPostgresMigrations` |
| Rollback: writes not on D1 | Normal — Postgres-only during S3 | Re-backfill before re-cutover |

---

## Owner Sign-Off

Cutover must be owner-authorized. After successful S3:

```
Owner: _______________________
Date:  _______________________
Postgres provider: _______________________
Cutover timestamp: _______________________
D1 retained until: _______________________ (≥ 30 days)
```

Sign-off record: [REVIEW.md](REVIEW.md)

---

## References

- [ADR-018 — Production Postgres cutover](../../../docs/adr/018-production-postgres-cutover.md)
- [ADR-009 — PostgreSQL metadata adapter](../../../docs/adr/009-postgresql-metadata-adapter.md)
- [Phase 11 DESIGN](DESIGN.md)
- [Phase 11 IMPLEMENTATION](IMPLEMENTATION.md)
- [scripts/apply-postgres-schema.ts](../../../scripts/apply-postgres-schema.ts)
- [scripts/backfill-d1-to-postgres.ts](../../../scripts/backfill-d1-to-postgres.ts)
- [scripts/verify-postgres-parity.ts](../../../scripts/verify-postgres-parity.ts)

---

*Authored as part of Phase 11 C11-7. Subordinate to [DESIGN.md](DESIGN.md) and [ADR-018](../../../docs/adr/018-production-postgres-cutover.md).*
