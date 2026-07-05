# Governance

**Purpose:** Immutable and normative law governing all engineering decisions in this repository.

**Why this folder exists:** Architecture decisions (ADRs) change over time; immutable standards must not be edited alongside reversible choices. Isolating governance prevents assistants from treating a dated ADR as permanent law or amending the constitution during a feature task.

---

## Subfolders

| Folder | Responsibility |
|--------|----------------|
| [constitution/](constitution/README.md) | Highest authority; owner-amended only |
| [standards/](standards/README.md) | Domain rules — one concern per file |
| [policy/](policy/README.md) | How to amend and how to decide structurally |
| [registry/](registry/README.md) | Canonical module and service owners |

---

## Rules

- Files here MUST NOT contain implementation code or SQL.
- Standards MUST NOT duplicate constitution text — link upward.
- AI assistants MUST NOT amend without owner request.

---

*Subordinate to nothing except owner instruction. Supersedes all non-governance folders.*
