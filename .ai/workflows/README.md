# AI Workflows — Operational Layer

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 3 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |
| **Enforcement** | PR template · Cursor rule · agent handoff |

---

## Purpose

Govern **AI-assisted development** so agents accelerate work without bypassing engineering control.

Repository + `.ai/` = source of truth. Ratary = organizational memory when available. Chat history = **not** authoritative.

---

## Artifacts

| Document | Role |
|----------|------|
| [AI-DEVELOPMENT-PROTOCOL.md](./AI-DEVELOPMENT-PROTOCOL.md) | How agents modify code · validation · forbidden actions |
| [CHANGE-EVIDENCE.md](./CHANGE-EVIDENCE.md) | Minimum evidence per change class |
| [SESSION-HANDOFF.md](./SESSION-HANDOFF.md) | Cross-agent / cross-session continuity |
| [IMPLEMENTATION-REPORT-TEMPLATE.md](./IMPLEMENTATION-REPORT-TEMPLATE.md) | Cursor → Claude Code execution handoff |

---

## Multi-agent operating model (recommended)

```
ChatGPT / Governance authority
        ↓  architecture decision · wave approval
Cursor / Primary execution agent
        ↓  Generate Implementation Report
Claude Code / Execute · Review · Refactor
        ↓  Validation + evidence
Human engineer / Merge · release
```

**Rule:** Governance authority approves scope. Execution agents do not expand scope without ADR or owner approval.

---

## Mandatory flow (all AI-assisted code changes)

```
AI Planning → Implementation → Validation → Evidence Update → Governance Review → Commit
```

**Forbidden:**

```
Code changed → commit → missing evidence / docs   ❌
```

---

## CI alignment

Before merge, `npm run ci:governance` must pass when code changes (Wave 2). AI workflow docs do not replace CI — they define **human/agent process** that produces evidence CI expects (`.ai/` updates, ADR references, tests).

---

## Related

- [CI-RULES.md](../governance/ci/CI-RULES.md)
- [WAVE-3-AI-WORKFLOW.md](../governance/waves/WAVE-3-AI-WORKFLOW.md)
- `.cursor/rules/ontorata-execution-governance.mdc`
