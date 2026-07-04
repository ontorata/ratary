# Phase 10.5 — Transport & Connectivity — MIGRATION

**Status:** N/A — no schema migration  
**Type:** Folder strangler re-exports only

---

## Summary

Phase 10.5 introduces **no DDL**. Migration is import-path only:

| Legacy path | Canonical path |
|-------------|----------------|
| `src/server.ts` | `src/transport/rest/rest-server.ts` |
| `src/mcp/server.ts` | `src/transport/mcp/mcp-server.ts` |
| `src/scope/resolve-request-scope.ts` | delegates to `transport/shared/resolve-transport-scope.ts` |

Existing consumers (`api/index.ts`, Vercel handler, tests) continue importing `./server.js` unchanged.

---

## Deployment notes

| Surface | Default | Notes |
|---------|---------|-------|
| REST | Always on | Vercel, D1, local dev |
| MCP stdio | Always on | Cursor spawn; separate process |
| gRPC | **Off** | Long-running Node (K8s/VM); not Vercel |

Enable gRPC:

```bash
GRPC_ENABLED=true
GRPC_PORT=50051
```

---

## Rollback

1. Set `GRPC_ENABLED=false`
2. Git revert transport commits if structural rollback required
3. No database rollback — zero schema impact
