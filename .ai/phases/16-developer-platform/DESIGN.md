# Phase 16 — Developer Platform — DESIGN

**Document:** DESIGN · **ADR:** [ADR-031](../../adr/031-developer-platform.md) · **Status:** Awaiting approval

---

## 1. Mengapa phase ini diperlukan?

Enterprise adoption requires **developer-grade tooling**: typed SDKs, CLI, installable MCP, templates. Without Phase 16, every integrator reimplements HTTP/gRPC/MCP glue → **API drift**, duplicated logic, poor DX.

## 2. Mengapa tidak digabung dengan phase lain?

| Phase | Why separate |
|-------|--------------|
| 13 Protocol | Server-side adapters — not client SDK |
| 15 Agent Ecosystem | Client **catalog** metadata — not generated libraries |
| 17 Security | Auth/policy — SDK **consumes** tokens, doesn't define SSO |
| 20 Infrastructure | Marketplace capstone — SDK is **consumer SDK**, not plugin registry |

**Coupling avoided:** SDK generation ≠ protocol implementation ≠ security policy.

---

## 3. Scope

### In scope (`packages/` monorepo slice — **no business logic**)

| Deliverable | Detail |
|-------------|--------|
| **OpenAPI Generator pipeline** | SSOT: `GET /docs/json` + checked-in openapi snapshot |
| **Proto generator** | From Phase 13 `ai.brain.v1` |
| **SDK — TypeScript** | `@ai-brain/sdk` — reference implementation |
| **SDK — Go, Python, Java, Rust, C#, PHP** | Generated + thin runtime wrapper |
| **CLI** | `@ai-brain/cli` — **uses TypeScript SDK only** |
| **Dashboard** | `apps/dashboard/` — **uses TypeScript SDK only** (optional SPA) |
| **Installable MCP Server** | `@ai-brain/mcp-server` — remote MCP via HTTP/SSE; **uses SDK** |
| **Remote MCP** | MCP transport adapter calling REST/gRPC through SDK |
| **Starter templates** | `templates/` — Cursor, Node bot, Python agent |
| **Examples** | `examples/` — CRUD, context, handoff |

### Out of scope

- Business logic in SDK (ranking, retrieval, SQL)
- Agent runtime / planner
- Server `MemoryService` changes

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Developer artifacts (packages/, apps/, examples/)       │
│  SDK │ CLI │ Dashboard │ MCP Server — ALL thin clients   │
└───────────────────────────┬─────────────────────────────┘
                            │ REST / gRPC / Remote MCP
┌───────────────────────────▼─────────────────────────────┐
│  AI Brain Server (unchanged business logic)              │
│  MemoryService │ ContextService │ …                      │
└─────────────────────────────────────────────────────────┘
```

### Dependency rule

```
CLI → SDK → HTTP/gRPC
Dashboard → SDK → HTTP/gRPC
MCP Server → SDK → HTTP/gRPC
```

**Forbidden:** CLI → fetch() directly bypassing SDK.

---

## 5. Extension points & interfaces

| Port / Contract | Location | Purpose |
|-----------------|----------|---------|
| `IApiClient` | SDK core | Unified request interface |
| `IRestTransport` | SDK | REST adapter |
| `IGrpcTransport` | SDK | gRPC adapter |
| `IMcpRemoteTransport` | MCP server package | Remote MCP wire |
| OpenAPI spec | `packages/openapi/` | Generation SSOT |
| Proto spec | `packages/proto/` | gRPC generation SSOT |

**No new server ports** — consumes existing public API.

---

## 6. SDK surface (minimal v1)

| API group | Methods |
|-----------|---------|
| Memory | create, get, update, delete, search |
| Context | build, stream (if SSE enabled) |
| Capabilities | get |
| Ecosystem | listClients (Phase 15) |
| Federation | listPeers, pull (Phase 14, optional) |

---

## 7. Migration strategy

| Step | Action | Server impact |
|------|--------|---------------|
| M1 | Add `packages/` to repo; CI gen job | None |
| M2 | Publish `@ai-brain/sdk` npm (optional registry) | None |
| M3 | CLI/Dashboard/MCP packages | None |
| M4 | Deprecate manual curl in docs → SDK examples | Docs only |

**Compatibility:** Server REST v1 frozen; SDK semver independent.

---

## 8. Impact summary

| Dimension | Impact |
|-----------|--------|
| Scalability | Clients scale independently; server unchanged |
| Enterprise | Faster integration, reduced support burden |
| Developer experience | **Primary beneficiary** |
| AI ecosystem | All clients use same typed contract |
| Cloud | SDK region-aware config only |
| Observability | CLI `--verbose` → SDK trace headers (Phase 19) |
| Governance | SDK respects auth tokens from Phase 17 |

---

## 9. Rollback

Unpublish npm packages; remove `packages/` from repo — **zero server rollback**.

---

## 10. References

Phase 13, 15, ADR-025, 04-ARCHITECTURE

*No implementation until ADR-031 Approved.*
