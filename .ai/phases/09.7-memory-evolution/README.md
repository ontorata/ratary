# Phase 09.7 — Memory Evolution & Version Control

**Status:** ✅ Implemented (2026-07-04) · ADR-040 Accepted  
**Capability:** Immutable version chain, history, diff, merge policy — **domain versioning**, not REST v2.

**Flag:** `MEMORY_EVOLUTION_ENABLED=false` (default)

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ Complete |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04.*


---

## Quick start

```bash
# Enable in .env
MEMORY_EVOLUTION_ENABLED=true
MEMORY_EVOLUTION_STORE_PROVIDER=sql

# List version history for a memory
npm run evolution:history -- --memory=<uuid> --owner=<ownerId>

# REST (when enabled)
GET /api/v1/memory/:id/versions
GET /api/v1/memory/:id/versions/:version/diff?against=current
```

Updates automatically archive pre-update snapshots when evolution is enabled. `memories` row remains the **Current** head.

---

## Related

- Phase 04.7 duplicate rollup (distinct): [04.7-memory-stewardship](../04.7-memory-stewardship/README.md)
- Phase 09.8 multi-client sync (branch merge): [09.8-multi-client-sync](../09.8-multi-client-sync/README.md)
