# Phase 10.5 — Transport & Connectivity — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```


**Current regression:** 689 passed | 3 skipped (default env, 2026-07-04)

---

## Unit & integration tests

| File | Coverage |
|------|----------|
| `tests/transport/handler-parity.test.ts` | REST/MCP parity — create, search, list, context, capabilities, graph, relations (8 cases) |
| `tests/transport/transport-shared.test.ts` | TransportContext, scope resolution, error mapping |
| `tests/transport/layer-boundaries.test.ts` | No transport imports in `services/` |
| `tests/transport/transport-registry.test.ts` | Registry lifecycle |
| `tests/transport/grpc-transport.test.ts` | Proto mappers, service bindings |
| `tests/transport/grpc-boot.test.ts` | Ephemeral port boot when gRPC enabled |
| `tests/transport/grpc-e2e.test.ts` | **D105-01** — live `@grpc/grpc-js` client: Health, Memory CRUD, Search, Context stream |
| `tests/capabilities/manifest-contract.test.ts` | `transport` section (REST/MCP/gRPC/sdk) |

---

## Handler inventory (≥10 requirement)

| Group | Handlers | Count |
|-------|----------|-------|
| Memory | create, getById, getByCodename, getBySlug, update, delete, list, search, listProjects, listTags, toggleFavorite, archive, exportBackup, importBackup, replaceBackup | 15 |
| Context | buildContext, buildPrompt | 2 |
| Capabilities | getManifest | 1 |
| Graph | getCapabilities, traverse | 2 |
| Relations | list, create, delete | 3 |
| **Total** | | **23** |

---

## E2E (default env)

REST suites unchanged and green: `tests/api.test.ts`, `tests/api/knowledge.test.ts`, `tests/api/auth.test.ts`, cross-scope leak suites.

MCP: `tests/mcp/tools.test.ts` — 20 tools unchanged.

---

## gRPC E2E (D105-01)

`tests/transport/grpc-e2e.test.ts` starts `GrpcTransportServer` on ephemeral port and exercises all four v1 services via real `@grpc/grpc-js` clients with `owner-id` metadata.

---

## Optional gRPC job

gRPC boot test runs on ephemeral port; not required for default CI gate when `GRPC_ENABLED=false`.

---

## Deferred

- ~~Full gRPC E2E against live client~~ → **D105-01 closed** (2026-07-05)
- Transport benchmark CLI (Phase 13) — shipped in Phase 13
