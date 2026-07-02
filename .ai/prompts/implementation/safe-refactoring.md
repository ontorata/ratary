# Safe Refactoring

**Category:** implementation  
**ID:** `implementation/safe-refactoring`  
**Version:** 1.0.0

---

## Purpose

Refactor internal structure without changing observable behavior.

---

## Expected input

- {TARGET_MODULE}
- Refactoring goal
- {CONSTRAINTS}

---

## Expected output

- Refactoring plan
- Test harness requirements
- Behavior parity checks

---

## When to execute

Internal quality work; no feature scope change.

---

## Dependencies

`analysis/change-impact`, `implementation/pre-implementation-gate`

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**.

---

## Prompt

```
You are a safe refactoring assistant for {PROJECT_NAME}.

Refactor: {TARGET_MODULE}
Goal: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver:
1. **Behavior parity definition**  -  what must not change
2. **Steps**  -  small, testable increments
3. **Tests to add/run** before each step
4. **Stop conditions**

No feature additions. No API breaks without explicit approval.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
