# Phase 6.5 — Progressive Retrieval

**Status:** ✅ Implemented (2026-07-04) · ADR-024 Accepted  
**Capability:** Staged, budget-aware context assembly — metadata → summary → body hydration gated by policy. **Pure policy port, no Retriever rewrite.**

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Stage model, ports, data flow, invariants |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification evidence |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist — all tracks ✅ |

**ADR:** [ADR-024](../../../docs/adr/024-progressive-retrieval-policy.md)

---

## Stage model

| Stage | Default | Trigger |
|-------|---------|---------|
| metadata | Always | O-04-2 candidate projection |
| summary | Always | Title + summary in context |
| body | Off | MCP `content_mode=full` / `includeSummaryOnly=false` |
| vector | Off | `HYBRID_RETRIEVAL=true` |
| graph | Off | `GRAPH_RETRIEVAL=true` |

Deep graph BFS remains `traverse_relations` MCP tool — not auto-inlined.

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
