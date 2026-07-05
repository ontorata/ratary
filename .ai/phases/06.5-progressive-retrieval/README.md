# Phase 6.5 — Progressive Retrieval

**Status:** ✅ Implemented (2026-07-04) · ADR-024 Accepted  
**Capability:** Staged, budget-aware context assembly — metadata → summary → body hydration gated by policy. **Pure policy port, no Retriever rewrite.**

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ N/A (no DDL) or prior phase |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04.*


---

## Stage model

| Stage | Default | Trigger |
|-------|---------|---------|
| metadata | Always | O-04-2 candidate projection |
| summary | Always | Title + summary in context |
| body | Off | MCP `content_mode=full` / `includeSummaryOnly=false` |
| vector | Off | `HYBRID_RETRIEVAL=true` |
| graph | Off | `GRAPH_RETRIEVAL=true` |

Deep graph BFS remains `traverse_relations` MCP tool — not auto-inlined. **By design** (ADR-024): hot path one-hop + composite leg; multi-hop = explicit MCP call.

Ops tuning for dense graphs: [docs/PANDUAN.md](../../../docs/PANDUAN.md) — *Tuning graph padat* (`RETRIEVAL_RELATION_NEIGHBOR_CAP`).

---

## Response shape

Context responses include optional additive field:

```json
{
  "context": "...",
  "memories": [...],
  "retrievalPlan": {
    "policyVersion": "1",
    "stagesApplied": ["metadata", "summary"],
    "hydrateBody": false,
    "budget": { "maxChars": 8000, "maxMemories": 10, ... }
  }
}
```

Manifest: `capabilities.supportsProgressiveRetrieval: true`, `retrieval.progressivePolicyVersion`.

---

## Related

- Phase 4 retriever/ranker: [04-memory-intelligence](../04-memory-intelligence/README.md)
- Phase 6 hybrid vector: [06-hybrid-retrieval](../06-hybrid-retrieval/README.md)
- Phase 5.5 compression levels: [05.5-semantic-compression](../05.5-semantic-compression/README.md)
