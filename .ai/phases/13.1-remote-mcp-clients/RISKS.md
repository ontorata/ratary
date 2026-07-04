# Phase 13.1 — Remote MCP Clients — RISKS

**Phase status:** 🔲 Planned — design draft (2026-07-04)

---

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-13.1-01 | Vercel/serverless cannot host persistent MCP SSE | High | High | Document; recommend Railway/VPS; REST Actions on Vercel |
| R-13.1-02 | ChatGPT OAuth UI expects OAuth; API key awkward | Medium | Medium | Interim Actions path; Phase 17 OAuth |
| R-13.1-03 | Public MCP endpoint expands attack surface | Medium | High | Default OFF; auth required; rate limits; CORS allowlist |
| R-13.1-04 | MCP SDK transport API drift | Low | Medium | Pin SDK version; contract tests |
| R-13.1-05 | stdio vs remote behavior drift | Medium | Medium | Shared `createMcpServer`; parity test suite |
| R-13.1-06 | ChatGPT custom header support unknown | Medium | Low | Scope via API key identity only in MVP |
| R-13.1-07 | User pastes REST URL into MCP field | High | Low | PANDUAN + clear error message on wrong Content-Type |

---

## Deferred risks (carry to Phase 17)

- OAuth token exchange for ChatGPT "New App" auth dropdown
- ABAC per workspace on remote MCP sessions

---

*Updated at design draft.*
