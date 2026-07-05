# 14 — Global Writing Standard

**Status:** Permanent meta-standard for all repository documentation.  
**Audience:** AI assistants and human maintainers authoring or revising files under `docs/`.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Governs form and style; does not override substance in `00–12`.

---

# Purpose

## Rules

- All new and revised governance, architecture, ADR, and operational documentation MUST follow this standard.
- AI assistants generating documentation MUST apply RFC 2119 keywords with their defined meanings.
- Documents MUST link upward to higher-precedence sources instead of duplicating their content.

## Rationale

Inconsistent documentation produces contradictory instructions across models and sessions. A single writing standard keeps the corpus maintainable over a 5–10 year horizon and readable by any AI coding assistant.

---

# Language and Tone

## Purpose

Define how prose is written.

## Rules

- Documentation MUST use professional technical English.
- Documentation MUST be concise. Omit filler, marketing copy, and conversational openers.
- Documentation MUST NOT use promotional adjectives (`robust`, `seamless`, `powerful`, `cutting-edge`) unless quoting an external specification.
- Documentation MUST NOT use emoji in governance or standards documents.
- User-facing guides ([../PANDUAN.md](../../docs/PANDUAN.md)) MAY use Indonesian for end-user prose; technical identifiers and governance cross-references MUST remain English.
- Sentences MUST state facts, requirements, or decisions — not enthusiasm.

## Rationale

Technical standards are consumed by machines and engineers under time pressure. Neutral precise language reduces misinterpretation.

---

# RFC 2119 Keywords

## Purpose

Define mandatory vocabulary for requirements strength.

