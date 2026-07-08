# Release Process

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 4 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |
| **Versioning** | [VERSIONING.md](./VERSIONING.md) |
| **Changelog** | [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md) |

---

## Purpose

Define a formal, auditable release lifecycle so every artifact and governance deliverable is **released, not just merged.**

---

## Release Lifecycle

```
Development
    │
    ▼
Feature Complete
    │
    ▼
Validation
    │
    ▼
Governance Review
    │
    ▼
Release Candidate (RC)
    │
    ▼
Governance Evidence
    │
    ▼
Tag
    │
    ▼
RELEASED
```

Each stage has explicit criteria. No stage is skippable without documented exception.

---

## Stage Definitions

### 1. Development

**Owner:** Engineer / AI agent

Change is implemented. Tests pass locally. Scope confirmed against blueprint or wave plan.

**Exit criteria:**
- Implementation complete (code, config, or governance artifact)
- Tests pass (`npm test`)
- Scope acknowledged (no drift from approved plan)
- AI protocol followed if agent-assisted

---

### 2. Feature Complete

**Owner:** Engineer / AI agent

All acceptance criteria for the change are satisfied.

**Exit criteria:**
- Implementation matches acceptance criteria
- No open defects assigned to this change
- Self-review done

---

### 3. Validation

**Owner:** Automated pipeline (CI) + Engineer

**Automated:**
- `npm test` — all pass
- `npm run ci:governance` — all gates pass (ADR impact, docs, permission contract)
- `ci:adr-impact` — ADR enforcement (Wave 1)
- `ci:governance` — Wave gate (Wave 2)
- `ci:docs-impact` — Documentation impact (Wave 2)

**Manual:**
- Peer review (required for architecture/boundary changes)
- AI handoff artifact reviewed (if agent-assisted)

**Exit criteria:**
- All CI jobs green
- Review approved
- No open review comments that block merge

---

### 4. Governance Review

**Owner:** Governance owner

Ensure the change aligns with Phase 4 execution contract and does not violate:
- Boundary constraints (no auth/permission changes without ADR)
- AI workflow governance (Wave 3)
- Implementation Completion Protocol

**Evidence collected:**
- Implementation Completion Report
- Test output (command + pass counts)
- Architecture impact statement
- AI protocol confirmation (if applicable)

**Exit criteria:**
- Governance owner sign-off
- All required evidence present

---

### 5. Release Candidate (RC)

**Owner:** Release owner

Change is merged. All integration tests pass. RC is identified by tag format: `rc/<semver>` or governance tag `engineering-governance-wave-N-rc`.

**RC types:**

| Type | When Used | Tag Format |
|------|-----------|------------|
| Governance wave | P0-B implementation waves | `engineering-governance-wave-N-rc` |
| Governance artifact | Non-wave releases | `governance/<semver>` |
| Application release | Production runtime | Semantic version per [VERSIONING.md](./VERSIONING.md) |

**Exit criteria:**
- Change merged to target branch
- RC tag applied
- Changelog entry drafted per [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md)
- Governance evidence artifact written

---

### 6. Governance Evidence

**Owner:** Engineer / AI agent

Formal evidence artifact is written to `.ai/governance/releases/` and linked from the wave or release record.

**Evidence artifact path:** `.ai/governance/releases/<RELEASE-ID>.md`

**Contents:**
- Change summary
- Files changed
- Architecture impact
- Test output (command + pass counts)
- Governance artifacts updated
- Known risks
- RC verification
- Remote tag verification

**Exit criteria:**
- Evidence artifact committed
- Linked from wave record or release record
- CI passes with new artifact indexed

---

### 7. Tag

**Owner:** Release owner (human)

Annotated tag applied with:
- Tag message: change summary + evidence link
- Reference to RC commit

**Tag types:**

| Context | Tag Format |
|---------|-----------|
| Governance wave locked | `engineering-governance-wave-N-locked` |
| Governance release | `governance-v<semver>` |
| Application release | `v<semver>` |

**Exit criteria:**
- Tag pushed to remote
- `git ls-remote --tags` confirms remote receipt
- Wave/release record updated with tag reference

---

### 8. RELEASED

**Owner:** Governance owner

The change is complete and recorded.

- Release record updated
- Changelog entry finalized
- Ratary memory updated (via MCP)
- Audit trail updated (`.ai/sessions/CURRENT.md`)

---

## Ownership

| Stage | Owner |
|-------|-------|
| Development | Engineer / AI agent |
| Feature Complete | Engineer / AI agent |
| Validation | Automated (CI) + Engineer |
| Governance Review | Governance owner |
| Release Candidate | Release owner |
| Governance Evidence | Engineer / AI agent |
| Tag | Release owner (human) |
| RELEASED | Governance owner |

---

## Approval Gate

| Gate | Requirement |
|------|-------------|
| RC → RELEASED | Governance evidence artifact exists and indexed |
| RC → RELEASED | Remote tag verified via `git ls-remote --tags` |
| RC → RELEASED | Changelog entry drafted |
| RC → RELEASED | CI regression confirmed |

---

## Rollback Decision

If a governance release introduces unintended side effects:

1. **Governance artifacts:** Revert the commit, file an ADR if pattern change is required, update evidence artifact
2. **Wave artifacts:** Lock does not prevent revert — lock records the wave, not the artifact state
3. **Application release:** Rollback follows standard `npm run rollback:<component>` with governance evidence

---

## Non-Goals

- No automated deployment
- No Kubernetes release pipeline
- No environment promotion
- No artifact registry integration
- No production migration execution

**Focus:** Make "ready to release" objective and auditable.

---

## Related

- [VERSIONING.md](./VERSIONING.md)
- [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md)
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [CHANGE-EVIDENCE.md](../workflows/CHANGE-EVIDENCE.md)
- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)
