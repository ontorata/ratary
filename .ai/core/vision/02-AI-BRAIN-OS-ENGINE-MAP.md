# Ratary OS — Engine Map

**Status:** Draft (2026-07-04)  
**Authority:** [01-COLLABORATIVE-MEMORY-PLATFORM.md](01-COLLABORATIVE-MEMORY-PLATFORM.md)

---

## In-repository engines

| Engine | Canonical phases | Responsibility |
|--------|------------------|----------------|
| **Memory** | 1–4, 04.7 | CRUD, context, consolidation, stewardship |
| **Knowledge** | 2.6, 8, 23 | Metadata, relations, graph, fabric ingest |
| **Retrieval** | 4, 6, 06.5 | Retriever, Ranker, composite sources |
| **Inference (ports)** | 5, 08.7 | Embeddings; graph/rule inference — not LLM reasoning |
| **Learning** | 08.5, 08.6 | Signals, policy learning, recommendations |
| **Platform** | 10.5, 12–20, 24 | Transport, events, SDK, cloud, marketplace |

## External OS layers (sibling products)

| Engine | Location | Ratary provides |
|--------|----------|-------------------|
| **Agent** | External (Phase 7) | MCP, REST, context API |
| **Model** | External (Models OS) | `IEmbeddingProvider`, `IMLProvider` ports |

## Dual-ID rule

- **Canonical IDs** (`08.6`, `11-production-ops`) — folders, ADRs, git history — **frozen** for implemented phases
- **OS narrative IDs** (Learning L21–L30, OS 1–50) — vision docs only

## OS roadmap tiers (narrative)

| Tier | Range | Theme |
|------|-------|-------|
| Foundation | 1–10 + 10.5 + 11 | Memory, knowledge, auth, retrieval, graph, enterprise |
| Intelligence | Extensions + 14 | Observation, compression, lifecycle, federation, learning |
| Platform | 12–20, 24 | SDK, gRPC, plugins, events, cloud, observability |
| Collaborative OS | 22–30 (see roadmap 13) | Workspace, fabric, sync, review, governance |
| Agents | 31–40 | **External** |
| Models | 41–50 | **External** |

See [14-OS-ROADMAP-1-50.md](../../phases/roadmap/14-OS-ROADMAP-1-50.md) for full reconciliation.
