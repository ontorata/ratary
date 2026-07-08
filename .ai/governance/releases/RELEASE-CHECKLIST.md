# Release Checklist

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 4 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |

---

## Purpose

Provide a concrete, step-by-step checklist for moving a release from **RC → RELEASED.** Every item must be checked. No exceptions.

---

## Pre-flight (Before RC Tag)

- [ ] All implementation complete
- [ ] All tests pass (`npm test`)
- [ ] All CI gates pass (`npm run ci:governance`)
- [ ] Scope confirmed against wave plan or blueprint
- [ ] No open blocking issues
- [ ] Governance owner sign-off obtained

---

## Validation Stage

- [ ] `npm test` — all pass
- [ ] `npm run ci:governance` — PASS
- [ ] `npm run ci:adr-impact` — PASS
- [ ] `npm run ci:docs-impact` — PASS
- [ ] `npm run ci:permission-contract` — PASS
- [ ] Peer review approved (if architecture/boundary change)
- [ ] AI handoff artifact reviewed (if agent-assisted)

---

## RC → RELEASED Checklist

Complete each item in order.

### 1. Merge

- [ ] Change merged to target branch (`main` or `forge/engineering-governance`)
- [ ] Merge commit SHA recorded
- [ ] No revert commits needed

### 2. Version Assigned

- [ ] Semantic version determined per [VERSIONING.md](./VERSIONING.md)
- [ ] Wave lock tag format applied: `engineering-governance-wave-N-locked`
- [ ] Pre-release tags cleared (no `-alpha.N`, `-beta.N`, or `-rc.N` remaining)

### 3. Governance Evidence Artifact

- [ ] Evidence artifact created at `.ai/governance/releases/<RELEASE-ID>.md`
- [ ] All required fields populated:
  - Change summary
  - Files changed
  - Architecture impact
  - Tests executed (command + pass counts)
  - Governance artifacts updated
  - Known risks
  - RC verification
  - Remote tag verification
- [ ] Evidence artifact linked from wave record

### 4. Changelog Entry

- [ ] Changelog entry drafted per [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md)
- [ ] Correct category selected (Added / Changed / Fixed / Security / Deprecated / Removed)
- [ ] Evidence links populated (commit SHA, test command, ADR if applicable)
- [ ] Changelog located at correct path (governance or project root)

### 5. Tag Applied

- [ ] Annotated tag created
- [ ] Tag message includes: change summary + evidence link + version
- [ ] Tag pushed to remote
- [ ] `git ls-remote --tags` confirms remote receipt

### 6. Documentation

- [ ] `.ai/INDEX.md` updated if new governance concept introduced
- [ ] `.ai/sessions/CURRENT.md` updated (audit trail)
- [ ] Wave record updated with lock tag reference
- [ ] P0-B release record updated with wave status

### 7. Ratary Memory (if MCP available)

- [ ] Ratary `save_memory` called with:
  - `tags: ["release", "wave-4", "governance"]`
  - `memoryType: "task"`
  - Summary of what was released
  - Link to evidence artifact

### 8. Final Verification

- [ ] `git log --oneline` shows release commit and tag
- [ ] `git ls-remote --tags` shows lock tag on remote
- [ ] `npm test` still green post-merge
- [ ] Evidence artifact accessible and linked
- [ ] Changelog entry visible at correct path

---

## Release Types and Specific Checklists

### Governance Wave Release

| Item | Specific Requirement |
|------|---------------------|
| Evidence artifact | Wave checkpoint at `.ai/governance/waves/WAVE-N-*.md` |
| Changelog | At `.ai/governance/releases/<WAVE-ID>-CHANGELOG.md` |
| Tag | `engineering-governance-wave-N-locked` |
| Proof artifact | `.ai/reviews/engineering-governance/*-proof.md` |
| P0-B record update | Wave status → LOCKED |

### Application Release

| Item | Specific Requirement |
|------|---------------------|
| Evidence artifact | Implementation Completion Report |
| Changelog | `CHANGELOG.md` at project root |
| Tag | `v<MAJOR>.<MINOR>.<PATCH>` |
| ADR reference | If boundary change, ADR linked |
| Migration plan | If breaking change, plan documented |

### Governance Artifact Release

| Item | Specific Requirement |
|------|---------------------|
| Evidence artifact | Release record at `.ai/governance/releases/<ID>.md` |
| Changelog | At `.ai/governance/releases/CHANGELOG.md` |
| Tag | `governance-v<semver>` |
| AI protocol confirmation | If affects AI workflow |

---

## Rollback Checklist

If a governance release introduces unintended side effects:

- [ ] Identify the breaking commit: `git log` + evidence artifact
- [ ] Revert the commit: `git revert <sha>`
- [ ] File ADR if pattern change required: `.ai/core/adr/ADR-0XX.md`
- [ ] Update evidence artifact with rollback record
- [ ] Update changelog: `### Removed` — describe rollback
- [ ] Create new lock tag if rollback changes governance state: `engineering-governance-wave-N-rollback-1`
- [ ] Notify governance owner
- [ ] Ratary memory updated with rollback event

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Release owner (human) | | |
| Governance owner | | |
| AI agent (if agent-assisted) | Cursor / Claude Code | |

---

## Related

- [RELEASE-PROCESS.md](./RELEASE-PROCESS.md)
- [VERSIONING.md](./VERSIONING.md)
- [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md)
- [CHANGE-EVIDENCE.md](../workflows/CHANGE-EVIDENCE.md)
