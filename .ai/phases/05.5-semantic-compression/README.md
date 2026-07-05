# Phase 5.5 — Semantic Compression

**Status:** ✅ Implemented (2026-07-04) · ADR-023 Accepted  
**Capability:** Formal compression policy port, hierarchical summaries via relations, compression metadata audit trail. **Archive, never destroy.**

**Flag:** `COMPRESSION_ENABLED=false` (default)

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
COMPRESSION_ENABLED=true

# Dry-run — reports candidates, no mutations
npm run compress:memories

# Execute — creates summaries, archives duplicates, writes compression_meta
npm run compress:memories:execute
```

Manifest reports `capabilities.supportsSemanticCompression: true` when flag enabled.

Async scheduler (`COMPRESSION_SCHEDULER=local`): jobs enqueue via `LocalCompressionScheduler` and drain with `runPending` — LLM summarizer work stays off the CRUD hot path (D55-01).

---

## Related

- Phase 4 consolidator baseline: [04-memory-intelligence](../04-memory-intelligence/README.md)
- Phase 04.7 stewardship wraps same consolidator: [04.7-memory-stewardship](../04.7-memory-stewardship/README.md)
