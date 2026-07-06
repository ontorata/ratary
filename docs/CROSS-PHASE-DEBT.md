# Cross-phase debt register

> **Maintainer / internal register** — not required reading for installing or running Ratary.  
> Authority for contributors: governance mirror `lutfi04/ai-brain` `.ai/phases/`.  
> OSS users: see [CHANGELOG.md](../CHANGELOG.md) for release scope.

Living closure status for deferred items from closed phase gates.

Last updated: 2026-07-06

---

## Closed in this release

| ID | Item | Resolution |
|----|------|------------|
| **T-05** | D1 in-process graph BFS reloads all owner edges per seed | **Mitigated** — `D1GraphAdapter` caches owner edge list per process (`edgeCache`); use `GRAPH_PROVIDER=neo4j` at scale |
| **T-06** | Audit identity missing on `context.build` | **Closed** — `buildContextAuditFields()` passes `auditIdentityId` / IP from REST, MCP, gRPC |
| **T-07** | `GET /memory/:id` not audited | **Closed** — `auditMemoryRead()` on getById / codename / slug when `MEMORY_ACCESS_AUDIT=true` |
| **D85-04** | Rank order E2E gap | **Closed** — `src/memory/ranker.test.ts` |
| **D8-02** | Vector seeds for graph retrieval | **Closed** — `GRAPH_VECTOR_SEEDS_ENABLED=true` uses vector leg as graph seeds |
| **D8-03** | Neptune / Dgraph adapters | **Mitigated** — `GRAPH_PROVIDER=neptune` + `NeptuneGraphProvider` stub; production use `neo4j` or `d1` |
| **Fabric** | Google Drive live connector | **Closed** — `DriveLiveConnector` + service-account JWT auth |

---

## Still open (future)

| Item | Target |
|------|--------|
| Neptune Gremlin traversal implementation | Phase **33** — [.ai/phases/33-neptune-graph-traversal/](../.ai/phases/33-neptune-graph-traversal/README.md) |
| Full OpenAPI codegen for 7 SDK languages | Requires Java 11+ on maintainer machine |

---

## Enterprise modules

All Phase **10.5–25** extension tracks are **implemented in code** and **default OFF**. See [ENTERPRISE-MODULES.md](ENTERPRISE-MODULES.md).

---

*Public mirror · not a user-facing install guide.*
