# Org Memory — Knowledge Ingestion (operator surface)

**Knowledge SoT:** [docs-ai](https://github.com/ontorata/docs-ai) → `reviews/org-memory-dogfood/` · ADR-0005 → `architecture/identity-and-kernel/ADR-0005-knowledge-ingestion-pipeline.md`

P1-B ingestion scripts resolve evidence via `scripts/lib/org-memory-paths.ts`:

- **Primary:** sibling `../docs-ai/reviews/org-memory-dogfood/`
- **Fallback:** legacy `.ai/reviews/org-memory-dogfood/` (isolated worktrees / CI)

Override with `DOCS_AI_ROOT` when docs-ai is not a sibling checkout.

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run sync:org-memory` | Run Knowledge OS ingestion pipeline |
| `npm run metrics:org-memory` | Emit P1-A + P1-B usage metrics |
| `npm run proof:org-memory-wave5` | Regenerate Wave 5 end-to-end proof |
| `npm run ci:org-memory-acceptance` | Gate on P1-A acceptance manifest |
| `npm run eval:org-memory-recall` | Deterministic recall fixture eval |
| `npm run trace:org-memory-handoff` | Append MCP handoff trace |

Acceptance evidence and release records are maintained in **docs-ai**, not in this repo.
