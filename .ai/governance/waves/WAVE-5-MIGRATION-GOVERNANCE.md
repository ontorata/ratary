---
id: ENGINEERING-GOVERNANCE-WAVE-5
phase: 04-proof-of-platform
stage: forge-execute
wave: 5
status: Complete
owner: Ontorata
workload: Engineering Governance
baseline_tag: engineering-governance-wave-4-locked
branch: forge/engineering-governance
lock_tag: engineering-governance-wave-5-locked
updated: 2026-07-08
---

# Wave 5 selesai — Migration Governance

| Field | Value |
|-------|-------|
| **Wave** | 5 — Migration Governance |
| **Baseline** | `engineering-governance-wave-4-locked` |
| **Branch** | `forge/engineering-governance` |
| **Gate** | **LOCKED** — ready for Wave 6 (Engineering Constitution) |

---

## Objective

Make database, schema, and data changes **safe, auditable, and recoverable.** Migration is a change of **state**, not just a change of file.

```
Migration Proposal → Impact Analysis → Migration Script → Validation → Execution → Rollback Capability → Evidence
```

**Non-goals honored:** no migration execution · schema alteration · migration tools · ORM changes · deployment automation.

---

## Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| Migration Policy | `.ai/governance/migrations/MIGRATION-POLICY.md` | ✅ |
| Rollback Procedure | `.ai/governance/migrations/ROLLBACK-PROCEDURE.md` | ✅ |
| Deployment Checklist | `.ai/governance/migrations/DEPLOYMENT-CHECKLIST.md` | ✅ |
| Migration Evidence Template | `.ai/migrations/MIGRATION-EVIDENCE-TEMPLATE.md` | ✅ |
| Wave 5 Evidence | `.ai/reviews/engineering-governance/migration-governance-proof.md` | ✅ |

---

## Migration risk classification

| Level | Approval | Examples |
|-------|---------|----------|
| Safe | Engineer self | CREATE TABLE, ADD nullable column, CREATE INDEX |
| Review Required | Peer + Gov owner | ADD column with default, blocking index, data backfill |
| High Risk | Gov owner + ADR | DROP COLUMN, RENAME COLUMN, DROP TABLE |

---

## Rollback model

```
Failure Detected → Assess Impact → Approve Rollback → Execute Rollback → Verify → Document
```

Rollback is always human-initiated. AI agents may prepare scripts but not execute in production.

---

## Key principles

1. **Migration is a state change** — evidence required before and after
2. **Backward compatibility** — application version N must work against schema N-1 and N
3. **Production migration is human** — never automated, never AI-executed
4. **Rollback must be tested** — validated in staging before production execution
5. **Backup is prerequisite** — no backup confirmation = no migration

---

## Validation

- `npm test` — 88/88 PASS
- `npm run ci:governance` — PASS
- No `src/` changes in Wave 5 commit

---

## Next

**Wave 6 — Engineering Constitution** — consolidate all governance artifacts into a single, canonical repository constitution document.

---

## Related

- [engineering-governance-plan.md](../../designs/blueprints/engineering-governance-plan.md)
- [migration-governance-proof.md](../../reviews/engineering-governance/migration-governance-proof.md)
