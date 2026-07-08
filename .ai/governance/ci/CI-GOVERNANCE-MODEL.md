# CI Governance Model

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 2 |
| **Authority** | [engineering-governance-plan.md](../../designs/blueprints/engineering-governance-plan.md) |
| **Workflow** | `.github/workflows/ci.yml` → job `governance` |

---

## Purpose

CI is an **enforcement layer** for the engineering contract — not merely a test runner.

```
Code Change → CI Governance Gate → Validation → Merge Decision
```

---

## Job topology

| Job | Role |
|-----|------|
| `quality` | Lint · format · typecheck |
| `governance` | **Engineering contract** — tests + governance checks |
| `docker` | Container build smoke |

Merge to `main` / `staging` requires **governance** job green on PR and push.

---

## Governance pipeline (`ci:governance`)

```
npm test
npm run test:identity
npm run test:e2e
npm run ci:adr-impact
npm run ci:docs-impact
npm run ci:permission-contract
```

| Step | Validates |
|------|-----------|
| `npm test` | Full regression (88+ tests) |
| `test:identity` | Security boundary · tenant · authorization |
| `test:e2e` | Studio identity propagation |
| `ci:adr-impact` | Architecture paths require ADR in diff |
| `ci:docs-impact` | Code changes require docs/ or `.ai/` evidence |
| `ci:permission-contract` | Locked permission strings + ADR on auth changes |

---

## Baseline

- Branch: `forge/engineering-governance`
- Previous lock: `engineering-governance-wave-1-locked`
- P0-A baseline: `identity-foundation-p0-a-complete`

---

## Related

- [CI-RULES.md](./CI-RULES.md)
- [CI-FAILURE-CATALOG.md](./CI-FAILURE-CATALOG.md)
