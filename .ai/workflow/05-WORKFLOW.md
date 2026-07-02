# 05 — Development Workflow

**Status:** Permanent project standard.  
**Audience:** AI assistants and human maintainers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md). Pre-implementation analysis: §Pre-implementation analysis below.

---

# Purpose

Define the mandatory end-to-end development workflow for every change in this repository.

Establish non-skippable checkpoints from task intake through release so architecture is reviewed before code, quality gates block defective merges, and documentation stays synchronized with behavior.

Ensure AI assistants and humans follow the same sequence regardless of tool, model, or urgency.

---

# Scope

## Covered

- Workflow stages: Review → Design → Implementation → Testing → Documentation → Code Review → Merge → Release
- Mandatory checkpoints and stop conditions at each stage
- Architecture review gate before implementation
- Commit discipline and quality gates
- Completion and release criteria

## Not Covered

- Immutable rules and layer law → [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) – [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md)
- Line-level coding style → [02-CODING.md](../standards/02-CODING.md)
- Naming conventions → [03-NAMING.md](../standards/03-NAMING.md)
- ADR content and lifecycle policy → [../adr/POLICY.md](../../docs/adr/POLICY.md)
- Active task scope and definition of done → [../TASK_PROMPT.md](../TASK_PROMPT.md)
- User-facing operations → [../PANDUAN.md](../../docs/PANDUAN.md)

---

# Principles

1. **No code before design** — Architecture review completes before any source edit except analysis artifacts and Proposed ADRs.

2. **Stop on red** — A failed checkpoint blocks all downstream stages until resolved.

3. **One concern per commit** — Each commit is reviewable, revertible, and tied to a single intent.

4. **Evidence over claim** — Testing and quality gates verify completion; narrative alone is insufficient.

5. **Docs are deliverables** — Documentation updates are part of the workflow, not optional follow-up.

6. **Fail closed** — Ambiguity, missing ADR, or constitutional conflict halts the workflow.

7. **Minimal scope** — Implement the task prompt only; defer unrelated improvements.

8. **Traceability** — Structural commits reference ADR identifier; phase work references task prompt.

---

# Standards

## Workflow overview

```
┌──────────┐   ┌──────────┐   ┌────────────────┐   ┌──────────┐   ┌───────────────┐
│  REVIEW  │ → │  DESIGN  │ → │ IMPLEMENTATION │ → │ TESTING  │ → │ DOCUMENTATION │
└──────────┘   └──────────┘   └────────────────┘   └──────────┘   └───────────────┘
                     ↑                                      │
              ARCHITECTURE                           ┌──────────┐   ┌───────┐   ┌─────────┐
              REVIEW GATE                            │  CODE    │ → │ MERGE │ → │ RELEASE │
              (mandatory)                            │  REVIEW  │   └───────┘   └─────────┘
                                                     └──────────┘
```

No stage may be skipped. No backward transition without fixing the failing checkpoint.

---

## Stage 1 — Review

**Goal:** Understand authority, scope, and constraints before design.

### Activities

1. Read governing documents in order:
   - [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md)
   - [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md)
   - [01-05-WORKFLOW.md](01-05-WORKFLOW.md)
   - [02-CODING.md](../standards/02-CODING.md)
   - [03-NAMING.md](../standards/03-NAMING.md)
   - [../TASK_PROMPT.md](../TASK_PROMPT.md)
   - Relevant approved ADRs in [adr/](../../docs/adr/)
2. Inspect existing code in affected modules under `src/`.
3. Classify the change:
   - Bug fix (boundary unchanged)
   - Additive feature (contract additive)
   - Structural change (port, layer, storage, contract break)
4. Verify ADR status for structural work.
5. Confirm task does not conflict with constitution or architecture.

### Mandatory checkpoint — Review gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| R1 | Documents read | All applicable governing docs reviewed |
| R2 | Task scope identified | Active [../TASK_PROMPT.md](../TASK_PROMPT.md) or explicit owner instruction |
| R3 | Change classified | Bug / additive / structural recorded |
| R4 | ADR status | Approved ADR exists if structural; Proposed ADR written if missing |
| R5 | No conflict | No unresolved conflict with constitution |

