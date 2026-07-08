---
id: ENGINEERING-GOVERNANCE
phase: 04-proof-of-platform
stage: forge-intent
status: Draft — pending owner approval
owner: Ontorata
workload: Engineering Governance
evidence_package: engineering-governance
constitution:
  - Internal Proof Before Public Capability
  - Documentation Is Engineering Artifact
dependencies:
  - P0-A-IDENTITY-FOUNDATION
  - EXECUTION-CONTRACT
baseline:
  branch: main
  commit: 2a57647
  tag: identity-foundation-p0-a-complete
forge_branch: forge/engineering-governance
updated: 2026-07-08
---

# Engineering Governance — Forge Intent (P0-B)

| Field | Value |
|-------|-------|
| **Status** | **Draft** — formally opens after P0-A remote sync succeeds |
| **Slug** | `engineering-governance` |
| **Phase** | 4 — Proof of Platform |
| **Category** | Must Prove (operational foundation) |
| **Baseline** | `main` @ `2a57647` · tag `identity-foundation-p0-a-complete` |
| **Target release artifact** | `.ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md` |
| **Evidence package** | `.ai/reviews/engineering-governance/` |

Parent: [FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md) · [EXECUTION-CONTRACT.md](../../phases/04-proof-of-platform/EXECUTION-CONTRACT.md)

**Gate before Isolate:** P0-A distribution status = **RELEASED** (remote `main` + tags verified).

---

## Problem

Identity Foundation (P0-A) locked the trust boundary for tenant, permission, and transport parity. As Ontorata/Ratary adds modules, contributors, AI agents, and deployment surfaces, engineering discipline must scale **without** relying on individual memory or ad-hoc review.

P0-B is **not feature development**. It is operational foundation: enforceable rules, CI gates, release discipline, migration ownership, and constitution extensions so every change — human or AI — leaves auditable evidence.

---

## Objective

Make Ontorata/Ratary develop with **governance that survives scale**:

```
Change (human or AI)
        ↓
Implementation
        ↓
Evidence + documentation sync
        ↓
Governance review
        ↓
Release candidate → tag → production
```

Success = all P0-B acceptance gates pass with evidence; workload dogfood can run at production scale on Ratary organizational memory.

---

## Constraints (constitution / ADR)

| Constraint | Source |
|------------|--------|
| Internal Proof Before Public Capability | Constitution |
| Documentation is engineering artifact | P0-B principle |
| Security boundary > convenience | P0-B principle |
| Transport is not a permission boundary | P0-A locked · Wave 4 |
| Tenant isolation mandatory | ADR-012 · P0-A |
| Auth identity ≠ AI identity | ADR-007 · P0-A |
| Repository wins on conflict vs Ratary recall | Session bootstrap |
| No agent runtime in `src/` | Agent Forge constitution |

**ADR enforcement scope (P0-B):** changes affecting identity, tenant, permission, data ownership, or transport boundary **require ADR** before merge.

---

## Decision

Implement P0-B as six governance waves on branch `forge/engineering-governance`, baseline P0-A merge. No product features in scope.

Execution order after intent approval:

```
remote sync P0-A verified
        ↓
forge-isolate (forge/engineering-governance)
        ↓
forge-blueprint
        ↓
forge-execute (waves 1–6)
        ↓
forge-prove + evidence package
        ↓
forge-land → tag → P0-B release record
```

---

## Scope

### 1. ADR enforcement

**Target layout** (governance mirror under `.ai/`):

```
.ai/core/architecture/
├── ADR-0001-identity-boundary.md
├── ADR-0002-tenant-isolation.md
├── ADR-0003-authorization-model.md
└── ADR-0004-transport-parity.md
```

**Rule:** PRs touching identity, tenant, permission, data ownership, or transport boundary must reference an accepted ADR (new or amended). CI / review checklist enforces linkage.

**Note:** Canonical ADR index remains `docs/architecture/governance/adr-index.md`. P0-B ADRs codify P0-A locked decisions and link to existing ADRs (006, 007, 012, 014) where applicable — not duplicate numbering chaos.

---

### 2. CI governance gate

**Minimum PR pipeline:**

```
Pull Request
        ↓
Governance Check
        ├── test suite (npm test)
        ├── identity suite (npm run test:identity)
        ├── e2e suite (npm run test:e2e)
        ├── architecture validation (script or lint rule)
        ├── migration check (when schema/migrations change)
        ├── permission contract check (identity tests / contract file)
        └── documentation check (ci:docs-impact → fail on structural drift)
        ↓
Merge Allowed
```

**Baseline:** extend `.github/workflows/ci.yml` — requires `workflow` OAuth scope on push (same blocker as P0-A remote sync).

---

