# Wave 4 Changelog — Release Management

| Field | Value |
|-------|-------|
| **Wave** | 4 — Release Management |
| **Tag** | `engineering-governance-wave-4-locked` |
| **Date** | 2026-07-08 |
| **Baseline** | `engineering-governance-wave-3-locked` |

---

## [engineering-governance-wave-4-locked] — 2026-07-08

### Added

- **Release Management governance artifacts** (`.ai/governance/releases/`)
  - `RELEASE-PROCESS.md` — formal 8-stage release lifecycle with ownership, approval gate, and rollback decision
  - `VERSIONING.md` — semantic versioning rules for governance and application releases; phase-based versioning (v0.x for Phase 4, v1.x for Phase 5+); wave tag convention
  - `CHANGELOG-POLICY.md` — six-category changelog (Added / Changed / Fixed / Security / Deprecated / Removed); audience mapping; evidence linking requirements
  - `RELEASE-CHECKLIST.md` — step-by-step RC → RELEASED checklist; release type variants (governance wave / application / governance artifact); rollback checklist
  - Evidence: `engineering-governance-wave-4-locked` · Wave 4 proof artifact

- **Wave 4 checkpoint** (`.ai/governance/waves/WAVE-4-RELEASE-MANAGEMENT.md`)
  - Documents 8-stage lifecycle, versioning model, and changelog categories
  - Links to all four release artifacts
  - Evidence: `engineering-governance-wave-4-locked`

- **Wave 4 evidence** (`.ai/reviews/engineering-governance/release-management-proof.md`)
  - Maps acceptance gate to artifact paths
  - Coverage matrix for lifecycle, versioning, and changelog
  - Non-goals verification
  - Evidence: `engineering-governance-wave-4-locked`

---

## Internal governance decisions

| Decision | Resolution |
|-----------|-----------|
| Pre-release tags on governance artifacts | Allowed (alpha/beta/rc); cleared before lock tag |
| Automated version bumping | Not implemented — manual per VERSIONING.md |
| Auto-generated changelog | Not implemented — manual curation for governance quality |
| Governance wave version aliasing | Wave lock tag + semantic version tag (both applied) |

---

## Related

- [RELEASE-PROCESS.md](./RELEASE-PROCESS.md)
- [VERSIONING.md](./VERSIONING.md)
- [CHANGELOG-POLICY.md](./CHANGELOG-POLICY.md)
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [WAVE-4-RELEASE-MANAGEMENT.md](../waves/WAVE-4-RELEASE-MANAGEMENT.md)
- [release-management-proof.md](../../reviews/engineering-governance/release-management-proof.md)
