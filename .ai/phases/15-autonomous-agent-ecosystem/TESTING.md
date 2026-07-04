# Phase 15 — Autonomous Agent Ecosystem — TESTING

**Status:** Implemented (2026-07-04)

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Catalog SSOT | `tests/ecosystem/agent-client-catalog.test.ts` | 8+ profiles, Cursor mcp-stdio, gRPC filter |
| Manifest embed | `tests/ecosystem/ecosystem-manifest.test.ts` | capability manifest ecosystem block |
| REST API | `tests/api/ecosystem.test.ts` | `/ecosystem/clients`, capabilities embed |
| Handler parity | `tests/transport/handler-parity.test.ts` | get_capabilities includes ecosystem |
| Boundary | `memory.service.ts` | zero ecosystem imports |

---

## Manual smoke

```bash
npm run dev

# Full catalog
curl http://localhost:3000/api/v1/ecosystem/clients

# Single profile
curl http://localhost:3000/api/v1/ecosystem/clients/cursor

# Via capabilities manifest
curl http://localhost:3000/api/v1/capabilities | jq '.ecosystem.clients | length'
```

---

## Quality gate

574 tests green at default env (includes 8 ecosystem tests + 4 API tests).
