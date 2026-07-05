# Phase 11 — Production Operations — HANDOFF

**Tanggal:** 2026-07-03  
**Status:** Uncommitted changes — 420 tests pass, typecheck pass  
**Branch:** main

---

## Apa yang sudah selesai (C11-1 .. C11-8)

### Commit belum di-commit
Semua file Phase 11 di bawah ini **belum di-commit**:

| Commit | Scope | Files |
|--------|-------|-------|
| C11-1 | `runPostgresMigrations` | `src/db/postgres-migrations.ts`, `tests/db/postgres-migrations.test.ts` |
| C11-2 | `apply-postgres-schema` CLI | `scripts/apply-postgres-schema.ts`, `scripts/lib/postgres-schema.ts` |
| C11-3 | Postgres schema idempotency test | `tests/db/postgres-migrations.test.ts` (extended) |
| C11-4 | CI postgres-staging job | `.github/workflows/postgres-staging.yml` |
| C11-5 | D1→Postgres backfill lib | `scripts/lib/d1-to-postgres-backfill.ts`, `scripts/lib/d1-to-postgres-connection.ts`, `tests/scripts/d1-to-postgres-backfill.test.ts` |
| C11-6 | Backfill + parity CLIs | `scripts/backfill-d1-to-postgres.ts`, `scripts/verify-postgres-parity.ts`, `scripts/lib/postgres-parity.ts` |
| C11-7 | MIGRATION.md runbook | `.ai/phases/11-production-ops/MIGRATION.md` |
| C11-8 | PANDUAN §8 + README | `docs/PANDUAN.md`, `README.md` |

### Dokumen phase 11 (`11-production-ops/`)
- `README.md` ✅
- `DESIGN.md` ✅
- `RISKS.md` ✅
- `IMPLEMENTATION.md` ✅
- `CHECKLIST.md` ✅ (milestones updated)
- `MIGRATION.md` ✅ **— cutover runbook baru**

### Updated
- `.ai/TASK_PROMPT.md` — milestones C11-1..C11-8
- `.ai/phases/11-production-ops/CHECKLIST.md` — §2 updated
- `docs/PANDUAN.md` §8 — Postgres metadata ops
- `README.md` — roadmap Phase 11 + MIGRATION.md link

---

## Quick verify

```bash
cd D:\Apps\ai-brain
npm run typecheck  # PASS
npm test           # 420 pass, 3 skipped
git status         # uncommitted Phase 11 changes
```

---

## Perintah CLI Phase 11

```bash
# Apply schema Postgres (idempotent)
npm run db:apply-postgres-schema
# atau dengan --database-url override:
npx tsx scripts/apply-postgres-schema.ts --database-url=postgresql://user:pass@host:5432/dbname

# Backfill D1 → Postgres
npm run db:backfill-d1-to-postgres                          # dry-run default
npm run db:backfill-d1-to-postgres -- --execute            # tulis data
npm run db:backfill-d1-to-postgres -- --target-url=... --execute
npm run db:backfill-d1-to-postgres -- --owner=<uuid> --batch-size=500 --execute

# Verifikasi parity
npm run db:verify-postgres-parity
npm run db:verify-postgres-parity -- --target-url=postgresql://...
npm run db:verify-postgres-parity -- --owner=<uuid>

# Staging harness
npm run test:postgres-staging
```

---

## Next steps (yang perlu lanjut)

| Priority | Task | Notes |
|----------|------|-------|
| **P0** | Commit C11-1..C11-8 | Split per commit plan di IMPLEMENTATION.md |
| **P1** | Verify staging harness hijau | `npm run test:postgres-staging` di CI |
| **P2** | Owner review MIGRATION.md | Runbook cutover perlu owner eyes |
| **P3** | Ops docs (11D) close | CHECKLIST §4-§5 |
| **Deferred** | 11C `MemoryRepository` reader/writer split | ADR-019 Proposed — owner Approve to implement |

---

## Suggested commit split

```bash
# C11-1: db: add runPostgresMigrations(ISqlDatabase)
git add src/db/postgres-migrations.ts tests/db/postgres-migrations.test.ts
git commit -m "db: add runPostgresMigrations(ISqlDatabase)"

# C11-2: scripts: apply-postgres-schema CLI
git add scripts/apply-postgres-schema.ts scripts/lib/postgres-schema.ts package.json
git commit -m "scripts: apply-postgres-schema CLI"

# C11-3: test(db): postgres schema idempotency
git add tests/db/postgres-migrations.test.ts
git commit -m "test(db): postgres schema idempotency"

# C11-4: ci: postgres staging harness job
git add .github/workflows/postgres-staging.yml
git commit -m "ci: postgres staging harness job"

# C11-5: scripts: d1-to-postgres backfill library
git add scripts/lib/d1-to-postgres-backfill.ts scripts/lib/d1-to-postgres-connection.ts tests/scripts/d1-to-postgres-backfill.test.ts
git commit -m "scripts: d1-to-postgres backfill library"

# C11-6: scripts: backfill + verify CLIs
git add scripts/backfill-d1-to-postgres.ts scripts/verify-postgres-parity.ts scripts/lib/postgres-parity.ts
git commit -m "scripts: backfill + verify CLIs"

# C11-7: docs(phase-11): MIGRATION runbook
git add .ai/phases/11-production-ops/MIGRATION.md
git commit -m "docs(phase-11): MIGRATION runbook"

# C11-8: docs: PANDUAN + README postgres ops
git add docs/PANDUAN.md README.md .ai/phases/11-production-ops/CHECKLIST.md .ai/TASK_PROMPT.md
git commit -m "docs: PANDUAN §8 + README ops matrix"
```

---

## Constraints

- **Jangan commit** kecuali diminta owner
- Default `SQL_PROVIDER=d1` — jangan ubah
- `pg` import hanya di `src/infrastructure/` + scripts
- Production cutover **owner-run only** — MIGRATION.md runbook sudah ada

---

## Starter prompt untuk Cline lanjut

```
Lanjut Phase 11 ai-brain dari handoff Cursor.

Konteks:
- Repo: D:\Apps\ai-brain, branch main, perubahan Phase 11 BELUM di-commit
- C11-1..C11-8 DONE: postgres migrations, apply-postgres-schema CLI, CI staging, backfill+parity scripts, MIGRATION.md runbook, PANDUAN §8
- Tests: 420 pass, typecheck pass
- Docs: .ai/phases/11-production-ops/

Next:
1. Commit C11-1..C11-8 per commit plan di IMPLEMENTATION.md
2. Verify staging harness: npm run test:postgres-staging
3. Owner review MIGRATION.md cutover runbook

Usage:
npm run db:apply-postgres-schema
npm run db:backfill-d1-to-postgres -- --execute
npm run db:verify-postgres-parity

Jangan commit kecuali saya minta. Balas dalam Indonesian.
```

---

*Handoff 2026-07-03. Commit C11-1..C11-8 saat owner siap.*
