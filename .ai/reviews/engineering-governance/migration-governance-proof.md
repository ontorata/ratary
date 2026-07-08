# Migration Governance — Evidence (P0-B Wave 5)

| Field | Value |
|-------|-------|
| **Wave** | 5 — Migration Governance |
| **Branch** | `forge/engineering-governance` |
| **Baseline lock** | `engineering-governance-wave-4-locked` |
| **Date** | 2026-07-08 |

---

## Acceptance gate

| Gate | Evidence |
|------|----------|
| Migration Policy | `.ai/governance/migrations/MIGRATION-POLICY.md` |
| Rollback Procedure | `.ai/governance/migrations/ROLLBACK-PROCEDURE.md` |
| Deployment Checklist | `.ai/governance/migrations/DEPLOYMENT-CHECKLIST.md` |
| Migration Evidence Template | `.ai/migrations/MIGRATION-EVIDENCE-TEMPLATE.md` |
| Risk classification | MIGRATION-POLICY.md § Schema Change Classification |
| Wave checkpoint | `.ai/governance/waves/WAVE-5-MIGRATION-GOVERNANCE.md` |
| Lock tag | `engineering-governance-wave-5-locked` |

---

## Migration lifecycle coverage

| Stage | Covered in |
|-------|-----------|
| Migration Proposal | MIGRATION-POLICY.md § Migration Lifecycle |
| Impact Analysis | MIGRATION-POLICY.md § Schema Change Classification |
| Migration Script | MIGRATION-POLICY.md § Evidence Requirement |
| Validation | DEPLOYMENT-CHECKLIST.md § Pre-Migration / Post-Migration |
| Execution | DEPLOYMENT-CHECKLIST.md § Execution Checklist |
| Rollback Capability | ROLLBACK-PROCEDURE.md + MIGRATION-POLICY.md § Backup Requirement |
| Evidence | MIGRATION-EVIDENCE-TEMPLATE.md |

---

## Risk classification coverage

| Level | Covered in |
|-------|-----------|
| Safe (self-approval) | MIGRATION-POLICY.md § Safe |
| Review Required | MIGRATION-POLICY.md § Review Required |
| High Risk | MIGRATION-POLICY.md § High Risk |

---

## Rollback coverage

| Decision | Covered in |
|----------|-----------|
| When to roll back | ROLLBACK-PROCEDURE.md § Rollback Decision |
| When NOT to roll back | ROLLBACK-PROCEDURE.md § Rollback Decision |
| Rollback triggers + response time | ROLLBACK-PROCEDURE.md § Rollback Triggers |
| Backup requirement | ROLLBACK-PROCEDURE.md § Backup Requirement |
| Rollback ownership | ROLLBACK-PROCEDURE.md § Rollback Owner |
| Rollback script requirements | ROLLBACK-PROCEDURE.md § Rollback Script Requirements |
| Incident record template | ROLLBACK-PROCEDURE.md § Incident Record Template |

---

## Non-goals verification

| Non-goal | Verified |
|----------|---------|
| Migration execution | ✅ governance only — no execution |
| Schema alteration | ✅ governance only — no schema changes |
| Migration tool introduction | ✅ none |
| ORM changes | ✅ none |
| Deployment automation | ✅ none |
| Application source modified | ✅ no `src/` in Wave 5 |
| Auth / authorization changed | ✅ none |
| CI pipeline changed | ✅ no `ci.yml` / `package.json` script changes |
| Permission model changed | ✅ none |

---

## Validation output

```bash
npm test                 # 88/88 PASS
npm run ci:governance    # PASS
```

---

## Decision

Wave 5 complete. Database, schema, and data changes are now governed by a formal risk classification, rollback procedure, deployment checklist, and evidence template. Every production migration has a control plane before execution.
