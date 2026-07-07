# Definition of Done — Ontorata Engineering

**Applies to:** All Ontorata repositories  
**Canonical protocol:** `.ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md` (maintainer workspace)  
**Cursor rule:** `.cursor/rules/ontorata-execution-governance.mdc`  
**Last updated:** 2026-07-08

---

## Organization rule

> **No Pull Request is complete until `.ai` and `docs` are synchronized.**

> **Implementation is incomplete until documentation is synchronized.**

Code alone is not Done.

---

## Mandatory completion flow

```
1. Change classification
2. Impact assessment
3. Code implementation
4. Documentation synchronization    ← mandatory
5. Test / evidence update
6. Completion report
```

**Forbidden:** Code complete → forgot docs → done.

---

## Documentation Impact Check

Before merge, classify impact:

| Category | Update if checked |
|----------|-----------------|
| No impact | State why in report |
| Governance | `.ai/core/governance/` |
| Architecture | ADR · `docs/architecture/` |
| Product | `.ai/core/product/` |
| Business | `.ai/core/business/` |
| API | OpenAPI · CHANGELOG |
| User documentation | `docs/` · README |
| Security | policies · `.env.example` |
| Operations | runbooks · deployment |

Phase 4: Evidence Package in `.ai/reviews/YYYY-MM-<slug>/`

---

## Merge flow

```
Implementation → Impact Analysis → Code → Documentation Sync → Validation → Completion Report → Merge
```

---

## Minimum PR requirements

| Requirement | All PRs | Significant changes |
|-------------|---------|---------------------|
| Documentation Impact Check in PR | ✅ | ✅ |
| Tests pass | ✅ | ✅ |
| Public `docs` updated if user/dev impact | ✅ | ✅ |
| CHANGELOG for user-visible changes | ✅ | ✅ |
| Repository boundary respected | ✅ | ✅ |
| Implementation Completion Report | Code changes | ✅ |
| ADR referenced or filed | — | ✅ |

---

## CI automation

`npm run ci:docs-impact` — warns when code changes without doc updates (warning phase; enforce later).

---

## Cursor agent role

Implementation engineer + documentation steward + governance assistant.

Session contract: `.ai/core/governance/SESSION-BOOTSTRAP.md`

---

## Related

- [constitution-summary.md](./constitution-summary.md)
- [GOVERNANCE-STATUS.md](./GOVERNANCE-STATUS.md)
