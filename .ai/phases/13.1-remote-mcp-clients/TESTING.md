# Phase 13.1 — Remote MCP Clients — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record verification strategy and evidence: unit, integration, E2E, fixtures, quality gate.

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Value |
|--------|-------|
| Phase gate (2026-07-04) | 688 tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/transport/remote-mcp.test.ts` | Initialize detection, session binding, CORS |
| `tests/transport/mcp-oauth-metadata.test.ts` | RFC 9728 protected resource metadata |
| `tests/auth/oidc-access-token.provider.test.ts` | OIDC bearer validation for MCP OAuth |
| `tests/api/remote-mcp-oauth.test.ts` | 401 + WWW-Authenticate + resource_metadata on /mcp |
| `tests/mcp/tools.test.ts` | 20 tools via stdio and remote binding parity |

---

## Scenarios verified

- [x] `REMOTE_MCP_ENABLED=false` — `/mcp` not mounted; full suite green
- [x] API-key auth on `/mcp` when OAuth off
- [x] OAuth discovery at `/.well-known/oauth-protected-resource/mcp` when `REMOTE_MCP_OAUTH_ENABLED=true`
- [x] Same tool catalog as stdio — no forked implementations

## Manual verification

```bash
1. `REMOTE_MCP_ENABLED=true npm run dev`
2. POST `/mcp` with `Authorization: Bearer aic_...` + initialize JSON-RPC
3. Follow-up with `mcp-session-id`
4. Optional: ChatGPT OAuth with `REMOTE_MCP_OAUTH_ENABLED=true` + Phase 17 OIDC env
```

## Deferred tests

- [ ] Automated ChatGPT remote connection smoke in CI
- [ ] Vercel serverless long-lived SSE sessions

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
