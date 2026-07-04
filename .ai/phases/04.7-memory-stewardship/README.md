# Phase 04.7 — Self-Managing Memory Stewardship

**Status:** ✅ Implemented (2026-07-04) · ADR-045 Accepted  
**Capability:** Deterministic maintenance pipeline — duplicates, merge, compress, archive, audit graph/metadata/embeddings, optimize retrieval. **No planner. No agent. No LLM.**

**Flag:** `MEMORY_STEWARDSHIP_ENABLED=false` (default)

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

## What it does

Runs maintenance tasks in a fixed, reproducible order behind three ports (`IMaintenanceTask`, `IMemoryStewardshipOrchestrator`, `IStewardshipRunStore`). Composes the existing `MemoryConsolidator` plus read-only health audits; dry-run by default; every run is recorded.

- Code: `src/memory/stewardship/**`, composition `src/composition/create-memory-stewardship-ports.ts`
- CLI: `npm run steward:memories` (dry-run) · `npm run steward:memories:execute`

---

## Guarantees

- `MemoryService` / repositories / storage ports unchanged.
- No new persistence schema (run history is in-memory by default, swappable via `IStewardshipRunStore`).
- A failing task is isolated; the rest of the pipeline still completes.

---

## Quick start

```bash
# Dry-run — reports only, no mutations
npm run steward:memories

# Execute — archives duplicates, creates summaries, etc.
npm run steward:memories:execute
```

Enable capability flag (optional):

```env
MEMORY_STEWARDSHIP_ENABLED=true
```

Manifest then reports `capabilities.supportsSelfManagement: true`.
