---
id: P0-B-ENGINEERING-GOVERNANCE
phase: 04-proof-of-platform
stage: blueprint
status: proposed
owner: Ontorata
workload: Engineering Governance
evidence_package: engineering-governance
baseline_tag: identity-foundation-p0-a-complete
baseline_commit: 2a57647
branch: forge/engineering-governance
constitution:
  - Internal Proof Before Public Capability
  - Documentation Is Engineering Artifact
dependencies:
  - engineering-governance-intent
  - engineering-governance-isolate
  - P0-A-IDENTITY-FOUNDATION
updated: 2026-07-08
---

# Blueprint: Engineering Governance (P0-B)

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — waiting owner approval before `forge-execute` |
| **Branch** | `forge/engineering-governance` |
| **Baseline** | P0-A RELEASED · tag `identity-foundation-p0-a-complete` @ `2a57647` · tests **88/88** |
| **Intent** | [engineering-governance-intent.md](../drafts/engineering-governance-intent.md) — Approved |
| **Isolate** | [engineering-governance-isolate.md](../drafts/engineering-governance-isolate.md) — Active |
| **Release record** | [P0-B-ENGINEERING-GOVERNANCE.md](../../governance/releases/P0-B-ENGINEERING-GOVERNANCE.md) |
| **Evidence** | `.ai/reviews/engineering-governance/` |

---

## 1. Objective

Build an **operational governance layer** so Ontorata/Ratary can scale with:

- multiple engineers
- AI-assisted development (Cursor agents)
- multiple repositories (Ratary · Studio · Auth)
- multiple deployment environments
- auditability and controlled architectural evolution

**Principle:** Governance must be an **operating system**, not documentation alone.

**Mindset:** codify P0-A locked decisions · enforce via CI · wire AI workflow · no product features.

---

## 2. Current state mapping

| Component | Existing | P0-B change |
|-----------|----------|-------------|
| P0-A identity boundary | ✅ RELEASED | Reference only — ADRs codify, do not alter behavior |
| ADR index | ✅ `docs/architecture/governance/adr-index.md` | Add P0-B ADR-0001–0004 + enforcement linkage |
| `CHANGE-GATING.md` | ✅ `.ai/core/governance/` | Extend triggers for identity/tenant/permission/transport |
| CI (`.github/workflows/ci.yml`) | ⚠️ lint · build · docker | Add governance job: test · identity · e2e · checks |
| `ci:docs-impact` | ⚠️ warning | Promote to **fail** on structural doc drift |
| PR template | ✅ docs-impact checklist | Add ADR reference + AI evidence sections |
| Release records | ✅ P0-A template | Standardize RELEASE-PROCESS · VERSIONING · CHANGELOG-POLICY |
| AI completion protocol | ✅ `.ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md` | Operationalize in `.ai/workflows/` + Cursor rules |
| Migration scripts | ✅ `src/db/migrations.ts` | Formalize ownership · rollback · verification policy |
| Constitution | ✅ `ENGINEERING-CONSTITUTION.md` | Add focused extension docs (principles · security · change) |

**Repo note:** `.ai/` gitignored on public `origin` — use `git add -f` per maintainer workflow.

---

## 3. Execution waves

Each wave produces:

```
Implementation commit → Test evidence → .ai artifact → Governance checkpoint → Lock tag
```

Lock tag format: `engineering-governance-wave-{n}-locked`  
Final tag: `engineering-governance-p0-b-complete`

---

### Wave 1 — ADR Enforcement

**Goal:** Architectural decisions are mandatory, reviewable artifacts.

**Gate:**

| Requirement | Target |
|-------------|--------|
| ADR format | `.ai/core/architecture/ADR-TEMPLATE.md` |
| P0-A codification ADRs | ADR-0001–0004 (see paths below) |
| ADR index | `.ai/core/architecture/ADR-INDEX.md` + public mirror update |
| Review rule | `.ai/core/governance/CHANGE-GATING.md` |
| Change impact mapping | `.ai/core/governance/ARCHITECTURE-CHANGE-MAP.md` (**new**) |
| Review evidence | `.ai/reviews/engineering-governance/adr-enforcement-proof.md` |

