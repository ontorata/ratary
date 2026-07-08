---
id: ENGINEERING-GOVERNANCE
phase: 04-proof-of-platform
stage: forge-isolate
status: Active
owner: Ontorata
workload: Engineering Governance
evidence_package: engineering-governance
constitution:
  - Internal Proof Before Public Capability
  - Documentation Is Engineering Artifact
dependencies:
  - P0-A-IDENTITY-FOUNDATION
  - engineering-governance-intent
updated: 2026-07-08
---

# Engineering Governance — Forge Isolate (P0-B)

| Field | Value |
|-------|-------|
| **Branch** | `forge/engineering-governance` (from `main` @ P0-A RELEASED) |
| **Baseline** | ✅ **88/88 tests passed** (vitest, 2026-07-08) |
| **Intent** | [engineering-governance-intent.md](./engineering-governance-intent.md) — **Approved** |
| **Evidence** | `.ai/reviews/engineering-governance/` (create during waves) |
| **Prerequisite** | P0-A RELEASED — tag `identity-foundation-p0-a-complete` @ `2a57647` on origin |

---

## Scope boundary

### In scope (P0-B operational foundation)

| Wave | Focus | Deliverable |
|------|-------|-------------|
| 1 | ADR Enforcement | ADR-0001–0004 + PR linkage rule |
| 2 | CI Governance Gate | test · test:identity · test:e2e · arch · migration · permission · docs |
| 3 | AI Engineering Workflow | Implementation → evidence → review → commit |
| 4 | Release Management | RELEASE-PROCESS · VERSIONING · CHANGELOG-POLICY |
| 5 | Migration Governance | ownership · compat · rollback · verification |
| 6 | Engineering Constitution | ENGINEERING-PRINCIPLES · SECURITY-BOUNDARY · CHANGE-MANAGEMENT |

Each wave follows proven pattern:

```
Implementation → Tests → Evidence (.ai) → Governance checkpoint → Lock tag
```

### Out of scope

Product features · Marketplace · Billing · Cloud scale · Identity boundary changes (P0-A locked) · MCP stdio multi-tenant rewrite · RBAC UI

---

## Baseline audit (post P0-A)

| Component | Status | P0-B action |
|-----------|--------|-------------|
| Identity + tenant boundary | ✅ P0-A locked | No changes without ADR |
| CI workflow (`.github/workflows/ci.yml`) | ⚠️ lint/build only | Add governance gate jobs |
| `ci:docs-impact` | ⚠️ warning on PR | Promote to fail on structural drift |
| ADR index (`docs/architecture/governance/`) | ✅ exists | Add P0-B ADR-0001–0004 mirror |
| Release records | ✅ P0-A template | Extend release process docs |
| AI completion protocol | ✅ `.ai/core/governance/` | Wire to Cursor rules + PR template |
| Migration scripts | ✅ identity migrations exist | Formalize ownership + rollback policy |

**Conclusion:** Runtime trust boundary is proven (P0-A). P0-B adds **enforceable governance** so scale does not erode discipline.

---

## Wave structure (blueprint input)

| Wave | Lock tag (target) | Governance checkpoint |
|------|-------------------|----------------------|
| 1 ADR Enforcement | `engineering-governance-wave-1-locked` | `.ai/governance/waves/WAVE-1-ADR-ENFORCEMENT.md` |
| 2 CI Governance Gate | `engineering-governance-wave-2-locked` | `.ai/governance/waves/WAVE-2-CI-GOVERNANCE.md` |
| 3 AI Workflow Governance | `engineering-governance-wave-3-locked` | `.ai/governance/waves/WAVE-3-AI-WORKFLOW.md` |
| 4 Release Management | `engineering-governance-wave-4-locked` | `.ai/governance/waves/WAVE-4-RELEASE-MANAGEMENT.md` |
| 5 Migration Governance | `engineering-governance-wave-5-locked` | `.ai/governance/waves/WAVE-5-MIGRATION-GOVERNANCE.md` |
| 6 Engineering Constitution | `engineering-governance-wave-6-locked` | `.ai/governance/waves/WAVE-6-CONSTITUTION.md` |

**Final lock:** tag `engineering-governance-p0-b-complete`

---

## Exit criteria (forge-isolate → forge-blueprint gate)

| Question | Answer |
|----------|--------|
| **What to build?** | Six governance waves — no product features |
| **What NOT to build?** | Out-of-scope list above |
| **How to prove correct?** | P0-B acceptance gate in intent doc — all ✅ before final tag |
| **Baseline green?** | ✅ 88/88 on `forge/engineering-governance` |

**Ready for forge-blueprint:** ✅ Complete — [engineering-governance-plan.md](../blueprints/engineering-governance-plan.md) proposed.

**Ready for forge-execute:** 🔒 Locked — owner blueprint approval required.

---

## Forge branch

```bash
git checkout forge/engineering-governance   # from main @ P0-A RELEASED
npm test   # baseline: 88/88 passed (2026-07-08)
```

---

## Related

- [engineering-governance-intent.md](./engineering-governance-intent.md)
- [P0-A-IDENTITY-FOUNDATION.md](../../governance/releases/P0-A-IDENTITY-FOUNDATION.md)
- [P0-B-ENGINEERING-GOVERNANCE.md](../../governance/releases/P0-B-ENGINEERING-GOVERNANCE.md)
- [FORGE-METADATA.md](../../workflow/FORGE-METADATA.md)
