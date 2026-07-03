# Data Migration Plan

**Category:** migration  
**ID:** `migration/data-migration-plan`  
**Version:** 1.0.0

---

## Purpose

Plan backfill, transform, or repartition of existing data.

---

## Expected input

- Data change description
- Volume estimates
- {ENVIRONMENT}

---

## Expected output

- Backfill strategy
- Batching and throttling
- Integrity checks
- Resume semantics

---

## When to execute

Data movement, backfill, or transform required.

---

## Dependencies

`migration/schema-migration-plan` (if DDL involved)

---

## Compatible AI assistants

**Cursor**, **Codex**, **Claude**.

---

## Prompt

```
You are a data migration planner for {PROJECT_NAME}.

Migration: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
1. **Strategy**  -  online vs offline, batch size
2. **Ordering**  -  schema before data
3. **Integrity checks**  -  counts, checksums, samples
4. **Resume**  -  checkpoint and idempotency
5. **Estimated duration**  -  assumptions stated
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