**ADR paths** (canonical under `.ai/core/architecture/`):

| ADR | File | Codifies |
|-----|------|----------|
| ADR-0001 | `ADR-0001-identity-boundary.md` | Auth identity · owner · org context (P0-A) |
| ADR-0002 | `ADR-0002-tenant-isolation.md` | Org A ≠ Org B · workspace binding |
| ADR-0003 | `ADR-0003-authorization-model.md` | Permission evaluation · shared boundary service |
| ADR-0004 | `ADR-0004-transport-parity.md` | REST ↔ MCP remote · transport ≠ permission |

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **1.1** | `.ai/core/architecture/ADR-TEMPLATE.md` | Standard ADR sections: Status · Context · Decision · Consequences · Evidence | manual review |
| **1.2** | `ADR-0001` … `ADR-0004` | Write accepted ADRs referencing P0-A evidence + existing ADR-006/007/012 | manual review |
| **1.3** | `.ai/core/architecture/ADR-INDEX.md` | Index P0-B ADRs; cross-link to `docs/architecture/governance/adr-index.md` | — |
| **1.4** | `docs/architecture/governance/adr-index.md` | Public mirror: add P0-B identity ADR section with links | — |
| **1.5** | `.ai/core/governance/CHANGE-GATING.md` | Require ADR for changes affecting identity · tenant · permission · data ownership · transport | — |
| **1.6** | `.ai/core/governance/ARCHITECTURE-CHANGE-MAP.md` | Map src paths → ADR triggers (auth · scope · transport · db) | — |
| **1.7** | `.github/pull_request_template.md` | Add **ADR reference** field + checkbox when architecture paths touched | — |
| **1.8** | `scripts/ci/adr-impact-check.mjs` (**new**) | Fail PR if `src/auth/` · `src/scope/` · `src/transport/` · migration paths change without ADR file in diff | `node scripts/ci/adr-impact-check.mjs origin/main` |
| **1.9** | `package.json` | Add `"ci:adr-impact": "node scripts/ci/adr-impact-check.mjs"` | script runs |
| **1.10** | `.ai/governance/waves/WAVE-1-ADR-ENFORCEMENT.md` | Checkpoint: scope · commits · gate table | — |
| **1.11** | `.ai/reviews/engineering-governance/adr-enforcement-proof.md` | Evidence: ADR list · sample PR rule · script output | — |

**Wave 1 verify:** `npm run ci:adr-impact` (local dry-run) + manual ADR review

**Done when:** all four ADRs accepted · index updated · CI script detects missing ADR on auth/scope/transport diff.

**Lock tag:** `engineering-governance-wave-1-locked`

---

### Wave 2 — CI Governance Gate

**Goal:** CI blocks merge until governance minimum passes.

**Pipeline:**

