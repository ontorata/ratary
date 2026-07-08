# Versioning Policy

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 4 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |

---

## Purpose

Define how versions are assigned so every release has a predictable, meaningful version identifier.

---

## Version Format

```
v<MAJOR>.<MINOR>.<PATCH>[<PRERELEASE>]

<MAJOR>   — Breaking change to stable API or governance contract
<MINOR>   — New capability (backward-compatible)
<PATCH>   — Bug fix, governance correction, or patch (backward-compatible)

<PRERELEASE> (optional):
  -alpha.N   — Development phase (internal)
  -beta.N    — Pre-release validation
  -rc.N      — Release candidate
```

**Examples:**

| Version | Meaning |
|---------|---------|
| `v0.1.0` | Development phase — governance artifacts early |
| `v0.2.0` | New governance wave added (backward-compatible) |
| `v0.2.1` | Bug fix in governance artifact or CI |
| `v1.0.0` | Stable product release |
| `v1.1.0` | New feature (backward-compatible) |
| `v2.0.0` | Breaking change — requires migration |

---

## Semantic Versioning Rules

### Phase-based versioning

| Phase | Version Prefix | When to Increment |
|-------|---------------|-------------------|
| Phase 4 — Proof of Platform | `v0.x.x` | Active development — breaking changes allowed in minor |
| Phase 5 — Production Ready | `v1.x.x` | Stability required — breaking changes require major bump |

**Why `v0` for Phase 4?**
Proof of Platform is actively evolving. Governance artifacts, workflows, and process are being validated. Stability is not guaranteed until Phase 5.

---

### When to Increment

#### MAJOR — Breaking Change

- Removing or renaming a governance field in a wave record
- Changing the release lifecycle stage order
- Changing the change authority matrix in a way that affects existing decisions
- Changing AI workflow protocol in a way that invalidates existing handoffs
- Removing a required evidence artifact

**Example:** Changing `.ai/governance/releases/` structure requires major bump.

#### MINOR — New Capability

- Adding a new governance wave artifact
- Adding a new evidence requirement to [CHANGE-EVIDENCE.md](../workflows/CHANGE-EVIDENCE.md)
- Adding a new stage to the release lifecycle
- Adding a new validation gate to `ci:governance`
- Adding a new changelog category

**Example:** Wave 4 (Release Management) added → minor bump.

#### PATCH — Bug Fix or Correction

- Fixing incorrect governance artifact content
- Fixing CI script errors
- Correcting release record metadata
- Updating evidence artifact with missing fields

**Example:** Fixing a typo in `RELEASE-PROCESS.md` that misstates a stage owner.

---

## Breaking Change Handling

### Within Governance Artifacts

A breaking change to a governance artifact requires:

1. **ADR** filed describing the change and rationale
2. **Migration plan** documented in the ADR
3. **Version bump** (MAJOR if stable `v1.x.x`, MINOR if `v0.x.x`)
4. **Evidence artifact** updated with migration notes
5. **Ratary memory** updated via MCP
6. **Lock tag** reassessed — existing locks are immutable, new changes increment version

### Within Application Runtime

Follows standard application `CHANGELOG.md` and semantic versioning.

---

## Pre-release Convention

### `-alpha.N` — Development Phase

Internal governance artifacts under active development.

```
engineering-governance-v0.4.0-alpha.1
```

**When to use:**
- New wave artifacts drafted but not reviewed
- Experimental governance process being tested

**Not for:**
- Changes that have passed governance review
- Locked artifacts

### `-beta.N` — Pre-release Validation

Governance artifacts that are reviewed but not yet locked.

```
engineering-governance-v0.4.0-beta.1
```

**When to use:**
- Wave artifacts reviewed, pending final lock
- Process changes awaiting owner sign-off

### `-rc.N` — Release Candidate

Artifacts ready for final governance release.

```
engineering-governance-v0.4.0-rc.1
```

**When to use:**
- All acceptance criteria met
- Governance evidence artifact written
- Ready for lock tag

---

## Wave Tag Convention

Governance waves use a parallel tagging system for clarity:

| Tag | Meaning |
|-----|---------|
| `engineering-governance-wave-1-locked` | Wave 1 locked (ADR Enforcement) |
| `engineering-governance-wave-2-locked` | Wave 2 locked (CI Governance Gate) |
| `engineering-governance-wave-3-locked` | Wave 3 locked (AI Workflow Governance) |
| `engineering-governance-wave-4-locked` | Wave 4 locked (Release Management) |
| `engineering-governance-wave-4-rc` | Wave 4 release candidate |
| `engineering-governance-v0.4.0` | Semantic version tag (aliases the wave lock) |

---

## Version Number Source

Version numbers are tracked in:

1. **Annotated tag** — primary source, immutable after creation
2. **Wave record** — links to tag (`lock_tag` field)
3. **Release record** — links to version tag
4. **Ratary memory** — version history via MCP

---

## Non-Goals

- No automated version bumping from CI
- No version enforcement on governance artifacts (only on application releases)
- No dependency version locking (governance artifacts are source of truth)

---

## Related

- [RELEASE-PROCESS.md](./RELEASE-PROCESS.md)
- [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md)
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
