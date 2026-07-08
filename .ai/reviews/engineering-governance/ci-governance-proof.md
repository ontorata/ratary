# CI Governance Gate — Evidence (P0-B Wave 2)

| Field | Value |
|-------|-------|
| **Wave** | 2 — CI Governance Gate |
| **Branch** | `forge/engineering-governance` |
| **Baseline lock** | `engineering-governance-wave-1-locked` |
| **Date** | 2026-07-08 |

---

## Acceptance gate

| Gate | Evidence |
|------|----------|
| `ci:governance` job | `.github/workflows/ci.yml` → job `governance` |
| npm script | `package.json` → `"ci:governance"` |
| Identity tests | included in pipeline |
| E2E tests | included in pipeline |
| ADR impact | `scripts/ci/adr-impact-check.mjs` (Wave 1) |
| Docs fail mode | `scripts/ci/docs-impact-check.mjs` — exit 1 default |
| Permission contract | `scripts/ci/permission-contract-check.mjs` |
| Contract doc | `.ai/core/governance/PERMISSION-CONTRACT.md` |
| CI model | `.ai/governance/ci/CI-GOVERNANCE-MODEL.md` |
| CI rules | `.ai/governance/ci/CI-RULES.md` |
| Failure catalog | `.ai/governance/ci/CI-FAILURE-CATALOG.md` |
| Wave checkpoint | `.ai/governance/waves/WAVE-2-CI-GOVERNANCE.md` |
| Lock tag | `engineering-governance-wave-2-locked` |

---

## Validation output

```bash
npm run ci:governance
```

Expected (Wave 2 commit):

- `npm test` — 88/88 pass
- `test:identity` — 56/56 pass
- `test:e2e` — 7/7 pass
- `adr-impact-check` — OK
- `docs-impact-check` — OK (`.ai/` + `docs/` in diff)
- `permission-contract-check` — OK

---

## Permission contract verification

Canonical strings validated against `src/auth/permission-context.ts`:

| Permission |
|------------|
| `memory.read` |
| `memory.write` |
| `workspace.read` |
| `workspace.manage` |
| `organization.manage` |

---

## Non-goals verification

| Non-goal | Verified |
|----------|----------|
| Deployment automation | ✅ not added |
| Environment promotion | ✅ not added |
| Release tagging automation | ✅ not added |
| Migration execution in CI | ✅ not added |
| Branch strategy redesign | ✅ not added |

---

## Decision

Wave 2 complete. CI is the governance enforcement layer for merge decisions on `main` / `staging`.
