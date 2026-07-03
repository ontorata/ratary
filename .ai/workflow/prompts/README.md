# Prompts

**Purpose:** Reusable, repository-agnostic executable instructions for AI-assisted software engineering.  
**Catalog:** [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) (40 prompts)  
**Schema:** [SCHEMA.md](SCHEMA.md)

---

## Why this folder exists

Prompts are **complete instructions** copied into a session. They differ from [templates/](../templates/README.md), which are blank forms. Prompts reference governance via `{GOVERNANCE_ROOT}` placeholders - they do not redefine project law.

**Portable:** Copy `prompts/` to any repository. Set placeholders in a local config or replace per session.

---

## Categories

| Category | Folder | Prompts | When |
|----------|--------|---------|------|
| Planning | [planning/](planning/README.md) | 4 | Before work is scheduled |
| Analysis | [analysis/](analysis/README.md) | 4 | Before design or change |
| Architecture | [architecture/](architecture/README.md) | 4 | Structural decisions |
| Implementation | [implementation/](implementation/README.md) | 4 | During coding |
| Migration | [migration/](migration/README.md) | 4 | Schema and data changes |
| Testing | [testing/](testing/README.md) | 4 | Verification |
| Review | [review/](review/README.md) | 4 | Quality gates |
| Documentation | [documentation/](documentation/README.md) | 4 | Knowledge capture |
| Release | [release/](release/README.md) | 4 | Shipping |
| Operations | [operations/](operations/README.md) | 4 | Runtime and continuity |

---

## Session entry points

| Prompt | ID | When |
|--------|-----|------|
| [operations/session-start.md](operations/session-start.md) | `operations/session-start` | Every new session |
| [implementation/pre-implementation-gate.md](implementation/pre-implementation-gate.md) | `implementation/pre-implementation-gate` | Before code |
| [documentation/session-handoff.md](documentation/session-handoff.md) | `documentation/session-handoff` | Session end |
| [operations/escalation.md](operations/escalation.md) | `operations/escalation` | Blocked or conflicted |

---

## Legacy paths (redirects)

| Old path | New path |
|----------|----------|
| [session-start.md](session-start.md) | [operations/session-start.md](operations/session-start.md) |
| [pre-implementation.md](pre-implementation.md) | [implementation/pre-implementation-gate.md](implementation/pre-implementation-gate.md) |
| [code-review-request.md](code-review-request.md) | [review/code-review.md](review/code-review.md) |
| [phase-handoff.md](phase-handoff.md) | [documentation/session-handoff.md](documentation/session-handoff.md) |
| [escalation.md](escalation.md) | [operations/escalation.md](operations/escalation.md) |

---

## Rules

1. Replace `{PLACEHOLDERS}` before execution - never hardcode repository paths in prompt bodies.
2. Prompts MUST NOT weaken approval gates or skip dependencies.
3. Prompts MAY be used in any AI tool: ChatGPT, Claude, Cursor, Codex, Gemini, OpenHands.
4. One prompt, one responsibility - chain prompts per [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) dependency graph.

---

*Subordinate to project constitution when installed. Schema is portable across repositories.*
