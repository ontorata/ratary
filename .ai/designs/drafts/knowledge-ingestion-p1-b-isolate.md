# P1-B Knowledge Ingestion — Forge Isolate

| Field | Value |
|-------|-------|
| **Branch** | `forge/knowledge-ingestion` |
| **Baseline tag** | `org-memory-p1-a-complete` |
| **Tag object** | `15fca29a4a43914778b67b24ae8498331a9e983e` |
| **Baseline commit** | `f52b0bea31ae492405970c88cc5aa24050001bc3` |
| **Intent** | [knowledge-ingestion-p1-b-intent.md](./knowledge-ingestion-p1-b-intent.md) — approved |
| **Verification timestamp** | `2026-07-08T13:31:19.2361244+07:00` |
| **Status** | ✅ Isolate active — ready for blueprint |

---

## Pre-flight checklist

- [x] Baseline from `org-memory-p1-a-complete`
- [x] Intent approved and used as single reference
- [x] Scope and out-of-scope explicit
- [x] Acceptance gates G1-G6 defined
- [x] Definition of Done defined
- [x] Initial metric model defined

---

## Change boundary (allowed in P1-B)

1. `scripts/sync-org-memory.ts`
2. `scripts/lib/org-memory-sync.ts`
3. `scripts/metrics/org-memory-usage.ts`
4. `scripts/eval-org-memory-recall.ts` (only where needed for ingest->recall-ready trace integrity)
5. `scripts/forge/remember-org-memory.ts` (trace schema evolution)
6. `scripts/ci/org-memory-acceptance-check.mjs` (acceptance guard compatibility only)
7. `package.json` (official command wiring)
8. `.ai/reviews/org-memory-dogfood/*` (evidence, acceptance, quality artifacts)
9. `.ai/designs/drafts/knowledge-ingestion-p1-b-*` (intent/blueprint/isolate docs)
10. `.ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md`
11. `.ai/sessions/CURRENT.md`
12. `.ai/governance/releases/*` (when acceptance/closeout stage starts)

---

## Explicit no-touch components (during isolate + before blueprint approval)

1. `src/` runtime implementation files
2. Identity/auth boundaries from P0-A/P0-B
3. Public SDK behavior unrelated to ingestion milestone
4. Ontorata Studio / Marketplace feature surfaces
5. P0 constitutional artifacts except policy reference

---

## Dependency map (ingestion pipeline)

```text
Sources (.ai/core, governance, releases, sessions handoff)
  -> scripts/sync-org-memory.ts
    -> scripts/lib/org-memory-sync.ts
      -> .ai/reviews/org-memory-dogfood/ingestion-log.md
      -> digest + source counters
  -> scripts/eval-org-memory-recall.ts
    -> .ai/reviews/org-memory-dogfood/recall-log.md
    -> .ai/reviews/org-memory-dogfood/evidence-trace.md
  -> scripts/forge/remember-org-memory.ts
    -> .ai/reviews/org-memory-dogfood/mcp-interaction-log.md
  -> scripts/metrics/org-memory-usage.ts
    -> .ai/reviews/org-memory-dogfood/internal-usage-metrics.md
  -> scripts/ci/org-memory-acceptance-check.mjs
    -> validates G1-G6 manifest integrity
```

---

## Baseline verification (must pass before implementation)

| Command | Result |
|---------|--------|
| `npm test` | ✅ PASS — 23 files / 88 tests |
| `npm run ci:org-memory-acceptance` | ✅ PASS |
| `npm run ci:governance` | ✅ PASS |

Notes:
- During verification, acceptance guard failed once because manifest status moved to `CLOSED`; fixed at boundary (`scripts/ci/org-memory-acceptance-check.mjs`) to accept `PASS|READY|COMPLETE|CLOSED`, then re-verified green.

---

## Risks and assumptions

### Risks
1. Ingestion quality drift when source volume grows (duplicate/invalid metadata pressure).
2. Trace completeness can regress if one stage writes non-canonical IDs.
3. Organization isolation checks might be under-covered if only happy path is tested.

### Assumptions
1. P1-B closeout remains single-org (Ontorata) per approved intent.
2. Retry policy baseline uses max 2 retries with light exponential backoff.
3. End-to-end latency metric uses explicit state transition events as canonical source.

---

## Exit criteria (isolate -> blueprint)

- [x] Change boundary documented
- [x] No-touch component list documented
- [x] Dependency map documented
- [x] Risks and assumptions documented
- [x] Baseline verification recorded with tag/branch/commit/timestamp
- [x] No P1-B feature implementation started before blueprint approval

**Ready for forge-blueprint:** ✅ proceed.
