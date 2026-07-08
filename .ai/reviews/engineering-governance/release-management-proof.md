# Release Management — Evidence (P0-B Wave 4)

| Field | Value |
|-------|-------|
| **Wave** | 4 — Release Management |
| **Branch** | `forge/engineering-governance` |
| **Baseline lock** | `engineering-governance-wave-3-locked` |
| **Date** | 2026-07-08 |

---

## Acceptance gate

| Gate | Evidence |
|------|----------|
| RELEASE-PROCESS.md | `.ai/governance/releases/RELEASE-PROCESS.md` |
| VERSIONING.md | `.ai/governance/releases/VERSIONING.md` |
| CHANGELOG-POLICY.md | `.ai/governance/releases/CHANGELOG-POLICY.md` |
| RELEASE-CHECKLIST.md | `.ai/governance/releases/RELEASE-CHECKLIST.md` |
| Wave 4 Changelog | `.ai/governance/releases/WAVE-4-CHANGELOG.md` |
| Wave checkpoint | `.ai/governance/waves/WAVE-4-RELEASE-MANAGEMENT.md` |
| Lock tag | `engineering-governance-wave-4-locked` |

---

## Release lifecycle coverage

| Stage | Covered in |
|-------|-----------|
| Development | Wave checkpoint + Implementation Completion Protocol |
| Feature Complete | Wave checkpoint |
| Validation | `npm test` · `npm run ci:governance` |
| Governance Review | Wave checkpoint + P0-B release record |
| Release Candidate | RELEASE-PROCESS.md § RC Types |
| Governance Evidence | RELEASE-CHECKLIST.md § Evidence Artifact |
| Tag | RELEASE-CHECKLIST.md § Tag Applied |
| RELEASED | RELEASE-CHECKLIST.md § Final Verification |

---

## Versioning coverage

| Decision | Covered in |
|----------|-----------|
| Version format | VERSIONING.md § Version Format |
| Phase-based versioning | VERSIONING.md § Phase-based versioning |
| When to increment (MAJOR/MINOR/PATCH) | VERSIONING.md § When to Increment |
| Breaking change handling | VERSIONING.md § Breaking Change Handling |
| Pre-release convention | VERSIONING.md § Pre-release Convention |
| Wave tag convention | VERSIONING.md § Wave Tag Convention |

---

## Changelog coverage

| Decision | Covered in |
|----------|-----------|
| What changes must appear | CHANGELOG-POLICY.md § What Changes Must Appear |
| Six categories | CHANGELOG-POLICY.md § Changelog Categories |
| Format per entry | CHANGELOG-POLICY.md § Format |
| Audience mapping | CHANGELOG-POLICY.md § Audience |
| Evidence linking | CHANGELOG-POLICY.md § Link to Commits and Evidence |
| Changelog location | CHANGELOG-POLICY.md § Changelog Location |

---

## Non-goals verification

| Non-goal | Verified |
|----------|---------|
| Application source modified | ✅ no `src/` in Wave 4 |
| Auth / authorization changed | ✅ none |
| CI pipeline changed | ✅ no `ci.yml` / `package.json` script changes |
| Permission model changed | ✅ none |
| Repository structure redesign | ✅ only `.ai/governance/releases/` added |

---

## Validation output

```bash
npm test                 # 88/88 PASS
npm run ci:governance    # PASS
```

---

## Decision

Wave 4 complete. Formal release lifecycle, versioning policy, changelog policy, and release checklist are now governance-artifact-classified. Every future release can now be evaluated against an objective, auditable standard.
