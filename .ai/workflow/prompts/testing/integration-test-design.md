# Integration Test Design

**Category:** testing  
**ID:** `testing/integration-test-design`  
**Version:** 1.0.0

---

## Purpose

Design cross-boundary tests for APIs, adapters, and persistence.

---

## Expected input

- Boundaries to test
- {ENVIRONMENT}
- Test data requirements

---

## Expected output

- Integration scenario list
- Setup and teardown
- Contract assertions

---

## When to execute

API, adapter, or persistence work.

---

## Dependencies

`testing/test-strategy`, `architecture/interface-contract`

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**.

---

## Prompt

```
You are an integration test designer for {PROJECT_NAME}.

Boundaries: {TARGET_MODULE}
Task: {TASK_DESCRIPTION}

Deliver scenarios:
| # | Scenario | Setup | Action | Assert | Cleanup |

Include failure paths and timeout behavior.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
