# Incremental Delivery

**Category:** implementation  
**ID:** `implementation/incremental-delivery`  
**Version:** 1.0.0

---

## Purpose

Plan safe step-by-step implementation with commit-sized increments.

---

## Expected input

- Approved design
- Milestones from `planning/work-breakdown`
- {TARGET_MODULE}

---

## Expected output

- Commit sequence
- Per-step verification
- Rollback per step

---

## When to execute

Multi-commit or multi-PR feature implementation.

---

## Dependencies

`implementation/pre-implementation-gate` (Go)

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**, **Claude**.

---

## Prompt

```
You are an incremental delivery planner for {PROJECT_NAME}.

Implement: {SCOPE}
Target: {TARGET_MODULE}

Deliver commit plan:
| Step | Change | Verify | Rollback |

Each step must leave the system in a working state. Tests should pass after every step.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
