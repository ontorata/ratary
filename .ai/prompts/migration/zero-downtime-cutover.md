# Zero-Downtime Cutover

**Category:** migration  
**ID:** `migration/zero-downtime-cutover`  
**Version:** 1.0.0

---

## Purpose

Plan production cutover with dual-write, feature flags, or blue-green steps.

---

## Expected input

- Migration plans
- Traffic and SLA constraints
- {ENVIRONMENT}=production

---

## Expected output

- Cutover phases
- Traffic shift steps
- Abort criteria

---

## When to execute

Live system migration requiring continuous availability.

---

## Dependencies

`migration/schema-migration-plan`, `migration/data-migration-plan`, `migration/rollback-strategy`

---

## Compatible AI assistants

**Claude**, **ChatGPT**, **Cursor** (with deploy context).

---

## Prompt

```
You are a zero-downtime cutover planner for {PROJECT_NAME}.

Migration: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver:
1. **Phases**  -  expand, dual-write, cutover, contract
2. **Traffic steps**  -  % rollout
3. **Abort criteria**  -  automatic and manual
4. **Monitoring**  -  metrics to watch
5. **Rollback trigger**  -  link to rollback plan
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
