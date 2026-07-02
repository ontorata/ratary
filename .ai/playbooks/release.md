# Playbook: Release

**ID:** `playbooks/release`  
**Purpose:** Ship a verified version from staging to production with documentation, tagging, and post-deploy verification.  
**Owner sign-off:** Release **Ship** verdict required.

---

## When to execute

- Phase work or scheduled release candidate ready
- All merge gates satisfied
- Staging verification complete

**Not for:** emergency hotfix (see [hotfix.md](hotfix.md) expedited path) or incident rollback.

---

## Prerequisites

| Check | Source |
|-------|--------|
| Quality gate PASS | `review/quality-gate` or phase gate |
| Regression green | `testing/regression-verification` |
| Changelog drafted | `documentation/changelog-authoring` |
| Migrations applied in staging | `phases/NN-name/MIGRATION.md` |
| Rollback plan ready | [rollback.md](rollback.md) |

---

## Procedure

### 1. Readiness

Prompt: `release/readiness-assessment`

**Verdict:** Ship | Ship with conditions | Do not ship

Halt on **Do not ship**.

### 2. Version coordination

Prompt: `release/version-coordination`

- Semver bump per change set
- Tag name agreed
- Dependent services noted

### 3. Pre-deploy checklist

Prompt: `release/deployment-checklist`

| Phase | Items |
|-------|-------|
| **Pre-deploy** | Migrations reviewed, secrets current, rollback tested |
| **Deploy** | Ordered steps with owner per step |
| **Post-deploy** | Smoke tests, metric watch |

### 4. Deploy to `{ENVIRONMENT}`

Execute deploy steps. For zero-downtime:

Prompt: `migration/zero-downtime-cutover` (if migration involved)

### 5. Post-release verification

Prompt: `release/post-release-verification`

| Window | Action |
|--------|--------|
| T+15 min | Smoke tests |
| T+1 hour | Metrics vs baseline |
| T+24 hours | Changelog published; monitor trends |

### 6. Documentation

| Artifact | Prompt |
|----------|--------|
| Changelog | `documentation/changelog-authoring` |
| API docs | `documentation/api-reference-update` (if contracts changed) |
| Runbook | `documentation/runbook-authoring` (if ops surface changed) |

### 7. Governance sync (if phase release)

If release closes phase work → run [phase-completion.md](phase-completion.md) gate sections before marking roadmap ✅.

### 8. Record

Update `audits/latest.md` with release version, date, and observations.

---

## Expedited path (hotfix)

For [hotfix.md](hotfix.md) only:

1. `release/readiness-assessment` (abbreviated — fix scope only)
2. PATCH version bump
3. Deploy + `release/post-release-verification`
4. Changelog PATCH entry

Skip feature documentation unless API changed.

---

## Exit criteria

- [ ] Deployed version matches approved tag
- [ ] Post-release smoke tests **PASS**
- [ ] Metrics within threshold
- [ ] Changelog published
- [ ] Rollback plan remains valid for 24 hours

---

## Abort criteria

Trigger [rollback.md](rollback.md) if:
- Smoke tests fail
- Error rate > 2x baseline for 10 minutes
- Migration integrity check fails

---

## Dependencies

| Artifact | Relationship |
|----------|----------------|
| [phase-completion.md](phase-completion.md) | If release closes phase |
| [rollback.md](rollback.md) | Abort path |
| [prompts/release/](../prompts/release/README.md) | Release prompts |

---

## Compatible AI assistants

**Claude**, **ChatGPT** for checklists and changelog. **Cursor**, **OpenHands** for deploy automation. Owner signs Ship verdict.

---

*Do not ship with open BLOCKER from quality gate or unapproved breaking ADR.*
