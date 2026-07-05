# Cross-phase debt register

Living closure status for deferred items from closed phase gates. **Authority:** complements `.ai/phases/*/COMPLETION.md` in the governance mirror.

Last updated: 2026-07-06

---

## Closed in this release

| ID | Item | Resolution |
|----|------|------------|
| **T-05** | D1 in-process graph BFS reloads all owner edges per seed | **Mitigated** — `D1GraphAdapter` caches owner edge list per process (`edgeCache`); use `GRAPH_PROVIDER=neo4j` at scale |
| **T-06** | Audit identity missing on `context.build` | **Closed** — `buildContextAuditFields()` passes `auditIdentityId` / IP from REST, MCP, gRPC |
| **T-07** | `GET /memory/:id` not audited | **Closed** — `auditMemoryRead()` on getById / codename / slug when `MEMORY_ACCESS_AUDIT=true` |
| **D85-01** | MCP `submit_signal` | **Closed** — MCP tool + REST `POST /api/v1/signals` |
| **D85-02** | Event bus publish on signal ingest | **Closed** — `processSignalIngest` → `LearningEventRecorder` + `DomainEventPublisher` |
| **D85-03** | Batch ranker weight mutation | **Accepted** — `RANKING_ADAPTATION_ENABLED=false` default; `npm run reflect:signals` |
| **D85-04** | Rank order E2E gap | **Closed** — `src/memory/ranker.test.ts` |
| **D85-05** | REST signals route tests | **Closed** — legacy mirror `tests/api/signals.test.ts` |
| **D85-06** | `lifecycleState` on GET memory | **Closed** — `toMemoryResponse()` exposes field when set |
| **D8-02** | Vector seeds for graph retrieval | **Closed** — `GRAPH_VECTOR_SEEDS_ENABLED=true` uses vector leg as graph seeds |
| **D8-03** | Neptune / Dgraph adapters | **Mitigated** — `GRAPH_PROVIDER=neptune` + `NeptuneGraphProvider` stub; production use `neo4j` or `d1` |

---

## Still open (future phases)

| ID | Item | Target |
|----|------|--------|
| — | Google Drive live connector | Post–Phase 29 roadmap |
| — | Neptune Gremlin traversal implementation | Future graph phase |
| — | Full OpenAPI codegen for 7 SDK languages (Java on machine) | SC-28-02 — run `npm run generate:sdks` with Java 11+ |

---

## Enterprise modules

All Phase **10.5–25** and extension tracks (**4.7, 5.5–9.8, 6.6, 7.1, 8.8**) are **implemented in code** and **default OFF**. Enable via env — see [ENTERPRISE-MODULES.md](ENTERPRISE-MODULES.md).

---

*Public mirror · governance source: `lutfi04/ai-brain` `.ai/phases/roadmap/10-POST-ROADMAP.md`*
