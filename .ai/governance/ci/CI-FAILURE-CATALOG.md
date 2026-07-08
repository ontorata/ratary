# CI Failure Catalog

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 2 |
| **Purpose** | Failure reason → remediation path |

---

## Test failures (CI-01 · CI-02 · CI-03)

| Symptom | Likely cause | Remediation |
|---------|--------------|-------------|
| Identity test failure | Tenant/permission regression | Fix implementation; do not weaken tests |
| E2E failure | Studio header / auth path drift | Fix client or server scope propagation |
| Unrelated test failure | Baseline drift on branch | `forge-diagnose` · fix or rebase on green baseline |

---

## ADR impact failure (CI-04)

```
❌ ADR IMPACT CHECK FAILED
Architecture-boundary paths changed without ADR decision record
```

| Remediation |
|-------------|
| Amend relevant ADR under `.ai/core/architecture/` (ADR-0001–0004) |
| Or add cross-product ADR under `.ai/core/adr/` |
| Update `docs/architecture/governance/adr-index.md` |
| Reference ADR in PR template |

---

## Docs / governance impact failure (CI-05)

```
❌ DOCUMENTATION / GOVERNANCE IMPACT CHECK FAILED
Code changed but no docs/ or .ai/ update detected
```

| Remediation |
|-------------|
| Update `docs/` for user-visible changes |
| Update `.ai/` for governance · ADR · evidence · acceptance |
| Complete Implementation Completion Report in PR |
| If truly no impact → still update `.ai/reviews/` or governance note explaining why (prefer explicit evidence) |

**Example:** `src/auth/permission-context.ts` changed → require ADR-0003 amendment + `.ai/` evidence + identity tests green.

---

## Permission contract failure (CI-06)

```
❌ PERMISSION CONTRACT CHECK FAILED
Permission count mismatch / Permission mismatch
```

| Remediation |
|-------------|
| Revert unauthorized permission string changes |
| Or amend ADR-0003 + `PERMISSION-CONTRACT.md` + identity tests |

```
Permission-related auth files changed without ADR decision record
```

| Remediation |
|-------------|
| Add ADR amendment to diff before merge |
| Run `npm run test:identity` locally |

---

## Local reproduction

```bash
npm run ci:governance
```

Individual checks:

```bash
npm run ci:adr-impact
npm run ci:docs-impact
npm run ci:permission-contract
```

---

## Related

- [CI-RULES.md](./CI-RULES.md)
- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)
