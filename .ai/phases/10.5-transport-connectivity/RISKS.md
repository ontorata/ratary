# Phase 10.5 — Transport & Connectivity — RISKS

**Phase status:** Design draft (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design:** [DESIGN.md](DESIGN.md)

---

## Risk register

| ID | Risk | Severity | Likelihood | Mitigation | Status |
|----|------|----------|------------|------------|--------|
| R-10.5-01 | REST/MCP/gRPC behavioral drift | High | Medium | Shared `IApplicationHandler` + parity tests | Open |
| R-10.5-02 | Over-abstraction (`ITransport` god interface) | High | Medium | Lifecycle + handler pattern only; no unified request type | Open |
| R-10.5-03 | Phase 11 delay | High | Low | 10.5 parallel after 11A; owner authorization required | Open |
| R-10.5-04 | Folder migration breaks imports | Medium | Medium | Strangler re-exports; one track per commit | Open |
| R-10.5-05 | gRPC scope creep (full REST parity) | Medium | Medium | v1 minimal surface; defer to Phase 13 ingest | Open |
| R-10.5-06 | gRPC on Vercel attempted | Medium | Low | Document: long-running Node/K8s only | Open |
| R-10.5-07 | Business logic leaks into handlers | High | Low | Handlers = mapping only; review gate | Open |
| R-10.5-08 | SDK scope creep into repo | Medium | Low | Constitution + 7.5 DESIGN — external package | Open |
| R-10.5-09 | Speculative GraphQL added | Low | Low | Explicitly deferred; separate ADR required | Open |
| R-10.5-10 | MCP auth model conflated with gRPC mTLS | Medium | Low | Separate auth paths documented in DESIGN | Open |

---

## Cross-phase risks (from POST-ROADMAP)

| ID | Item | Phase 10.5 interaction |
|----|------|------------------------|
| T-01 | `MemoryRepository` ~622 lines | Independent — no repo change in 10.5 |
| Phase 12 | Event consumers | gRPC enables fan-out transport |
| Phase 13 | Batch ingest | gRPC client-stream target |

---

## Realized risks

_None — phase not yet implemented._

---

## Deferred risks (carry forward)

| ID | Deferred to | Notes |
|----|-------------|-------|
| R-10.5-05 | Phase 13 | Full EmbeddingIngest gRPC |
| R-10.5-09 | Future ADR | GraphQL BFF |

---

*Updated during phase; locked at gate PASS.*