```
Pull Request → Governance CI → Merge Allowed
                  ├── npm test
                  ├── npm run test:identity
                  ├── npm run test:e2e
                  ├── npm run ci:adr-impact
                  ├── npm run ci:migration-check (Wave 5 script; stub OK in W2)
                  ├── npm run ci:permission-contract
                  └── npm run ci:docs-impact (fail mode)
```

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **2.1** | `.github/workflows/ci.yml` | Add `governance` job: Node 24 · `npm ci` · run gate commands | CI green on PR |
| **2.2** | `package.json` | Add `"ci:governance": "npm test && npm run test:identity && npm run test:e2e && npm run ci:adr-impact && npm run ci:docs-impact && npm run ci:permission-contract"` | local run |
| **2.3** | `scripts/ci/docs-impact-check.mjs` | Add `--fail` flag; exit 1 when code changes without doc touch | `npm run ci:docs-impact` |
| **2.4** | `scripts/ci/permission-contract-check.mjs` (**new**) | Assert permission strings in `authorization-boundary.ts` match contract file | `npm run ci:permission-contract` |
| **2.5** | `.ai/core/governance/PERMISSION-CONTRACT.md` (**new**) | Canonical list: `memory.read` · `memory.write` · `workspace.read` · `workspace.manage` · `organization.manage` | matches P0-A |
| **2.6** | `scripts/ci/migration-check.mjs` (**new**, stub) | Exit 0 if no migration files changed; placeholder for Wave 5 | runs in CI |
| **2.7** | `.ai/governance/waves/WAVE-2-CI-GOVERNANCE.md` | Checkpoint + CI job screenshot/log reference | — |
| **2.8** | `.ai/reviews/engineering-governance/ci-governance-proof.md` | Evidence: workflow YAML · local `ci:governance` output | — |

**Wave 2 verify:** `npm run ci:governance` — **88/88** minimum unchanged

**Done when:** PR template governance job runs all gate commands; docs-impact fails on intentional drift test.

**Lock tag:** `engineering-governance-wave-2-locked`

---

### Wave 3 — AI Engineering Workflow Governance

**Goal:** AI-assisted changes cannot skip evidence or documentation.

**Rule:**

```
AI Implementation → Code → Test Evidence → Documentation → Governance Review → Commit
```

**Prevent:** code changed → commit → missing evidence

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **3.1** | `.ai/workflows/AI-DEVELOPMENT-PROTOCOL.md` | Agent + human flow aligned with Implementation Completion Protocol | manual review |
| **3.2** | `.ai/workflows/CHANGE-EVIDENCE.md` | Required evidence types per change class (code · arch · migration · release) | — |
| **3.3** | `.ai/workflows/SESSION-HANDOFF.md` | Ratary MCP handoff + `.ai/sessions/CURRENT.md` audit trail rules | — |
| **3.4** | `.ai/workflows/README.md` | Index workflows; link from `.ai/INDEX.md` | — |
| **3.5** | `.github/pull_request_template.md` | Add **AI-assisted change** section: evidence path · completion report link | — |
| **3.6** | `.cursor/rules/ontorata-execution-governance.mdc` | Cross-link `.ai/workflows/AI-DEVELOPMENT-PROTOCOL.md` (minimal diff) | — |
| **3.7** | `.ai/governance/waves/WAVE-3-AI-WORKFLOW.md` | Checkpoint | — |
| **3.8** | `.ai/reviews/engineering-governance/ai-workflow-proof.md` | Evidence: sample completion report · checklist mapping | — |

**Wave 3 verify:** PR template renders AI section; workflow docs reference completion protocol

**Done when:** three workflow artifacts exist · PR template enforces evidence path · Cursor rule points to protocol.

**Lock tag:** `engineering-governance-wave-3-locked`

---

### Wave 4 — Release Management

**Goal:** Standard release lifecycle (proven by P0-A).

**Flow:**

```
Development → Feature Complete → Validation → Governance Review
        → Release Candidate → Tag → Released (remote verified)
```

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **4.1** | `.ai/governance/releases/RELEASE-PROCESS.md` | RC vs RELEASED · remote verification · wave lock immutability | manual review |
| **4.2** | `.ai/governance/releases/VERSIONING.md` | Tag naming: `{slug}-p0-{x}-complete` · wave lock tags | — |
| **4.3** | `.ai/governance/releases/CHANGELOG-POLICY.md` | What goes in CHANGELOG vs ADR vs evidence package | — |
| **4.4** | `.ai/governance/releases/README.md` | Link process docs; P0-A as reference example | — |
| **4.5** | `docs/architecture/governance/release-process-summary.md` (**new**, optional) | Public mirror of RELEASE-PROCESS essentials | — |
| **4.6** | `.ai/governance/waves/WAVE-4-RELEASE-MANAGEMENT.md` | Checkpoint | — |
| **4.7** | `.ai/reviews/engineering-governance/release-process-proof.md` | Evidence: P0-A walkthrough mapped to RELEASE-PROCESS | — |

