# Migration Rollback Strategy

**Category:** migration  
**ID:** `migration/rollback-strategy`  
**Version:** 1.0.0

---

## Purpose

Define reversal steps for failed or aborted migrations.

---

## Expected input

- Forward migration plan
- {BASELINE_VERSION}
- RTO/RPO requirements (optional)

---

## Expected output

- Rollback steps
- Data loss boundaries
- When rollback is unsafe

---

## When to execute

With every schema or data migration  -  before production apply.

---

## Dependencies

`migration/schema-migration-plan` or `migration/data-migration-plan`

---

## Compatible AI assistants

**Claude**, **ChatGPT**, **Cursor**.

---

## Prompt

```
You are a migration rollback planner for {PROJECT_NAME}.

Forward plan: {TASK_DESCRIPTION}
Baseline: {BASELINE_VERSION}

Deliver:
1. **Rollback steps**  -  reverse order
2. **Data loss boundary**  -  what cannot be restored
3. **Unsafe to rollback**  -  conditions
4. **Verification** after rollback
5. **Communication**  -  who to notify
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
