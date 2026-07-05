# Phase 10.5 — Transport & Connectivity — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| REST/MCP handler drift | Medium | Critical | Shared handlers + handler-parity.test.ts | Mitigated |
| gRPC on Vercel serverless | High | High | GRPC_ENABLED=false default; PANDUAN warning | Mitigated |
| Transport imports in services/ | Medium | Critical | layer-boundaries.test.ts | Mitigated |
| Breaking stdio MCP spawn | Medium | Critical | Strangler re-exports; mcp/server.ts unchanged path | Mitigated |

## Deferred risks (carried forward)

| ID | Risk | Mitigation path |
|----|------|-----------------|
| ~~D105-01~~ | ~~Full gRPC E2E client test~~ | ✅ **Closed 2026-07-05** — `tests/transport/grpc-e2e.test.ts` |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
