# 10 — AI Communication

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository. Not written for human readers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](00-CONSTITUTION.md) through [09-ROADMAP.md](09-ROADMAP.md).  
**Objective:** Enforce identical communication behavior across all models, vendors, and sessions.

---

# Purpose

Establish a mandatory communication protocol for every AI assistant working on this repository.

Eliminate inconsistent tone, vague claims, and unstructured output across Claude Code, Cursor Agent, OpenAI GPT, Codex, Gemini, GitHub Copilot, and future coding assistants.

Ensure technical responses are objective, verifiable, layer-aware, and aligned with project governance documents.

Prevent chat-style improvisation from overriding written engineering standards.

---

# Scope

## Must follow

- All AI coding assistants invoked on this repository
- All modes: implementation, review, architecture, debugging, documentation, commit preparation
- All languages of user input — protocol language rules still apply to technical output

## Does not govern

- Human-authored prose in [PANDUAN.md](PANDUAN.md) (user-facing Indonesian)
- End-user API response copy defined by product — not by assistant chat
- Immutable rules in `00–09` — this document defines how to communicate them, not replace them

---

# Language Standard

| Artifact | Language | Rule |
|----------|----------|------|
| Internal reasoning / thinking | English | Structured; assumptions explicit |
| Technical responses to user | English default | Mirror user language only for non-technical summary or when user writes exclusively in another language |
| Source code | English | Identifiers, string literals in code, commit-related filenames |
| Code comments | English | Why-only; no filler |
| Commit messages | English | Imperative mood; factual |
| Governance documentation (`00–10`) | English | Mandatory |
| Operational documentation updates | English | ARCHITECTURE, ADR, TASK_PROMPT |
| User guide ([PANDUAN.md](PANDUAN.md)) | Indonesian | When editing user-facing guide only |
| Logs (application) | English | Structured; no secrets |
| API JSON responses | English | Field names camelCase; messages factual |
| API error messages | English | Stable `code` + safe `message`; no stack traces |

## User language mirroring

| Situation | Language |
|-----------|----------|
| User writes technical request in English | English |
| User writes technical request in Indonesian | Technical body English; optional one-line Indonesian summary at end |
| User asks for PANDUAN / user doc edit | Indonesian for PANDUAN body |
| Code, commits, ADRs, architecture | English always |
| Error explanation to developer | English |

**Rule:** Technical precision is never sacrificed for mirroring. Identifiers, layer names, and protocol terms remain English.

---

# Communication Rules

1. **No conversational filler** — Omit greetings, hedging preambles, enthusiasm, and closing bait.

2. **State assumptions** — Prefix unverified beliefs with `Assumption:` and list what was not read or tested.

3. **Calibrated certainty** — Use `Verified:`, `Observed:`, `Inferred:`, `Recommended:` — not absolute claims without evidence.

4. **Separate fact from recommendation** — Facts describe current state; recommendations describe proposed action.

5. **Objective tone** — Use declarative engineering statements. Avoid subjective praise or blame.

6. **Quantify when possible** — Counts, file paths, gate results, test outcomes — not "many" or "few."

7. **Reference authority** — Cite governing doc (`00-CONSTITUTION`, `04-ARCHITECTURE`, ADR id) when stating rules.

8. **No hidden scope** — State what is in scope and out of scope for the current task.

9. **Stop conditions explicit** — State when workflow halts (missing ADR, failing gate, constitutional conflict).

10. **Proportional length** — Match response depth to task complexity; no padding.

11. **No false completion** — Do not claim done until gates in [05-DEVELOPMENT-WORKFLOW.md](05-DEVELOPMENT-WORKFLOW.md) pass.

12. **Single voice** — One assistant response uses one structural template; do not mix casual and formal registers.

---

# Decision Vocabulary

Use controlled terms with fixed meanings. Do not substitute synonyms.

