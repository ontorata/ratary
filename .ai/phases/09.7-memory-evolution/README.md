# Phase 09.7 — Memory Evolution & Version Control

**Status:** ✅ Implemented (2026-07-04) · ADR-040 Accepted  
**Capability:** Immutable version chain, history, diff, merge policy — **domain versioning**, not REST v2.

**Flag:** `MEMORY_EVOLUTION_ENABLED=false` (default)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Side-store model, ports, invariants |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |

**ADR:** [ADR-040](../../../docs/adr/040-memory-evolution-version-control.md)

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