**Stop condition:** R4 or R5 fails → halt; resolve with owner or write Proposed ADR.

**Output:** Change classification statement; list of documents and modules reviewed.

---

## Stage 2 — Design

**Goal:** Produce architecture-reviewed design before any implementation.

### Activities

1. **Architecture review (mandatory)** — complete before coding:
   - Layer placement per [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md)
   - Canonical owner module per [11-AI-RULES.md](../ai-rules/11-AI-RULES.md)
   - Port vs adapter decisions
   - REST, MCP, schema, and migration impact
   - Three-phase future compatibility
2. Produce written design using [05-WORKFLOW.md](../workflow/05-WORKFLOW.md) output format:

```markdown
## Requirement Understanding
## Architecture Impact
## Design Decision
## Files To Change
## Implementation Plan
## Risks
## Compatibility
## Test Plan
```

3. For structural changes: confirm ADR is **Approved** and design aligns with ADR decision.
4. Define commit sequence (one concern per commit).
5. Define definition-of-done items for this task.

### Mandatory checkpoint — Design gate (architecture review)

| # | Criterion | Pass condition |
|---|-----------|----------------|
| D1 | Architecture impact written | All eight ENGINEERING sections complete |
| D2 | Layer assignment | Every new/changed module mapped to layer |
| D3 | Port compliance | Swappable infra behind ports; composition root wiring planned |
| D4 | Contract impact | REST/MCP/schema impact assessed; breaking = owner approval |
| D5 | Storage plan | Migration idempotent; backfill dry-run if applicable |
| D6 | Scope boundary | No unrelated refactors in plan |
| D7 | ADR alignment | Structural work matches approved ADR |
| D8 | Owner clarity | Ambiguous requirements resolved or explicitly accepted |

**Stop condition:** D1–D8 any fails → halt; do not write implementation code.

**Output:** Design document (ENGINEERING format); commit plan; test plan.

---

## Stage 3 — Implementation

**Goal:** Execute the approved design in small, verifiable commits.

### Activities