### 3. AI engineering governance

Because Cursor / AI agents implement changes, enforce:

```
AI Change → Implementation → Evidence Update → Governance Review → Commit
```

**Forbidden:**

```
code changed → commit → forgot documentation
```

**Artifacts:**

- Cursor rule or Agent Forge skill alignment with Implementation Completion Protocol
- PR template / checklist: documentation impact categories mandatory
- Evidence path: `.ai/reviews/engineering-governance/` per change class

---

### 4. Release process

**Standard flow:**

```
Development → Feature Complete → Validation → Governance Review
        → Release Candidate → Tag → Production
```

**Artifacts under** `.ai/governance/releases/`:

| File | Purpose |
|------|---------|
| `RELEASE-PROCESS.md` | RC → tag → remote verify → RELEASED |
| `VERSIONING.md` | Tag naming · semver for governance milestones |
| `CHANGELOG-POLICY.md` | What belongs in changelog vs ADR vs evidence |

P0-A release record becomes template for P0-B lock.

---

### 5. Migration governance

Identity Foundation established tenant boundary. Every schema/data migration must include:

| Element | Required |
|---------|----------|
| Migration ownership | Named owner in migration header or ADR |
| Backward compatibility rule | Document break / compat window |
| Rollback plan | Down migration or operational rollback steps |
| Verification | Test or script evidence in PR |

**Model:**

```
Migration
   ├── schema change
   ├── migration script
   ├── rollback
   └── verification
```

---

### 6. Repository constitution extensions

Add under `.ai/core/constitution/`:

| File | Principles |
|------|------------|
| `ENGINEERING-PRINCIPLES.md` | Security > convenience; docs = artifacts; proof before public |
| `SECURITY-BOUNDARY.md` | Tenant isolation; transport ≠ permission; auth at boundary |
| `CHANGE-MANAGEMENT.md` | ADR triggers; RC vs RELEASED; AI completion protocol |

Mirror summaries to `docs/architecture/governance/` when public behavior changes.

---

## Acceptance gate (P0-B complete)

| Gate | Requirement |
|------|-------------|
| ADR system | Four P0-B ADRs accepted + enforcement checklist |
| CI governance | test + test:identity + test:e2e + docs/arch/migration/permission checks |
| AI workflow governance | Rule/skill + PR checklist + completion protocol wired |
| Release process | RELEASE-PROCESS · VERSIONING · CHANGELOG-POLICY |
| Migration policy | Documented + CI hook or review gate |
| Repository constitution | Three constitution extension files |
| Evidence artifact | `.ai/reviews/engineering-governance/` acceptance package |

All gates ✅ before tag `engineering-governance-p0-b-complete` and lock.

---

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Skip P0-B; dogfood immediately | Doc/CI drift; AI agents skip evidence |
| ADR-only without CI | Not enforceable at scale |
| External tool (Notion) for governance | Repository must remain source of truth |
| Fold P0-B into P0-A | Different milestone; P0-A is trust boundary proof |

---

## Impact (layers, ports, tests)

| Layer | Expected touch |
|-------|----------------|
| `.github/workflows/` | CI jobs · governance gate |
| `.ai/core/` | ADRs · constitution · governance releases |
| `.cursor/rules/` | AI completion enforcement |
| `package.json` | Scripts: `ci:governance`, validation helpers |
| `docs/architecture/governance/` | Public mirror of key policies |
| Tests | Contract tests for permission names; migration smoke if added |

**No changes** to P0-A locked authorization flow unless ADR-amended.

---

## Evidence deliverables

On completion:

```
.ai/reviews/engineering-governance/
├── acceptance-test.md
├── ci-governance-proof.md
├── adr-enforcement-proof.md
├── release-process-proof.md
├── migration-policy-proof.md
├── ai-workflow-proof.md
└── decision.md
```

---

## Open questions

| # | Question | Default if unresolved |
|---|----------|----------------------|
| 1 | `ci:docs-impact` warning → error in P0-B? | Fail PR on structural doc drift |
| 2 | ADR-000x vs existing ADR-00x numbering | P0-B files use 0001–0004 slug; index cross-links |
| 3 | Ratary ingest at production scale | After P0-B evidence passes |
| 4 | Public `.ai/` on origin | Continue `git add -f` until mirror policy changes |

---

## Related

- [P0-A-IDENTITY-FOUNDATION.md](../../governance/releases/P0-A-IDENTITY-FOUNDATION.md) — prerequisite · RC until remote sync
- [identity-foundation-intent.md](./identity-foundation-intent.md) — completed P0-A intent
- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)
- [ENGINEERING-CONSTITUTION.md](../../core/constitution/ENGINEERING-CONSTITUTION.md)
