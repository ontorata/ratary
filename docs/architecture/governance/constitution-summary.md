# Ontorata Engineering — Constitution Summary

**Canonical:** `.ai/core/constitution/ENGINEERING-CONSTITUTION.md`  
**Extensions:** `.ai/core/constitution/ENGINEERING-PRINCIPLES.md` · `SECURITY-BOUNDARY.md` · `CHANGE-MANAGEMENT.md` · `P0-BASELINE-CHANGE-POLICY.md`  
**Structure:** Frozen 2026-07-08 — **structure frozen, evolution allowed**  
**Phase:** 4 — Proof of Platform (Phases 0–3 complete)

**Mode:** Problem → Workload → Evidence → Trust → Scale

---

## P0-B Engineering Principles (Wave 6)

Five non-negotiable principles established by P0-B Engineering Governance:

| P# | Principle | Rule | Enforcement |
|----|-----------|------|------------|
| P1 | Security over convenience | No feature justifies security trade-off | ADR-0003 · `ci:permission-contract` |
| P2 | Documentation is engineering output | Code without docs is incomplete | `ci:docs-impact` (fail) |
| P3 | Evidence before completion | Merge ≠ Done; completion requires evidence package | `.ai/reviews/` · Ratary sync |
| P4 | Tenant isolation is mandatory | `owner_id` is not optional | `test:identity` · ADR-0002 |
| P5 | Architecture before implementation | Significant changes require ADR | `ci:adr-impact` · `ARCHITECTURE-CHANGE-MAP` |

**Security boundary (non-negotiable):** Auth at boundary · transport ≠ authorization · `organizationId` + `workspaceId` mandatory before data-plane access.

**Change lifecycle:** Proposal → Impact Analysis → ADR (if needed) → Implementation → CI Gate → Evidence → Release

**P0 baseline (frozen):** P0-A + P0-B RELEASED — changes only via critical/security/compatibility fix or new governance milestone. Feature work on P1+.

**Phase shift (2026-07-08):** P0 = build platform ✅ · **P1 = use platform** (P1-A Org Memory Dogfood proposed)

**CI governance gate (enforced):** `npm test` · `test:identity` · `test:e2e` · `ci:adr-impact` · `ci:docs-impact` · `ci:permission-contract`

---

## Existing content below preserved

**Contract:** `phases/04-proof-of-platform/EXECUTION-CONTRACT.md` (locked)

**Chain:** Problem → Workload → Platform Capability → Evidence → Trust → Scale

**Balance:** Governance + execution speed + evidence feedback (not more governance)

**Implementation agent:** Cursor syncs code + docs + evidence per [IMPLEMENTATION-COMPLETION-PROTOCOL.md](.ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)

**Cursor rule:** `.cursor/rules/ontorata-execution-governance.mdc`

**Bootstrap:** `.ai/bootstrap/` · **Last known state:** `.ai/sessions/CURRENT.md`

> The architecture earned the right to be tested. Now the market gets to decide its value.

---

## DNA (do not lose)

Open ecosystem · Enterprise ownership · AI operating layer · Governed execution

**Positioning:** Not "make AI smarter" — **make organizations own, run, and grow their own AI.**

---

## Maturity snapshot

| Area | Progress |
|------|----------|
| Foundation · Governance · Architecture | 100% |
| **Validation (Phase 4)** | In progress |

> **The next milestone is not a release. It is a proof.**

---

## Principle (Phase 4)

> Architecture earns trust. Usage earns validation.

**Permanent constitution principle:** **Internal Proof Before Public Capability** — no platform capability is production-ready until Ontorata operates it internally with evidence, metrics, audit trail, and evaluation. Feature ≠ capability · implementation ≠ completion · completion = evidence.

**UX:** Internal complexity ≠ user complexity — simple outside, powerful inside.

Gate: **Does this help one organization run a valuable production AI workload on Ratary?** If no → backlog.

**Architecture predicts. Usage reveals.**

**Evidence Loop:** Hypothesis → Build → Run → Measure → Learn → Improve

**Next milestone:** first production workload by a real external organization.

**First success (Phase 4):** one external org · one valuable production AI workload · **30+ days** · measured business value.

**Guardrails:** ownership · Ontory direction · quality over demo count · evidence language.

Private: `phases/04-proof-of-platform/EXECUTION-CONTRACT.md`

> Before Phase 4, Ontorata was designed with discipline. After Phase 4, it must be trusted through evidence.

Weekly rule: Evidence · Usage · or Learning must increase.

---

## Metrics

| Metric | Role |
|--------|------|
| **Trusted Production Workloads Running** | North Star — trust, not volume |
| `production_workloads` | Count of trusted workloads (subset of above) |
| `production_organizations` | Proof — platform effect |
| `production_users` · `production_documents` · `production_queries` · `production_memory` · `production_recall_accuracy` | Dogfood observability |
| **TTFW** | Time to First Production Workload — target < 1h |
| Adoption Quality | daily use · retention · measurable value · auditability |

A workload counts as **trusted** when used daily, producing measurable value, documented, auditable, observable, and improving organizational quality over time.

---

## Three proofs

1. **Technical** — Ratary as execution layer (isolation, OTel, eval)
2. **Product** — non-builder ships a workload via Studio
3. **Business** — external org · paid signal · partner

---

## Authority (technical)

Constitution → ADR → Policies → Blueprint → Standards → Implementation

---

## Related

- [definition-of-done.md](./definition-of-done.md)
- [GOVERNANCE-STATUS.md](./GOVERNANCE-STATUS.md)
