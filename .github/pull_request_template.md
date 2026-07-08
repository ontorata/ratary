## Summary

<!-- What changed and why -->

## Type

- [ ] Code (behavior change)
- [ ] Documentation only
- [ ] Dependencies / tooling
- [ ] Security / infrastructure

## Documentation Impact Check

> If any category except **No impact** is checked, that documentation MUST be updated before merge.

- [ ] **No impact** (explain in Completion Report)
- [ ] Governance (`.ai/core/governance/`)
- [ ] Architecture (ADR · RFC · blueprints · `docs/architecture/`)
- [ ] Product (`.ai/core/product/`)
- [ ] Business (`.ai/core/business/` — private)
- [ ] API (OpenAPI · CHANGELOG · contract docs)
- [ ] User documentation (`docs/` · README)
- [ ] Security (policies · `.env.example`)
- [ ] Operations (runbooks · deployment)

Phase 4 evidence package (if applicable): `.ai/reviews/YYYY-MM-<slug>/`

## Ontorata Definition of Done

> **No PR is complete until `.ai` and `docs` are synchronized.**

> **Implementation is incomplete until documentation is synchronized.**

See [docs/architecture/governance/definition-of-done.md](docs/architecture/governance/definition-of-done.md)

### Mandatory flow

```
Change classification → Impact assessment → Code → Documentation sync → Validation → Completion report
```

### Architecture impact

- [ ] Architecture Impact Review performed (what / why / API / security / AI / Ontory-compat)
- [ ] Repository boundary respected (Ratary · Studio · Auth · Marketplace)
- [ ] ADR-014: no provider conditionals or SDK in business layer
- [ ] ADR-012: `owner_id` on customer data paths (Ratary)

**ADR reference (required when touching identity / tenant / permission / transport paths):**

- ADR ID or file: <!-- e.g. ADR-0003 amendment · ADR-0004 -->
- Paths touched: <!-- src/auth · src/scope · MCP remote · tests/identity -->
- `npm run ci:adr-impact` pass: ⬜ / ✅

Identity foundation ADRs: `.ai/core/architecture/ADR-0001` … `ADR-0004` · map: `.ai/core/governance/ARCHITECTURE-CHANGE-MAP.md`

### Governance synchronization

- [ ] Public `docs/` updated (README, API, CHANGELOG, migration — as applicable)
- [ ] Private `.ai/` reviewed/updated (ADR, RFC, blueprint, standards, policies — maintainers)
- [ ] ADR referenced, extended, or filed (significant architecture changes)
- [ ] RFC updated if implementation differs from proposal

### Quality

- [ ] `npm run lint` and `npm run build` pass (code changes)
- [ ] Tests added/updated
- [ ] Docs-only PRs preserve `.env.example` variables (no keys added/removed without code)
- [ ] CHANGELOG.md updated (user-visible server changes)

### UI/UX (Studio · Ontory · packages/ui only)

- [ ] Official design tokens (no hardcoded palette)
- [ ] Official design system components
- [ ] Accessibility checked
- [ ] Responsive verified
- [ ] Desktop guideline followed (Studio)

See `.ai/core/product/DESIGN-SYSTEM.md`

### Completion report

- [ ] **Implementation Completion Report** included below (required for code changes)

---

## Implementation Completion Report

<!-- Template: .ai/core/governance/COMPLETION-REPORT-TEMPLATE.md -->

**Change:**

**Files changed:**

**Architecture impact:**

**Documentation updated:** (`.ai` paths · `docs` paths)

**Documentation impact categories:**

**Evidence produced:**

**Tests / validation:**

**Remaining risks:**

**Ready for merge:** ⬜ / ✅
