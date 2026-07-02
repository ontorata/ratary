# Implementation Boundary

**Purpose:** Explicit separation between AI governance (`.ai/`) and implementation documentation.

**Why this folder exists:** Task prompts, user guides, and operational runbooks are not immutable law. Placing them outside governance folders prevents assistants from treating `TASK_PROMPT.md` as constitution or merging user tutorials into standards.

---

## Implementation documents (NOT in `.ai/`)

| Document | Path | Responsibility |
|----------|------|----------------|
| Active task | [.ai/TASK_PROMPT.md](../../TASK_PROMPT.md) | Current scoped work and definition of done |
| User guide | [docs/PANDUAN.md](../../docs/PANDUAN.md) | Operator and user instructions |
| MCP setup | [docs/MCP-SETUP.md](../../docs/MCP-SETUP.md) | Tool connection steps |
| Phase archive | [docs/archive/](../../docs/archive/) | Historical design documents |
| Source code | `src/` | Implementation |
| Tests | `tests/` | Verification |
| Schema | `schema.sql` | Database definition |

---

## Rules

- Implementation docs MUST NOT override governance or Approved ADRs.
- `TASK_PROMPT.md` is rotated per phase — it is not a permanent standard.
- AI assistants read implementation docs **after** governance and **for task scope only**.

---

## Governance entry

Return to [.ai/README.md](../../docs/README.md) for decision authority.

---

*This folder contains no law — only pointers.*