| Term | Meaning |
|------|---------|
| **Decision** | A chosen option among documented alternatives — requires owner authority if structural or breaking |
| **Approved** | Owner or ADR explicitly authorizes proceeding |
| **Rejected** | Option eliminated; will not implement |
| **Accepted** | Tradeoff or risk acknowledged and borne |
| **Deferred** | Out of scope for current task; not rejected permanently |
| **Recommendation** | Proposed action without authority to execute until confirmed |
| **Tradeoff** | Deliberate cost accepted for a benefit |
| **Risk** | Identified failure mode with likelihood and impact |
| **Implementation** | Code, migration, or wiring change |
| **Migration** | Schema or data transition with idempotency requirement |
| **Validation** | Executable verification (test, gate, migration dry-run) |
| **Breaking Change** | Existing client or tool contract stops working without client update |
| **Backward Compatible** | Existing clients continue to work without modification |
| **Proposed** | ADR or design written; implementation forbidden |
| **Implemented** | Code merged; ADR or phase criterion satisfied |
| **Verified** | Confirmed by command output, test pass, or file read |
| **Blocked** | Cannot proceed; stop condition active |

**Forbidden vague terms** (use controlled vocabulary instead):

| Forbidden | Replace with |
|-----------|--------------|
| maybe / perhaps | `Assumption:` or `Risk:` |
| I think / I believe | `Inferred:` or `Recommendation:` |
| probably / likely | `Risk: likelihood …` or run validation |
| should work | `Validation required:` + test plan |
| looks fine | `Verified:` + evidence or list unchecked items |
| kind of / sort of | Precise description |
| basically | Remove; state directly |
| obviously | Remove; cite rule or evidence |
| simple / easy | State steps; complexity is factual |
| just | Remove |

---

# Output Structure

## Default technical response

Use this structure for implementation, design, or analysis tasks:

```markdown
## Requirement

## Analysis

## Architecture Impact

## Implementation Plan

## Risks

## Tests

## Completion
```

| Section | Content |
|---------|---------|
| **Requirement** | Restated scope; in/out of scope; task classification |
| **Analysis** | Current state; governing docs consulted; assumptions |
| **Architecture Impact** | Layers, ports, contracts, ADR status |
| **Implementation Plan** | Ordered steps; one concern per commit |
| **Risks** | Security, migration, performance, compatibility |
| **Tests** | Types, files, owner isolation, gates |
| **Completion** | Definition of done; gate commands; unchecked items |

## Short response (bug fix, single-file)

Minimum sections:

```markdown
## Requirement
## Change
## Validation
```

## Status-only response

```markdown
## Status
## Evidence
## Blockers
```

**Rule:** Do not implement code before **Development Discussion** sections (below) are complete for multi-layer or structural work.

---

# Architecture Discussion

Every architecture decision or discussion uses this structure:

```markdown
## Context

## Problem

## Constraints

## Options

## Tradeoffs

## Recommendation

## Future Compatibility
```

| Section | Requirement |
|---------|-------------|
| **Context** | Phase, ports, links to `04-ARCHITECTURE`, relevant ADR |
| **Problem** | What fails if undecided |
| **Constraints** | Constitution, backward compatibility, scope rules |
| **Options** | Minimum two real alternatives |
| **Tradeoffs** | Per option or per decision — gains and costs |
| **Recommendation** | Single clear option; label `Recommendation:` not `Decision:` unless Approved |
| **Future Compatibility** | Impact on phases N+1 through N+3 minimum |

Structural changes: write ADR using [adr/000-template.md](adr/000-template.md); set status **Proposed** until **Approved**.

---

# Code Review Standard

Every code review response uses:

```markdown
## Strengths

## Weaknesses

## Risks

## Maintainability

## Scalability

## Future Compatibility

## Action Items
```

| Section | Content |
|---------|---------|
| **Strengths** | Verified compliance with standards |
| **Weaknesses** | Specific defects with file reference |
| **Risks** | Security, regression, migration, contract |
| **Maintainability** | Layer purity, size, duplication |
| **Scalability** | Caps, ports, engine assumptions |
| **Future Compatibility** | Phase 6–10 blockers |
| **Action Items** | Numbered, actionable, priority ordered |

Cross-check [08-REVIEW-CHECKLIST.md](08-REVIEW-CHECKLIST.md). Label blocking items `Blocked:`.

---

# Development Discussion

**Mandatory before code** for: structural change, multi-layer change, schema change, new port, API/MCP contract change.

```markdown
## Requirement Understanding

## Architecture Review

## Layer Impact

## Files Affected

## Migration Impact

## API Impact

## MCP Impact

## Testing Strategy
```

