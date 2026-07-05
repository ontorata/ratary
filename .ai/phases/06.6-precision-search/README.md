# Phase 6.6 — Precision Search Platform

**Status:** ✅ Gate PASS (2026-07-05) · waves 6.6A–E · commit `66d72dc` · default OFF  

**Capability:** Explicit search modes, multi-query RRF, knowledge surface (aliases/path/links), scope/tag grammar, similar-memory lookup, optional cross-encoder rerank, and offline embedding path — **without** vault-CLI coupling or agent runtime in repo.

**Master flag:** `PRECISION_SEARCH_ENABLED=false` (default)

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Approved · waves landed |
| [DELIVERY-TRACK.md](DELIVERY-TRACK.md) | Incremental ship order (06.6A–E) | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Shipped modules and wiring | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ Shipped (D1 + schema.sql) |
| [TESTING.md](TESTING.md) | Verification strategy and evidence | ✅ 804 tests green (flag OFF default) |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Gate PASS (2026-07-05) |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Gate PASS (2026-07-05) |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Finalized |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Gate closed |
| [RISKS.md](RISKS.md) | Risk register | ✅ Reviewed at implementation |

---

## Why this phase

Phase 6 delivers **multi-source RRF retrieval** for LLM context. Phase 6.5 delivers **progressive hydration**. Neither exposes **user/agent-selectable search modes**, **multi-query fan-out**, **alias-aware lexical ranking**, **similar-by-memory**, or **reranking** — gaps identified when comparing vault-native hybrid search UX to Ratary's memory platform.

Phase 6.6 closes that gap while preserving Ratary's model: **memories**, not markdown files — with optional `source_path` for vault/connector parity.

---

## Delivery waves (summary)

| Wave | Focus | Status |
|------|--------|--------|
| **06.6A** | Schema surface + filter grammar | ✅ |
| **06.6B** | Search modes + REST/MCP API | ✅ |
| **06.6C** | Multi-query RRF + snippets | ✅ |
| **06.6D** | Similar memory + graph direction + path read | ✅ |
| **06.6E** | Rerank + local embeddings (opt-in) | ✅ |

Detail: [DELIVERY-TRACK.md](DELIVERY-TRACK.md)

---

## Related phases

| Phase | Relationship |
|-------|----------------|
| [06-hybrid-retrieval](../06-hybrid-retrieval/README.md) | Vector + SQL RRF legs |
| [06.5-progressive-retrieval](../06.5-progressive-retrieval/README.md) | Context assembly — unchanged hot path |
| [05-embedding](../05-embedding/README.md) | Embedding provider port (+ local adapter) |
| [08-knowledge-graph](../08-knowledge-graph/README.md) | Relations / traverse |
| [21-search-graph-prod](../21-search-graph-prod/README.md) | Meilisearch sync leg |
| [16-developer-platform](../16-developer-platform/README.md) | CLI search UX |

---

## ADR

[ADR-060 — Precision Search Platform](../../adr/060-precision-search-platform.md) — **Implemented** (2026-07-05)
