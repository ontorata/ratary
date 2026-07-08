# Changelog Policy

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 4 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |
| **Versioning** | [VERSIONING.md](./VERSIONING.md) |

---

## Purpose

Define what changes must appear in the changelog, the required format, and the audience for each entry.

---

## Why a Changelog Policy?

Without a changelog policy, governance releases are not auditable by stakeholders who did not observe the implementation. The changelog is the **public face of the change record.**

The audience is not just engineers — it includes:
- Governance owners tracking wave progress
- Future AI agents auditing the change history
- External organizations evaluating Ratary

---

## What Changes Must Appear

### Always Required

| Change Type | Example | Changelog Entry |
|-------------|---------|-----------------|
| New governance wave | Wave 4 Release Management | `Added: Wave 4 Release Management` |
| New AI workflow protocol | Multi-agent handoff rule | `Added: Multi-agent handoff protocol` |
| New CI governance gate | `ci:adr-impact` | `Added: ADR impact enforcement gate` |
| New changelog category | Security category added | `Added: Security change category` |
| Breaking governance change | Stage order change | `Changed: Release lifecycle stage order` |
| Bug fix in governance artifact | Wrong owner in record | `Fixed: Incorrect stage owner in RELEASE-PROCESS.md` |
| Security hardening | Permission contract tightening | `Security: Strengthened permission contract validation` |
| Deprecation | Old artifact superseded | `Deprecated: Legacy handoff format (use SESSION-HANDOFF.md)` |
| Removal | Legacy process removed | `Removed: Legacy change authority tier` |

### Application Changes (Standard)

| Change Type | Example | Changelog Entry |
|-------------|---------|-----------------|
| New feature | User identity API | `Added: User identity API` |
| API change | New field | `Changed: User identity API — added `workspace_id` field` |
| Bug fix | Auth token expiry | `Fixed: Auth token not renewing on expiry` |
| Security fix | Vulnerability patched | `Security: Patched token validation vulnerability` |
| Deprecation | API deprecated | `Deprecated: v1 identity API — migrate by v2.0.0` |
| Removal | API removed | `Removed: Legacy v0 identity API` |

---

## Changelog Categories

Six categories, matching Keep a Changelog v1.1.0:

### Added
New capabilities, features, or governance artifacts.

```
### Added
- Wave 4 Release Management governance artifacts
- Multi-agent handoff protocol for Cursor ↔ Claude Code
```

### Changed
Changes to existing capabilities that affect behavior but are not breaking.

```
### Changed
- Release lifecycle — Governance Review moved before RC (breaking change documented in ADR-0XX)
```

### Fixed
Bug fixes, corrections, or improvements to existing functionality.

```
### Fixed
- Incorrect stage owner in RELEASE-PROCESS.md
- Missing `remote verification` field in evidence template
```

### Security
Security-related changes, including hardening, vulnerability patches, and permission model updates.

```
### Security
- Permission contract — strengthened validation in `ci:governance`
- Wave lock tag verification added to release evidence
```

### Deprecated
Features or artifacts that will be removed in a future release.

```
### Deprecated
- Legacy `COMPLETION-REPORT-TEMPLATE.md` — use `IMPLEMENTATION-REPORT-TEMPLATE.md`
```

### Removed
Features or artifacts that have been removed.

```
### Removed
- Legacy `IMPLEMENTATION-COMPLETION-PROTOCOL.md` v1 — superseded by v2
```

---

## Format

### Per-Change Entry

```markdown
### <Category>
- <Short description> (<Link to evidence artifact or ADR>)
  - Detail: specific field, file, or behavior changed
  - Evidence: <commit> · <test output>
```

### Example: Governance Wave

```markdown
## [engineering-governance-wave-4-locked] — 2026-07-08

### Added
- Release Management governance artifacts (`.ai/governance/releases/`)
  - RELEASE-PROCESS.md — formal release lifecycle (8 stages)
  - VERSIONING.md — semantic versioning rules for governance
  - CHANGELOG-POLICY.md — changelog categories and requirements
  - RELEASE-CHECKLIST.md — RC-to-RELEASED checklist
  - Evidence: `93d431e` · Wave 4 proof artifact
```

### Example: Application Release

```markdown
## [v1.2.0] — 2026-07-08

### Added
- User identity API with workspace isolation (ADR-012)
  - `GET /api/v1/identities` — returns user's identities scoped to workspace
  - Evidence: `abc1234` · `npm test` 88/88 PASS

### Security
- Permission contract — tightened validation for `workspace_id`
  - Evidence: `abc1234` · `npm run ci:permission-contract` PASS
```

---

## Audience

| Audience | What They Need | Format |
|----------|---------------|--------|
| Governance owner | Wave progress, risk changes | Summary line + evidence link |
| AI agent (future) | Change history for context | Detailed per-change entry |
| External org evaluator | Governance maturity signal | Executive summary + category |
| Engineer | Specific behavioral change | Detailed + test evidence |

---

## Link to Commits and Evidence

Every changelog entry links to:
1. **Commit** — SHA and summary
2. **Evidence artifact** — path in `.ai/governance/releases/`
3. **Test output** — command + pass count
4. **ADR** — if architecture or boundary change

Format:
```
Evidence: <commit> · <test command> <result>
ADR: ADR-0XX (if applicable)
```

---

## Changelog Location

| Release Type | Changelog Path |
|--------------|---------------|
| Governance wave | `.ai/governance/releases/<WAVE-ID>-CHANGELOG.md` |
| Governance artifact | `.ai/governance/releases/CHANGELOG.md` |
| Application release | `CHANGELOG.md` (project root) |

---

## Changelog Maintenance

- **Drafted** at RC stage (before tag)
- **Reviewed** during Governance Evidence stage
- **Finalized** at RELEASED stage
- **Indexed** in release record and wave checkpoint

---

## Non-Goals

- No auto-generation from git log (manual curation for governance quality)
- No machine-readable changelog format requirement (human-readable first)
- No breaking change automated detection (ADR system handles this)

---

## Related

- [RELEASE-PROCESS.md](./RELEASE-PROCESS.md)
- [VERSIONING.md](./VERSIONING.md)
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [CHANGE-EVIDENCE.md](../workflows/CHANGE-EVIDENCE.md)
