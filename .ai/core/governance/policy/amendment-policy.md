# Amendment Policy

**Purpose:** Rules for amending governance documents without eroding authority hierarchy.

---

## Rules

| Document class | Amendment authority | Process |
|----------------|---------------------|---------|
| Constitution | Project owner only | Explicit commit; announce impact |
| Standards `01–12` | Project owner | PR with decision-impact message |
| Decision framework | Project owner | PR; update prompts and checklists |
| ADR status → Approved | Project owner | Per [adr-policy](adr-policy.md) |
| Prompts | Maintainer PR | Must not weaken MUST gates |
| Templates | Maintainer PR | Single responsibility preserved |
| Checklists | Owner or maintainer | Must link to authoritative rule |
| INDEX / README | Maintainer | Registry accuracy |

- AI assistants MUST NOT amend normative governance during unrelated implementation.
- Clarifying cross-references MAY be proposed by maintainer without owner approval if no normative text changes.
- Weakening a **MUST** rule requires owner approval regardless of author.

## Rationale

Ungoverned edits by autonomous assistants accumulate contradictions across a 5–10 year horizon.

---

*Subordinate to [constitution](../../core/constitution/README.md) and [OWNERSHIP.md](../../OWNERSHIP.md).*
