# Templates

**Purpose:** Blank forms for artifacts — not executable session instructions.

**Why this folder exists:** Templates are filled per task; prompts are copied whole. A template executed as a prompt produces incomplete work; a prompt stored as a template gets overwritten.

---

## Documents

| Template | Use when |
|----------|----------|
| [adr.md](adr.md) | Drafting a new ADR |
| [task-prompt.md](task-prompt.md) | Starting a new phase track |
| [design-discussion.md](design-discussion.md) | Pre-implementation design |
| [completion-report.md](completion-report.md) | Closing a phase or milestone |

---

## Rules

- Copy template to a working location; do not commit blank templates as live artifacts.
- Live task prompt: `.ai/TASK_PROMPT.md` only.
- One template = one artifact type.

---

*Distinct from [prompts/](../prompts/README.md).*
