# Phase 4 Production Metrics (operator surface)

**Knowledge SoT:** [docs-ai](https://github.com/ontorata/docs-ai) → `reviews/org-memory-dogfood/production-workload-registry.json`

Phase 4 north star and proof metrics:

| Metric | Meaning |
|--------|---------|
| `production_workloads` | Trusted workloads eligible for north star |
| `production_organizations` | Trusted production organizations |

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run metrics:production` | Aggregate registry + live dogfood signals → `production-metrics.json` |
| `npm run ci:production-metrics-check` | Verify registry and latest snapshot exist |

## Registry

Edit `docs-ai/reviews/org-memory-dogfood/production-workload-registry.json` when onboarding a new org or workload. Set `trusted: true` and `type: external` only after acceptance evidence exists.

External org count stays **0** until onboarding (option A) completes — tracked as `phase4_exit_gap_external_org` in the snapshot.

## Weekly loop (with P1-E runway)

```bash
npm run metrics:operational-proof
npm run metrics:production
npm run checkpoint:operational-proof
npm run ci:production-metrics-check
```

See also [ORG-MEMORY-INGESTION.md](./ORG-MEMORY-INGESTION.md) and docs-ai [OPERATIONAL-RUNWAY.md](https://github.com/ontorata/docs-ai/blob/main/reviews/org-memory-dogfood/OPERATIONAL-RUNWAY.md).
