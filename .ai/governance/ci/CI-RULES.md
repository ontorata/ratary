# CI Rules — Engineering Governance Gate

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 2 |
| **Enforcement** | `npm run ci:governance` · GitHub Actions job `governance` |

---

## Rule catalog

| ID | Rule | Command | Fail when |
|----|------|---------|-----------|
| CI-01 | Full regression | `npm test` | Any unit/integration test fails |
| CI-02 | Identity suite | `npm run test:identity` | Identity boundary tests fail |
| CI-03 | E2E suite | `npm run test:e2e` | Studio identity E2E fails |
| CI-04 | ADR impact | `npm run ci:adr-impact` | Architecture paths change without ADR in diff |
| CI-05 | Docs / governance impact | `npm run ci:docs-impact` | Code changes without `docs/` or `.ai/` update |
| CI-06 | Permission contract | `npm run ci:permission-contract` | PERMISSIONS drift or auth permission files change without ADR |

---

## CI-04 — ADR impact (trigger paths)

- `src/auth/`
- `src/scope/`
- `src/transport/shared/` · `src/transport/mcp/remote/`
- `src/db/migrations.ts` · `schema.sql`
- `tests/identity/`

**Pass signal:** `.ai/core/architecture/ADR-*` or `.ai/core/adr/ADR-*` or public adr-index in same diff.

See [ARCHITECTURE-CHANGE-MAP.md](../../core/governance/ARCHITECTURE-CHANGE-MAP.md).

---

## CI-05 — Docs / governance impact

**Code paths:** `src/` · `api/` · `packages/` · `scripts/` (except `scripts/ci/`)

**Evidence paths:** `docs/` · `.ai/` · `README.md` · `CHANGELOG.md` · PR template

Warning-only legacy: `node scripts/ci/docs-impact-check.mjs origin/main --warn`

---

## CI-06 — Permission contract

**Canonical strings (locked):**

- `memory.read`
- `memory.write`
- `workspace.read`
- `workspace.manage`
- `organization.manage`

**Source of truth:** `src/auth/permission-context.ts`

**Trigger files:** `permission-context.ts` · `authorization-boundary.ts` · `permission.middleware.ts` · `permissions.ts`

When trigger files change → ADR signal required + identity tests must pass (CI-02).

See [PERMISSION-CONTRACT.md](../../core/governance/PERMISSION-CONTRACT.md).

---

## Non-goals (Wave 2)

- Deployment automation
- Environment promotion
- Release tagging automation
- Migration execution in CI
- Branch strategy redesign

---

## Related

- [CI-GOVERNANCE-MODEL.md](./CI-GOVERNANCE-MODEL.md)
- [CI-FAILURE-CATALOG.md](./CI-FAILURE-CATALOG.md)