**Wave 4 verify:** RELEASE-PROCESS.md documents P0-A RC → RELEASED gate accurately

**Done when:** three release policy artifacts exist · P0-A release record cited as exemplar.

**Lock tag:** `engineering-governance-wave-4-locked`

---

### Wave 5 — Migration Governance

**Goal:** Database and data changes are owned, verifiable, and reversible.

**Required per migration:**

```
Migration Proposal → Schema Change → Script → Verification → Rollback Plan
```

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **5.1** | `.ai/migrations/MIGRATION-GOVERNANCE.md` | Policy: ownership · backward compat · rollback · evidence | manual review |
| **5.2** | `.ai/migrations/templates/migration-record.md` | Template for per-migration record | — |
| **5.3** | `.ai/migrations/templates/rollback-plan.md` | Rollback steps template | — |
| **5.4** | `.ai/migrations/templates/verification-report.md` | Post-migration verification checklist | — |
| **5.5** | `.ai/migrations/records/README.md` | Where live records go; example from P0-A identity migrations | — |
| **5.6** | `scripts/ci/migration-check.mjs` | **Complete** Wave 2 stub: require record file when `src/db/migrations.ts` or `schema.sql` changes | `npm run ci:migration-check` |
| **5.7** | `package.json` | Wire `"ci:migration-check"` | — |
| **5.8** | `.ai/governance/waves/WAVE-5-MIGRATION-GOVERNANCE.md` | Checkpoint | — |
| **5.9** | `.ai/reviews/engineering-governance/migration-policy-proof.md` | Evidence: sample record for existing migration · CI behavior | — |

**Wave 5 verify:** `npm run ci:migration-check` fails without record when migration paths change

**Done when:** policy + templates + CI enforcement active.

**Lock tag:** `engineering-governance-wave-5-locked`

---

### Wave 6 — Engineering Constitution

**Goal:** Permanent repository principles beyond the full constitution.

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **6.1** | `.ai/core/constitution/ENGINEERING-PRINCIPLES.md` | Security > convenience · docs = artifacts · evidence before completion | manual review |
| **6.2** | `.ai/core/constitution/SECURITY-BOUNDARY.md` | Tenant isolation mandatory · transport ≠ authorization · auth at boundary | aligns P0-A |
| **6.3** | `.ai/core/constitution/CHANGE-MANAGEMENT.md` | ADR triggers · RC vs RELEASED · AI completion flow | cross-links Wave 1–5 |
| **6.4** | `docs/architecture/governance/constitution-summary.md` | Public mirror: add P0-B principle bullets | — |
| **6.5** | `.ai/core/constitution/ENGINEERING-CONSTITUTION.md` | Index link to three extension docs (minimal front-matter) | — |
| **6.6** | `.ai/governance/waves/WAVE-6-CONSTITUTION.md` | Checkpoint | — |
| **6.7** | `.ai/reviews/engineering-governance/acceptance-test.md` | P0-B completion gate table — all ✅ | — |
| **6.8** | `.ai/reviews/engineering-governance/decision.md` | Final decision record · ready for forge-land | — |

**Core principles (must appear):**

- Security boundary over convenience
- Tenant isolation is mandatory
- Transport cannot define authorization
- Documentation is engineering output
- Evidence before completion

**Wave 6 verify:** acceptance-test.md all gates ✅

**Done when:** three constitution extensions exist · public summary updated · acceptance package complete.

**Lock tag:** `engineering-governance-wave-6-locked`

---

## 4. P0-B completion criteria

