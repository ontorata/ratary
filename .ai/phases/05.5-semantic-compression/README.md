# Phase 5.5 — Semantic Compression

**Status:** ✅ Implemented (2026-07-04) · ADR-023 Accepted  
**Capability:** Formal compression policy port, hierarchical summaries via relations, compression metadata audit trail. **Archive, never destroy.**

**Flag:** `COMPRESSION_ENABLED=false` (default)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Approved design: ports, data flow, policy matrix, invariants |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy and evidence |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist — all tracks ✅ |
| [MIGRATION.md](MIGRATION.md) | Schema columns and rollback |

**ADR:** [ADR-023](../../../docs/adr/023-semantic-compression-policy.md)

---

## Quick start

```bash
# Enable in .env
COMPRESSION_ENABLED=true

# Dry-run — reports candidates, no mutations
npm run compress:memories

# Execute — creates summaries, archives duplicates, writes compression_meta
npm run compress:memories:execute
```

Manifest reports `capabilities.supportsSemanticCompression: true` when flag enabled.

---

## Related

- Phase 4 consolidator baseline: [04-memory-intelligence](../04-memory-intelligence/README.md)
- Phase 04.7 stewardship wraps same consolidator: [04.7-memory-stewardship](../04.7-memory-stewardship/README.md)
