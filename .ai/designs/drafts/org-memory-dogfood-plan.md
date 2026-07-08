# Blueprint: org-memory-dogfood

| Field | Value |
|-------|-------|
| **Status** | Proposed — pending owner approval |
| **Branch** | `forge/org-memory-dogfood` |
| **Intent** | [org-memory-dogfood-intent.md](./org-memory-dogfood-intent.md) |
| **Isolate** | [org-memory-dogfood-isolate.md](./org-memory-dogfood-isolate.md) |
| **Evidence package** | `.ai/reviews/org-memory-dogfood/` |

## Task 1 — Activate P1-A governance metadata
- **Files:** `.ai/designs/drafts/org-memory-dogfood-intent.md`, `.ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md`, `.ai/sessions/CURRENT.md`
- **Do:** mark intent approved + isolate active; sync forge chain and CURRENT status.
- **Verify:** `rg "Approved|forge-isolate|org-memory-dogfood" .ai/designs/drafts/org-memory-dogfood-intent.md .ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md .ai/sessions/CURRENT.md`
- **Done when:** docs consistently show P1-A moved from intent-only to isolate-ready state.

## Task 2 — Define ingestion scope contract
- **Files:** `.ai/sync/ratary-sync-config.yaml`, `.ai/governance/ci/CI-RULES.md`, `.ai/reviews/org-memory-dogfood/ingestion-proof.md`
- **Do:** pin P1-A ingest sources, refresh strategy, and operational constraints for governance/ADR/releases/sessions.
- **Verify:** `rg "org-memory|ingest|handoff|governance" .ai/sync/ratary-sync-config.yaml .ai/governance/ci/CI-RULES.md .ai/reviews/org-memory-dogfood/ingestion-proof.md`
- **Done when:** ingest inputs and expected outputs are auditable and reproducible.

## Task 3 — Implement dogfood ingest runner + log schema
- **Files:** `scripts/sync-org-memory.ts`, `scripts/lib/org-memory-sync.ts`, `.ai/reviews/org-memory-dogfood/ingestion-log.md`
- **Do:** add repeatable ingest runner for P1-A sources with deterministic per-run log format.
- **Verify:** `npm run sync:org-memory` and `rg "run_id|source_path|ingested|failed" .ai/reviews/org-memory-dogfood/ingestion-log.md`
- **Done when:** one command performs ingest and emits structured evidence log.

## Task 4 — Recall evaluation harness (G2/G3/G4)
- **Files:** `scripts/eval-org-memory-recall.ts`, `.ai/reviews/org-memory-dogfood/recall-log.md`, `.ai/reviews/org-memory-dogfood/evidence-trace.md`
- **Do:** define canonical query set (ADR, release chain, governance Q&A), execute MCP recall, and capture answer-evidence mapping.
- **Verify:** `npm run eval:org-memory-recall` and `rg "G2|G3|G4|query|evidence" .ai/reviews/org-memory-dogfood/recall-log.md .ai/reviews/org-memory-dogfood/evidence-trace.md`
- **Done when:** recall quality can be re-run and compared across iterations.

## Task 5 — Session handoff + audit trace automation
- **Files:** `.ai/workflows/SESSION-HANDOFF.md`, `scripts/forge/remember-org-memory.ts`, `.ai/reviews/org-memory-dogfood/mcp-interaction-log.md`
- **Do:** standardize save_memory handoff flow so each session contributes searchable trace without manual stitching.
- **Verify:** `rg "save_memory|handoff|org-memory" .ai/workflows/SESSION-HANDOFF.md .ai/reviews/org-memory-dogfood/mcp-interaction-log.md`
- **Done when:** every P1-A work session yields consistent MCP interaction evidence.

## Task 6 — Internal usage metrics pipeline (G1/G5)
- **Files:** `scripts/metrics/org-memory-usage.ts`, `.ai/reviews/org-memory-dogfood/internal-usage-metrics.md`, `.ai/phases/04-proof-of-platform/OPERATING-MODEL.md`
- **Do:** publish minimum metrics set: ingest_count, recall_count, hit_rate, unresolved_queries, handoff_count, drift_incidents.
- **Verify:** `npm run metrics:org-memory` and `rg "ingest_count|recall_count|drift" .ai/reviews/org-memory-dogfood/internal-usage-metrics.md`
- **Done when:** metrics are generated from logs, not manual spreadsheet updates.

## Task 7 — Acceptance gate pack (G1–G6)
- **Files:** `.ai/reviews/org-memory-dogfood/acceptance-test.md`, `.ai/reviews/org-memory-dogfood/decision.md`, `.ai/governance/releases/P1-A-ORG-MEMORY-DOGFOOD.md`
- **Do:** compile gate evidence table, risk notes, and go/no-go decision document for forge-land.
- **Verify:** `rg "G1|G2|G3|G4|G5|G6|PASS|BLOCK" .ai/reviews/org-memory-dogfood/acceptance-test.md`
- **Done when:** P1-A completion can be judged from evidence package alone.

## Task 8 — CI and non-regression guard
- **Files:** `.github/workflows/ci.yml`, `package.json`, `scripts/ci/docs-impact-check.mjs`
- **Do:** wire P1-A scripts into existing governance CI without mutating P0 behavior.
- **Verify:** `npm run ci:governance` and `npm run test:identity`
- **Done when:** P1-A additions are continuously validated and P0 guardrails stay intact.

## Dependencies
- Task 1 before Tasks 2–8.
- Task 2 before Task 3 and Task 4.
- Task 3 before Task 6.
- Task 4 + Task 6 before Task 7.
- Task 8 can start after Task 1; final verification waits Tasks 3–7.

## Parallelizable groups
- **Group A (parallel):** Task 3, Task 4, Task 5
- **Group B (parallel):** Task 6, Task 8
- **Sequential gate:** Task 7 after A+B complete

## Owner approval gate
- Explicit approval required before `forge-execute`.