| Gate | Evidence |
|------|----------|
| ADR enforcement | Wave 1 checkpoint + `adr-enforcement-proof.md` |
| CI governance | Wave 2 checkpoint + `ci-governance-proof.md` |
| AI workflow governance | Wave 3 checkpoint + `ai-workflow-proof.md` |
| Release process | Wave 4 checkpoint + `release-process-proof.md` |
| Migration governance | Wave 5 checkpoint + `migration-policy-proof.md` |
| Constitution | Wave 6 checkpoint + extension docs |
| Governance evidence | `.ai/reviews/engineering-governance/` complete |
| Final release checkpoint | `.ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md` → RELEASED |

**Final tag:** `engineering-governance-p0-b-complete`

---

## 5. Commit boundary

```
forge-blueprint (this document)
        │
        ▼
commit blueprint only          ← no src/ changes (this commit)
        │
        ▼
owner approves blueprint
        │
        ▼
forge-execute waves 1→6
        │
        ▼
one implementation commit per wave (recommended)
        │
        ▼
forge-land → tag → P0-B RELEASED
```

| Artifact | Git scope |
|----------|-----------|
| Blueprint | `.ai/designs/blueprints/engineering-governance-plan.md` |
| Governance waves | `.ai/governance/waves/WAVE-*` |
| CI enforcement | `.github/workflows/ci.yml` · `scripts/ci/*` · `package.json` |
| Workflows | `.ai/workflows/*` |
| Constitution | `.ai/core/constitution/*` |
| Proof | `.ai/reviews/engineering-governance/` |

---

## 6. Acceptance gate (before forge-execute)

> **If another developer reads this plan, can they implement P0-B without asking the maintainer?**

| Area | Self-contained? |
|------|-----------------|
| Objective | ✅ |
| Current state | ✅ Table |
| Tasks | ✅ 6 waves · paths · verify commands |
| Out of scope | ✅ In isolate doc |
| Lock tags | ✅ Per wave + final |
| DoD | ✅ Section 4 |
| Commit sequence | ✅ Section 5 |

**Forge execute status:** 🔒 **Locked** until owner approves this blueprint.

---

## 7. Parallelization

| Parallel-safe | Notes |
|---------------|-------|
| Wave 1 → 2 | Sequential — CI depends on adr-impact script |
| Wave 3 | Can draft alongside Wave 2 (docs only) |
| Wave 4 | Can draft alongside Wave 3 |
| Wave 5 | Depends on Wave 2 CI stub |
| Wave 6 | Must be last — summarizes all gates |

---

## 8. Recommended commit messages

```
docs(governance): wave 1 — ADR enforcement and architecture change map
ci(governance): wave 2 — governance gate job and contract checks
docs(governance): wave 3 — AI development workflow artifacts
docs(governance): wave 4 — release process and versioning policy
docs(governance): wave 5 — migration governance and CI check
docs(governance): wave 6 — engineering constitution extensions
docs(governance): P0-B evidence package and release record
```

---

## 9. Approval gate (current)

| Stage | Status |
|-------|--------|
| P0-B Forge Intent | ✅ Approved |
| P0-B Forge Isolate | ✅ Active (88/88 baseline) |
| P0-B Forge Blueprint | ⏳ **Proposed — waiting approval** |
| P0-B Forge Execute | 🔒 Locked |

**Next after approval:** Wave 1 — ADR Enforcement only. No Wave 2+ until Wave 1 lock tag.

---

## Related

- [engineering-governance-intent.md](../drafts/engineering-governance-intent.md)
- [engineering-governance-isolate.md](../drafts/engineering-governance-isolate.md)
- [P0-A-IDENTITY-FOUNDATION.md](../../governance/releases/P0-A-IDENTITY-FOUNDATION.md)
- [P0-B-ENGINEERING-GOVERNANCE.md](../../governance/releases/P0-B-ENGINEERING-GOVERNANCE.md)
- [FORGE-METADATA.md](../../workflow/FORGE-METADATA.md)
