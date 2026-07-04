# Phase 20 — TESTING_PLAN

## Suite matrix

| Suite | Scope | Flags |
|-------|-------|-------|
| **Default regression** | Full `npm test` | OFF |
| **Port unit — IPluginRegistry** | register, enable, disable, list | In-memory |
| **Port unit — IPluginManifestValidator** | valid/invalid signature, schema | Fixture manifests |
| **Port unit — IProviderMarketplace** | browse, search, catalog version | Local JSON |
| **Port unit — IPluginAllowList** | tenant scoped filter | Mock control plane |
| **Integration — env fallback** | OFF → Phase 10 adapter selection | OFF |
| **Integration — plugin enable** | Enable storage plugin → CRUD works | ON |
| **Integration — plugin swap** | Disable A, enable B → compose reload | ON |
| **Integration — policy deny** | Phase 17 blocks forbidden plugin id | ON |
| **Integration — allow-list** | Phase 18 denies non-allowed plugin | ON |
| **Protocol parity — REST** | `/capabilities` infrastructure section | ON |
| **Protocol parity — gRPC** | GetCapabilities matches REST | ON |
| **Protocol parity — MCP** | Capability snapshot consistent | ON |
| **Protocol parity — SDK** | `getCapabilities()` matches server | ON + Phase 16 |
| **Plugin type coverage** | Each type: storage, embedding, vector, graph, llm | ON |
| **LLM boundary** | LLM plugin does not expose agent planner surface | Review + test |
| **Federation catalog** | Optional sync publishes metadata only | Flag ON |
| **Observability** | enable/disable emits Phase 19 metrics | ON |
| **MemoryService invariant** | No service diff; CRUD unchanged | OFF + ON |
| **Rollback** | OFF → env adapters; memory API identical | OFF |

## Reference plugin tests

| Plugin | Verify |
|--------|--------|
| storage-* | Memory CRUD round-trip |
| embedding-* | Embed + search smoke |
| vector-* | Vector upsert/query smoke |
| graph-* | Graph query smoke |
| llm-* | Inference port call only — no agent loop |

## Security tests

| Test | Expected |
|------|----------|
| Unsigned manifest register | Rejected |
| Tampered manifest | Rejected |
| Cross-tenant plugin enable | Denied |
| Admin route without Phase 17 auth | 401/403 |

## CI gates

- [ ] Unit + integration pass
- [ ] Manifest schema lint job
- [ ] Protocol parity test job
- [ ] Default regression required for merge

## Manual verification

- [ ] Plugin authoring guide followed by reviewer (clean room)
- [ ] Marketplace catalog reviewed by owner
- [ ] Enterprise capstone demo: SDK + CLI + Dashboard capability view