## Rules

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are interpreted per [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

| Keyword | Meaning |
|---------|---------|
| **MUST** | Absolute requirement |
| **MUST NOT** | Absolute prohibition |
| **SHOULD** | Recommended; valid reason required to deviate |
| **SHOULD NOT** | Discouraged; deviation requires justification |
| **MAY** | Optional |

- Requirement statements MUST use these keywords — not `will`, `should probably`, or `try to`.
- Prohibitions MUST use **MUST NOT** — not `don't` or `avoid when possible`.
- Optional practices MUST use **MAY** — not `can` alone in normative sections.

## Rationale

RFC 2119 provides a stable, vendor-neutral contract understood by humans and AI models without ambiguity.

---

# Document Hierarchy and De-duplication

## Purpose

Prevent conflicting copies of the same rule.

## Rules

- Each fact MUST have one authoritative document. Lower documents MUST reference higher documents — not restate them.
- Precedence order:

```
00-CONSTITUTION.md
01–12 standards (domain-specific)
supplementary/WRITING.md (this file — form only)
11-AI-RULES.md (repo-specific registry)
10-PHASE-STATUS.md (operational snapshot)
ADR-POLICY.md → adr/*
TASK_PROMPT.md (active work)
archive/ (historical)
PANDUAN.md, README.md (audience-specific)
```

- A lower document MUST NOT weaken a **MUST** in a higher document.
- When a rule already exists in `00–12`, later documents MUST link to it with a anchor or section reference — not copy the full rule.
- ADRs MUST NOT duplicate constitution text; they MAY cite constraints.

## Rationale

Duplication causes drift. References keep a single source of truth as the repository evolves across phases.

---

# Scope and Audience

## Purpose

Clarify who each document serves.

## Rules

- Every governance document (`00–13`) MUST declare **Audience** in the header block.
- AI-oriented standards (`00–12`, `13`) MUST be written for AI assistants first; humans are secondary readers.
- Documents MUST declare **Scope — Covered** and **Scope — Not Covered** (or equivalent) with links to authoritative documents for excluded topics.
- Implementation-specific names (frameworks, vendors, cloud products) MUST NOT appear in `00–12` unless the document explicitly covers operational snapshots; prefer `10-PHASE-STATUS.md` or ADRs for deployment detail.

## Rationale

Audience clarity prevents user guides from reading like law and prevents law from reading like tutorials.

---

# Section Structure

## Purpose

Enforce predictable layout across the corpus.

## Rules

- Governance documents (`00–12`) MUST use top-level sections compatible with this hierarchy:

```markdown
# NN — Title
(header block: Status, Audience, Authority)

# Purpose
# Scope
# Principles | Philosophy (when applicable)
# Standards | Rules (domain body)
# Required
# Forbidden
# Decision Rules
# Examples
# Checklist
```

- Meta and ADR documents MAY adapt section titles but MUST include **Purpose** and normative **Rules** (or **Decision**) in every major section.
- Every major section MUST include three subsections:

```markdown
## Purpose
## Rules
## Rationale
```

- Checklist-only documents (e.g. [08-REVIEW.md](../../core/standards/08-REVIEW.md)) MAY omit per-section Rationale if each checklist group has a one-line Rationale block.
- Headings MUST use ATX style (`#`). Heading levels MUST NOT skip (e.g. `##` after `#` only).

## Rationale

Uniform structure allows any model to locate requirements without parsing idiosyncratic outlines.

---

# Principles Over Implementation

## Purpose

Keep standards durable across stack changes.

## Rules

- Standards MUST describe layers, ports, budgets, and behaviors — not class names, file paths, or vendor SKUs unless in operational docs.
- Examples MAY name repository artifacts when illustrating good or bad practice; normative **Rules** sections MUST remain abstract.
- Performance, security, and architecture numbers MUST be stated as budgets with configuration as the tunable surface — not as hard-coded implementation mandates.
- Documents MUST prioritize stable boundaries (constitution, ports, contracts) over short-term optimizations.

## Rationale

Implementation changes every phase; principles and ports persist. Standards that name today's stack expire quickly.

---

# Markdown Conventions

## Purpose

Ensure consistent formatting.

## Rules

- Files MUST be valid Markdown (.md).
- Line length SHOULD be ≤ 100 characters where practical; tables and URLs are exempt.
- Links to internal docs MUST use relative paths from `docs/` (e.g. `[04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)`).
- Code blocks MUST specify language when not plain text.
- Tables MUST use header rows. Alignment row optional.
- Normative keywords in tables MUST be uppercase (**MUST**, **SHOULD**).
- Documents MUST NOT embed HTML except Mermaid diagrams in architecture docs where diagrams are required.

## Rationale

Consistent Markdown renders reliably in GitHub, IDEs, and AI context windows.

---

# AI Assistant Compatibility

## Purpose

Ensure documents work across Claude, Cursor, ChatGPT, Gemini, Codex, and future tools.

## Rules

- Instructions MUST be explicit and testable — not dependent on model-specific features.
- Documents MUST NOT reference proprietary tool UI (`Composer`, `Agent mode`) in normative text.
- Controlled vocabularies (e.g. [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md)) MUST be used for status and decisions in AI-generated responses about this repository.
- Session start reading order MUST be documented in [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) or [05-WORKFLOW.md](../workflow/05-WORKFLOW.md) — not redefined in every file.
- New standards MUST NOT require a specific model version or provider.

## Rationale

The repository outlives individual products. Tool-agnostic rules remain valid as assistants change.

---

# Document Types

## Purpose

Assign writing rules per document class.

## Rules

| Type | Location | MUST include |
|------|----------|--------------|
| Constitution | `00-CONSTITUTION.md` | Law, hierarchy, forbidden practices |
| Domain standard | `01–12` | Rules, checklists, decision tables |
| Writing standard | `supplementary/WRITING.md` | Form and meta-rules |
| Repo constitution | `11-AI-RULES.md` | Canonical module registry |
| Architecture snapshot | `10-PHASE-STATUS.md` | Phase status, ports, ops |
| ADR | `adr/NNN-*.md` | Context, decision, migration, rollback |
| Task prompt | `TASK_PROMPT.md` | Scope, definition of done |
| Archive | `archive/` | Historical design; immutable after phase close |
| User guide | `PANDUAN.md` | Setup and usage |
| README | `README.md` | Entry point and links |

- ADRs MUST follow [adr/000-template.md](../../adr/000-template.md).
- ADRs MUST use RFC 2119 in **Constraints** and **Decision** sections.
- `TASK_PROMPT.md` MUST be replaced from template at phase start — not appended indefinitely.

## Rationale

Each document class has a distinct lifecycle and audience; mixing roles creates unmaintainable files.

---

# Examples and Checklists

## Purpose

Make requirements verifiable.

## Rules

- Standards SHOULD include **Examples** with **Good** and **Bad** subsections.
- Checklists MUST use `- [ ]` task list syntax.
- Examples MUST illustrate rules — not introduce new normative requirements.
- Checklists MUST be actionable in a single review pass.

## Rationale

Examples disambiguate abstract rules; checklists enable consistent gates before merge.

---

# Revision and Ownership

## Purpose

Control how documents change over time.

## Rules

- Immutable documents (`00-CONSTITUTION.md`) MUST NOT change without explicit project owner approval.
- Domain standards (`01–13`) MUST NOT change without project owner approval.
- Operational docs (`10-PHASE-STATUS.md`, `TASK_PROMPT.md`, `adr/*`) MAY be updated by implementers when behavior or phase status changes, subject to ADR policy.
- Revisions MUST preserve RFC 2119 semantics; weakening a **MUST** requires owner approval.
- Changelog entries for governance docs MAY be noted in git commit message; a separate CHANGELOG for docs is optional.

## Rationale

Governance stability matters more than convenience edits. Operational docs must stay synchronized with shipped behavior.

---

# Required

1. Authors MUST read this standard before creating or substantially revising any `docs/` governance file.
2. Normative sections MUST use RFC 2119 keywords.
3. Major sections MUST include Purpose, Rules, and Rationale.
4. Documents MUST reference higher-precedence docs instead of duplicating content.
5. Governance docs MUST end with Document Ownership and Revision Policy sections.
6. Technical English MUST be used in `00–13` and ADRs.

---

# Forbidden

1. Marketing or conversational tone in standards.
2. Duplicating constitutional rules in README, ADRs, or task prompts.
3. Weakening **MUST** requirements in lower documents.
4. Implementation-only standards in `00–12` without abstraction.
5. Ambiguous modals (`might`, `probably`) in normative rules.
6. Governance docs without Scope declaration.
7. Skipping heading levels.
8. Undocumented audience.

---

# Decision Rules

| Question | Rule |
|----------|------|
| New rule or restate existing? | If exists in higher doc → link only |
| MUST or SHOULD? | Security, isolation, fail-closed → **MUST**; optimization → **SHOULD** |
| Which document? | Use Document Types table |
| Implementation detail? | `10-PHASE-STATUS.md` or ADR — not `00–12` |
| User tutorial? | `PANDUAN.md` — not constitution |
| Checklist only change? | `08-REVIEW.md` or domain checklist |

---

# Examples

## Good

```markdown
## Rules

- Services MUST NOT execute raw SQL.
- Repositories MUST filter by `ownerId` on every query.

## Rationale

Layer separation and tenant isolation are constitutional requirements.
See [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) §Multi-tenancy.
```

## Bad

```markdown
We really think it's super important to maybe try not to put SQL in services
when possible, because that's probably a bad idea for a robust seamless architecture.
```

---

# Checklist — new or revised document

- [ ] Professional technical English
- [ ] RFC 2119 keywords in normative statements
- [ ] Purpose, Scope, Authority in header
- [ ] Major sections have Purpose, Rules, Rationale
- [ ] No duplication of higher-level docs
- [ ] Links to authoritative sources
- [ ] Framework/vendor agnostic (if `00–12`)
- [ ] Examples and checklist (if standard)
- [ ] Document Ownership and Revision Policy sections present
- [ ] Valid Markdown heading hierarchy

---

# Document Ownership

| Role | Responsibility |
|------|----------------|
| **Project owner** | Approves amendments to `00–13`, `11-AI-RULES.md`, and ADR status transitions to Approved |
| **Maintainers** | Keep `10-PHASE-STATUS.md`, `TASK_PROMPT.md`, and Implemented ADRs synchronized with shipped behavior |
| **AI assistants** | Apply this standard when generating documentation; MUST NOT amend `00–13` without owner request |
| **Contributors** | Propose changes via PR; MUST NOT weaken **MUST** rules without owner review |

**Canonical path:** `docs/supplementary/WRITING.md`

---

# Revision Policy

| Document class | Who may revise | Approval |
|----------------|----------------|----------|
| `00-CONSTITUTION.md` | Project owner only | Explicit owner approval |
| `01–13` standards | Project owner only | Explicit owner approval |
| `11-AI-RULES.md` | Project owner only | Explicit owner approval |
| `10-PHASE-STATUS.md` | Maintainers / agents on phase completion | PR review |
| `adr/*` Proposed | Anyone | — |
| `adr/*` Approved → Implemented | Owner approves; implementer updates status | Owner for Approved |
| `TASK_PROMPT.md` | Owner or agent at phase boundary | Owner for phase close |
| `PANDUAN.md`, `README.md` | Maintainers when user-visible behavior changes | PR review |
| `archive/*` | Errata only; no rewrite of historical decisions | Owner |

- All revisions MUST be committed to version control with a clear commit message.
- Governance revisions MUST state what changed and why in the commit message or PR description.
- AI assistants MUST NOT silently edit `00–13` during unrelated implementation tasks.

---

*Inherits from [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Applies to all documents under `docs/` unless explicitly exempted by project owner.*
