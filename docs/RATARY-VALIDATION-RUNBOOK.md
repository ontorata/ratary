# Ratary validation runbook

> Public mirror of the org-memory dogfood validation procedure. Internal evidence lives in `.ai/reviews/org-memory-dogfood/` (maintainer workspace).

Last updated: 2026-07-19

---

## When to run

- Before merging org-memory or recall-intelligence changes
- After updating `.ai/` ingest sources or recall fixtures
- Phase 4 dogfood checkpoint (weekly or on milestone close)

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| Node.js 24.x | `node -v` |
| Dependencies | `npm ci` |
| Env | Copy from `.env.example` — D1/API keys as needed for live MCP (optional for CI scripts) |
| Maintainer `.ai/` tree | Required for `sync:org-memory` full corpus |

---

## Full validation (recommended)

```bash
npm run ci:ratary-validation
```

This runs, in order:

1. `npm run lint`
2. `npm run ci:governance` — tests · identity · e2e · adr/docs impact · permission contract
3. `npm run ci:org-memory-acceptance`
4. `npm run ci:recall-intelligence-acceptance`
5. `npm run sync:org-memory`
6. `npm run eval:org-memory-recall`
7. `npm run eval:recall-intelligence`
8. `npm run metrics:org-memory`
9. `npm run proof:org-memory-wave5`

---

## Expected outcomes

| Check | Pass criteria |
|-------|---------------|
| Tests | All vitest suites green |
| Org-memory G1–G6 | Script exits 0 |
| Recall intelligence G1–G7 | Script exits 0 |
| Sync | `failed=0` · placeholder `.gitkeep` files counted as `skipped` (P1-E) |
| Eval scripts | `pass_rate=100` |
| Wave 5 proof | Updates `WAVE-5-END-TO-END-PROOF.md` without error |

---

## Operational proof checkpoint (P1-E)

Weekly operator loop after engineering validation passes:

```bash
npm run trace:dogfood-session -- --tools search_memory,save_memory --query "<session summary>"
npm run metrics:operational-proof
npm run checkpoint:operational-proof
npm run ci:operational-proof-acceptance
```

Artifacts (maintainer `.ai/` workspace): `operational-usage-log.md`, `operational-metrics.json`, `operational-checkpoints.md`.

---

## Memory decay stage (PI-A — disabled by default)

Stewardship stage #10 (`decay-scoring`) ships **flag-off** (`DECAY_SCORING_ENABLED=false`)
and must stay off during the P1-E operational window. Validation expectations:

- With the flag off (default): `run_stewardship` reports the stage as `skipped`
  and no retrieval/ranking behavior changes — the checks above must pass unchanged.
- With the flag on (post-freeze, owner decision): run `run_stewardship` in
  dry-run first and review the `decay-scoring` findings (intended transitions)
  before applying.

Model and worked numbers: [scoring.md](scoring.md). Unit suite: `npx vitest run tests/decay`.

---

## Package builds (optional)

```bash
npm run test:packages
npm run build:packages
```

---

## Troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| `ci:docs-impact` fails on clean `main` | Stale baseRef bug (fixed 2026-07-18) | Pull latest `scripts/ci/docs-impact-check.mjs` |
| `sync:org-memory` failed&gt;0 | Unexpected ingest failure | Check `ingestion-log.md` exclude audit; pull P1-E ingest hygiene |
| `sync:org-memory` skipped=4 | Pilot `.gitkeep` placeholders | Expected — audited skip, not failure |
| Eval pass_rate &lt; 100 | Fixture drift or ingest incomplete | Re-run sync; check `ingestion-log.md` |

---

## Evidence location (maintainers)

Internal report: `.ai/reviews/org-memory-dogfood/RATARY-FULL-VALIDATION-2026-07-18.md`

Sync config: `.ai/sync/ratary-sync-config.yaml`
