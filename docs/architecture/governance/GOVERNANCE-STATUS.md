# Governance Status (Public Mirror)

**Status:** Completed — Phase 1 Foundation Governance  
**Date:** 2026-07-07  
**Canonical checkpoint:** `.ai/core/governance/GOVERNANCE-STATUS.md`

---

## Completed

- ✅ Engineering Constitution established
- ✅ ADR system established (006–009)
- ✅ Native Auth Gateway documented
- ✅ Studio auth boundary clarified
- ✅ Zitadel → federation option
- ✅ AI boundary, data, and model governance ADRs filed

---

## Architecture authority (order)

1. Engineering Constitution
2. ADR documents
3. Product documentation
4. Implementation

---

## Current stack position

```
                 Ontorata
        Engineering Constitution
         ┌──────────┴──────────┐
      Ratary                Studio
   AI Brain Platform    Enterprise Builder
         └──────────┬──────────┘
              Auth Gateway
    Native Auth + OIDC Federation
```

---

## Next governance focus

1. Observability (auth audit → SIEM)
2. AI evaluation governance
3. Data governance **implementation**
4. Model governance **implementation**
5. Security compliance

---

## Repository layers

| Layer | Path | In git? |
|-------|------|---------|
| AI agent authority | `.ai/core/` | No (gitignored) |
| Public engineering | `docs/architecture/governance/` | **Yes** |

See [constitution-summary.md](./constitution-summary.md) · [adr-index.md](./adr-index.md).