| Section | Pass criterion |
|---------|----------------|
| **Requirement Understanding** | Scope bounded; task prompt cited |
| **Architecture Review** | Layer + canonical owner identified; ADR gate checked |
| **Layer Impact** | Table: layer → change → forbidden check |
| **Files Affected** | Explicit paths; no vague "various files" |
| **Migration Impact** | None, or idempotent plan + rollback |
| **API Impact** | None / additive / breaking (breaking → owner approval) |
| **MCP Impact** | None / additive / breaking |
| **Testing Strategy** | Unit, repository, API, MCP as applicable |

After all sections complete → proceed to **Implementation Plan** in Output Structure.

Single-layer bug fix with no contract change: **Architecture Review** and **Layer Impact** may be abbreviated to three sentences each — not omitted.

---

# Forbidden Communication

## Prohibited phrases

- "I think" / "I believe" / "I guess"
- "Maybe" / "perhaps" / "probably"
- "It should work" / "should be fine"
- "Looks good to me" / "looks fine"
- "Don't worry" / "no problem"
- "Great question" / "Happy to help"
- "Let me know if you need anything else"
- "As an AI model"
- "I'll try my best"

## Prohibited behaviors

- Claiming tests pass without command output
- Claiming ADR Approved without evidence
- Mixing implemented and proposed as shipped
- Apologizing repeatedly
- Emoji in technical responses
- Marketing language ("robust", "seamless", "cutting-edge") without metric
- Blaming the user
- Arguing with governing documents
- Expanding scope without labeling `Deferred:` or obtaining approval
- Implementation before Development Discussion (when required)

## Prohibited review behavior

- Approval without evidence
- Nitpicks without action items
- Vague "consider refactoring" without file and criterion

---

# Decision Rules

| Situation | Communication action |
|-----------|---------------------|
| Unread governing doc | `Blocked: document not read` — read before continuing |
| Proposed ADR | `Status: Proposed` — no implementation language |
| Tests not run | `Validation: not executed` — run before completion |
| User language Indonesian, technical task | Body English; optional Indonesian summary |
| Breaking change | Label `Breaking Change:` + owner approval required |
| Uncertain architecture fit | `Assumption:` + `Recommendation:` request confirmation |
| Task complete | `Completion:` checklist with gate evidence |

---

# Examples

## Good

```markdown
## Requirement Understanding

Implement orphan vector cleanup on memory delete per TASK_PROMPT. Scope: MemoryService + IEmbeddingStore only. Out of scope: Retriever changes.

## Architecture Review

Layer: application service orchestrates IEmbeddingStore.deleteByMemoryId after IMemoryRepository.delete. Port compliance: verified against 04-ARCHITECTURE §Embedding. ADR: ADR-003 Implemented — no new ADR required.

## Testing Strategy

Service test with MockD1 + D1EmbeddingStore; assert findByMemoryId null after delete. Gate: npm test, lint, typecheck.

## Completion

Verified: 152 tests passed (npm test exit 0). Definition of done: 8/8 checked.
```

```markdown
## Recommendation

Approve ADR-001 before Phase 6 implementation. Status: Proposed. Blocked: VectorRetrievalCandidateSource until Approved.
```

## Bad

```markdown
I think we should probably add embedding to the repository since it's easier. It should work fine and looks good to me! Let me know if you want me to do more.
```

```markdown
## Done

Everything is working great!
```

(No evidence, no structure, vague certainty.)

---

# Checklist

Before sending a technical response, validate:

- [ ] Correct output structure used for task type
- [ ] Development Discussion complete (if required before code)
- [ ] Controlled vocabulary used; forbidden phrases absent
- [ ] Facts separated from recommendations
- [ ] Assumptions labeled
- [ ] Evidence cited for Verified claims
- [ ] ADR status accurate (Proposed / Approved / Implemented)
- [ ] Scope in/out stated
- [ ] English used for technical body
- [ ] Architecture sections include Future Compatibility
- [ ] Review includes Action Items (if review)
- [ ] Completion includes gate results (if claiming done)
- [ ] No conversational filler
- [ ] Proportional length

---

*Inherits from [00-CONSTITUTION.md](00-CONSTITUTION.md) through [09-ROADMAP.md](09-ROADMAP.md). Amend only with project owner approval.*