1. Implement one concern per commit per design plan.
2. Follow [01-05-WORKFLOW.md](01-05-WORKFLOW.md) and [02-CODING.md](../standards/02-CODING.md).
3. Wire concrete adapters only at composition roots.
4. Run quality gate after each commit:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
```

5. Reference ADR id in commit message when structural.
6. Do not introduce TODO, FIXME, stubs, or dead code.

### Mandatory checkpoint — Per-commit gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| I1 | Single concern | Diff addresses one intent only |
| I2 | Quality gate | lint, format:check, typecheck, test all pass |
| I3 | Layer compliance | No forbidden patterns per 01-ENGINEERING |
| I4 | Style compliance | No forbidden patterns per 02-CODING |
| I5 | Naming compliance | Matches 03-NAMING |
| I6 | No secrets | No credentials in diff |

**Stop condition:** I2 fails → fix before next commit or merge.

**Output:** Sequence of passing commits on branch.

---

## Stage 4 — Testing

**Goal:** Verify behavior, regression safety, and scope coverage with evidence.

### Activities

1. Execute tests proportional to change per [01-05-WORKFLOW.md](01-05-WORKFLOW.md):

| Change type | Required tests |
|-------------|----------------|
| Pure logic | Unit tests |
| Repository / store | Repository tests + mock storage update |
| Service orchestration | Service tests |
| HTTP surface | API integration tests |
| MCP tool | MCP tool tests |
| Migration | Migration test in `tests/db/` |
| Script / backfill | Script test; dry-run verified |

2. Update `MockD1` or test doubles when schema or queries change.
3. Confirm test count did not decrease.
4. Run full suite: `npm test`.
5. Run integration tests when touching auth, API, or MCP: `npm run test:integration` (if applicable).

### Mandatory checkpoint — Testing gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| T1 | New behavior covered | Tests added or updated for every changed behavior |
| T2 | Regression green | Full test suite passes |
| T3 | Mock parity | Test doubles updated if schema changed |
| T4 | Migration verified | Migration test passes if DDL changed |
| T5 | Backfill verified | Dry-run tested if backfill script added/changed |
| T6 | No coverage decrease | Test count ≥ pre-change count |

**Stop condition:** T2 fails → return to Implementation; do not proceed to Documentation.

**Output:** Test results; list of new/updated test files.

---

## Stage 5 — Documentation

**Goal:** Synchronize written artifacts with shipped behavior.

### Activities

Update documents when applicable:

| Document | Trigger |
|----------|---------|
| [10-PHASE-STATUS.md](../architecture/10-PHASE-STATUS.md) | Ports, phases, deployment, extension points changed |
| [../TASK_PROMPT.md](../TASK_PROMPT.md) | Definition of done, completion report |
| [../PANDUAN.md](../../docs/PANDUAN.md) | User-visible setup, env vars, commands |
| [adr/*.md](../../docs/adr/) | ADR status → Implemented when structural work merges |
| [adr/README.md](../../docs/adr/README.md) | ADR index status |
| [README.md](../../docs/README.md) | Public API surface change |
| [archive/](../../docs/archive/) | Phase design history when closing a phase |

Do not duplicate constitutional rules. Link to `00-` – `04-` standards instead.

Deliver **final completion report** per [05-WORKFLOW.md](../workflow/05-WORKFLOW.md) when task scope is finished.

### Mandatory checkpoint — Documentation gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| DOC1 | Architecture sync | 10-PHASE-STATUS.md updated if ports/layers/phases changed |
| DOC2 | ADR status | Implemented ADRs marked when structural work shipped |
| DOC3 | User docs | PANDUAN updated if user-visible behavior changed |
| DOC4 | Task prompt | Definition of done checked; completion report delivered |
| DOC5 | No stale docs | No document contradicts shipped behavior |

**Stop condition:** DOC1 or DOC2 required but incomplete → complete before Code Review.

**Output:** Documentation diff; completion report.

---

## Stage 6 — Code Review

**Goal:** Validate design fidelity, standards compliance, and reviewability before merge.

### Activities

1. Self-review (AI or author) against all prior checkpoints.
2. Verify diff matches approved design (Files To Change).
3. Verify no scope creep beyond task prompt.
4. Verify commit history is one concern per commit.
5. Human or owner review when requested or for structural changes.

### Review checklist

- [ ] Design document matches implementation
- [ ] Architecture review was completed before first code commit
- [ ] All per-commit quality gates passed
- [ ] Testing gate passed
- [ ] Documentation gate passed
- [ ] No forbidden patterns (constitution, engineering, coding style)
- [ ] ADR referenced in structural commits
- [ ] Public contracts additive or owner-approved breaking
- [ ] Secrets absent from diff

### Mandatory checkpoint — Code review gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| CR1 | Design fidelity | Implementation matches approved design |
| CR2 | Standards compliance | 00–04 standards satisfied |
| CR3 | Scope control | No unapproved scope expansion |
| CR4 | Review complete | Self-review checklist fully checked |
| CR5 | Owner approval | Obtained for breaking changes or constitutional amendments |

**Stop condition:** CR1–CR5 any fails → return to Implementation or Design.

**Output:** Approved review record (PR comment, checklist, or explicit owner approval).

---

## Stage 7 — Merge

**Goal:** Integrate verified work into main branch without regressing quality.

### Activities

1. Re-run full quality gate on branch tip:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

2. Confirm branch is up to date with target branch (resolve conflicts preserving architecture).
3. Merge via PR or explicit owner-directed merge.
4. Verify CI equivalent locally if no remote CI.
5. Do not merge with failing tests or lint errors.
6. Do not force-push to main without owner explicit request.

### Mandatory checkpoint — Merge gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| M1 | Quality gate green | All four commands pass on branch tip |
| M2 | Review gate passed | Code review gate CR1–CR4 satisfied |
| M3 | Documentation merged | Documentation changes included in merge |
| M4 | Single history intent | Commit series tells coherent story |
| M5 | Main protected | No force-push; hooks not skipped |

**Stop condition:** M1 fails → fix before merge.

**Output:** Merge commit on main; post-merge `git status` clean.

---

## Stage 8 — Release

**Goal:** Deploy or publish merged work safely and verify operational readiness.

### Activities

1. Push to remote when owner requests or automation requires.
2. Run migrations on target environment: `npm run db:migrate`.
3. Run backfill dry-run before execute when schema or data migration applies.
4. Verify deployment entrypoints:
   - REST: Vercel / `npm run dev`
   - MCP: `npm run mcp` / `npm run setup`
5. Smoke test critical paths: health, auth bootstrap, memory CRUD, MCP tool invocation.
6. Update phase status in [10-PHASE-STATUS.md](../architecture/10-PHASE-STATUS.md) when phase completes.
7. Rotate [../TASK_PROMPT.md](../TASK_PROMPT.md) from template when starting next phase.

### Mandatory checkpoint — Release gate

| # | Criterion | Pass condition |
|---|-----------|----------------|
| REL1 | Remote pushed | When release requires remote — branch on origin |
| REL2 | Migration applied | Target DB migrated without error |
| REL3 | Backfill safe | Dry-run verified before execute |
| REL4 | Smoke pass | Health + primary user path verified |
| REL5 | Ops documented | PANDUAN updated for new commands or env vars |
| REL6 | Phase closure | TASK_PROMPT completion report archived if phase ends |

**Stop condition:** REL2 or REL4 fails → rollback per ADR rollback section; notify owner.

**Output:** Release confirmation; smoke test results; updated phase status.

---

# Required

1. Execute all eight stages in order for every non-trivial change.
2. Complete architecture review (Design gate D1–D8) before writing implementation code.
3. Pass every mandatory checkpoint before advancing to the next stage.
4. Run per-commit quality gate during Implementation.
5. Run full test suite before Documentation gate.
6. Update documentation when triggers apply.
7. Deliver completion report when task scope finishes.
8. Obtain owner approval for breaking changes, constitutional amendments, and structural ADRs.
9. Stop and ask when any checkpoint fails and resolution is unclear.
10. One concern per commit throughout Implementation.

---

# Forbidden

1. Implementation before Design gate passes.
2. Skipping architecture review for structural or multi-layer changes.
3. Merging with failing lint, format, typecheck, or tests.
4. Skipping documentation when ports, ADR status, or user-visible behavior changed.
5. Combining unrelated concerns in one commit.
6. Skipping hooks (`--no-verify`) unless owner explicitly requests.
7. Force-push to main without owner explicit request.
8. Executing backfill without dry-run verification first.
9. Declaring task complete without completion report and definition-of-done check.
10. Proceeding on Proposed ADR without owner approval for structural work.
11. Skipping Code Review self-checklist.
12. Release without migration verification when DDL changed.

---

# Decision Rules

## Which stages apply?

| Change size | Stages required |
|-------------|-----------------|
| Typo in comment only | Review → Implementation → Merge (abbreviated) |
| Bug fix, single layer | All stages; Design may be abbreviated if layer impact is trivial |
| Additive feature | All stages; full Design gate |
| Structural / multi-layer | All stages; full Design gate + approved ADR |
| Docs only | Review → Documentation → Code Review → Merge |

Abbreviated Design still requires written layer placement — never skip D2.

## When is architecture review mandatory?

| Trigger | Architecture review |
|---------|---------------------|
| Any structural change | Full Design gate |
| New port or adapter | Full Design gate |
| Schema migration | Full Design gate |
| New REST or MCP contract surface | Full Design gate |
| Single-layer bug fix, no contract change | Abbreviated: D2 + D4 + test plan |
| Format/lint only | Not required |

## Stage rollback

| Failure at | Return to |
|------------|-----------|
| Testing gate | Implementation |
| Documentation gate | Implementation or Documentation |
| Code review gate | Design or Implementation |
| Merge gate | Implementation |
| Release gate | Merge (revert or hotfix branch) |

## AI assistant obligations

- Produce Design output before tool-based code edits.
- Run quality gate commands; report exit codes.
- Do not claim checkpoint pass without command evidence.
- Stop at Proposed ADR boundary for structural work.
- Commit and push only when owner requests.

---

# Examples

## Good workflow

1. **Review:** Read 00–04, TASK_PROMPT, ADR-003 (Implemented). Classify: additive embedding cleanup.
2. **Design:** Write eight ENGINEERING sections; plan 2 commits; test plan for service + store.
3. **Implementation:** Commit 1 — store method; gate passes. Commit 2 — service wire; gate passes.
4. **Testing:** 3 new tests; 152 total pass; MockD1 updated.
5. **Documentation:** 10-PHASE-STATUS.md §13 updated; completion report in TASK_PROMPT.
6. **Code Review:** Self-checklist CR1–CR4 complete.
7. **Merge:** Branch tip gate green; merge to main.
8. **Release:** migrate; backfill dry-run; MCP smoke pass.

## Bad workflow

1. Edit `MemoryRepository` with vector SQL without Design or ADR — **forbidden**.
2. Single 800-line commit with feature + refactor + docs — **fails I1**.
3. Tests red; merge anyway — **fails M1**.
4. Ship schema change; skip PANDUAN and migration test — **fails DOC1, T4**.
5. Start coding after reading TASK_PROMPT only — **fails R1, D1**.

---

# Checklist

## Master workflow checklist

### Review gate
- [ ] R1 Documents read
- [ ] R2 Task scope identified
- [ ] R3 Change classified
- [ ] R4 ADR status verified
- [ ] R5 No constitutional conflict

### Design gate (architecture review — before code)
- [ ] D1 Eight ENGINEERING sections written
- [ ] D2 Layer assignment complete
- [ ] D3 Port compliance planned
- [ ] D4 Contract impact assessed
- [ ] D5 Storage/migration plan defined
- [ ] D6 Scope bounded
- [ ] D7 ADR alignment confirmed
- [ ] D8 Ambiguity resolved

### Per-commit (implementation)
- [ ] I1 Single concern
- [ ] I2 lint + format:check + typecheck + test pass
- [ ] I3–I6 Standards compliance

### Testing gate
- [ ] T1–T6 All testing criteria pass

### Documentation gate
- [ ] DOC1–DOC5 Documentation criteria pass

### Code review gate
- [ ] CR1–CR5 Review criteria pass

### Merge gate
- [ ] M1–M5 Merge criteria pass

### Release gate
- [ ] REL1–REL6 Release criteria pass (when releasing)

---

---

# Pre-implementation analysis

**Mandatory before any code** (merged from archived [05-WORKFLOW.md](../../docs/archive/05-WORKFLOW.md)). Produce all eight sections. No implementation until complete.

## Before starting

| # | Document | Purpose |
|---|----------|---------|
| 1 | [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) | Immutable law |
| 2 | [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) | Structure, layers, extension points |
| 3 | [10-PHASE-STATUS.md](../architecture/10-PHASE-STATUS.md) | Live metrics and debt |
| 4 | [TASK_PROMPT.md](../TASK_PROMPT.md) | Current phase work only |
| 5 | [PANDUAN.md](../../docs/PANDUAN.md) | User-facing behavior and ops |
| 6 | [archive/](../../docs/archive/) | Historical design context |
| 7 | Existing implementation | Inspect `src/` — verify against docs |

### 1. Current architecture

Where does this feature belong? Which canonical owner from [11-AI-RULES.md](../ai-rules/11-AI-RULES.md)?

### 2. Layer impact

| Layer | Impact |
|-------|--------|
| `routes/` | |
| `controllers/` | |
| `services/` | |
| `repositories/` | |
| `memory/` | |
| `knowledge/` | |
| `search/` | |
| `mcp/` | |
| Database | |

### 3. Dependencies

What new dependencies? Can they be abstracted behind ports?

### 4. Storage impact

Schema, migration, backfill, indexes, rollback.

### 5. API impact

New or modified endpoint? Breaking change requires owner approval.

### 6. MCP impact

New tool or changed tool schema?

### 7. Future compatibility

Phases 6–10 impact table.

### 8. Risks

Performance, security, migration, scalability, maintainability.

## Output format (mandatory)

```markdown
## Requirement Understanding
## Architecture Impact
## Design Decision
## Files To Change
## Implementation Plan
## Risks
## Compatibility
## Test Plan
```

See [11-AI-RULES.md](../ai-rules/11-AI-RULES.md) §Development Discussion for multi-layer work.

---

*Inherits from [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md). Amend only with project owner approval.*
