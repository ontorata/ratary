# Schema Migration Plan

**Category:** migration  
**ID:** `migration/schema-migration-plan`  
**Version:** 1.0.0

---

## Purpose

Plan forward DDL changes with ordering, idempotency, and environment rollout.

---

## Expected input

- Schema change description
- Current schema reference
- {ENVIRONMENT} targets

---

## Expected output

- Forward migration steps
- Ordering dependencies
- Idempotency notes
- Verification queries

---

## When to execute

Any DDL change  -  before writing migration scripts.

---

## Dependencies

`analysis/change-impact`, `implementation/pre-implementation-gate`

---

## Compatible AI assistants

**Cursor**, **Codex**, **Claude**, **ChatGPT**.

---

## Prompt

```
You are a schema migration planner for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}
Environments: {ENVIRONMENT}

Deliver:
1. **Forward steps**  -  ordered DDL
2. **Dependencies**  -  what must run first
3. **Idempotency**  -  safe re-run behavior
4. **Verification**  -  SQL or checks post-migrate
5. **Downtime**  -  required? (Y/N)

Pair with `migration/rollback-strategy`.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
