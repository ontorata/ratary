# Phase 13 — Protocol Layer — RISKS

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R-13-01 | Stream logic duplicated in adapters | High | `IContextStreamSource` single path |
| R-13-02 | Controller imports repository | High | Handler-only DI; lint gate |
| R-13-03 | Service imports ws/gRPC | High | Layer lint in CI |
| R-13-04 | WS/SSE on Vercel serverless | Medium | Document long-running Node only |
| R-13-05 | Protocol benchmark flaky CI | Low | Optional job; fixed fixtures |
| R-13-06 | 10.5 not done — rework | Medium | Hard prerequisite ADR-027 |
| R-13-07 | Roadmap renumber confusion | Low | POST-ROADMAP amendment + README |
| R-13-08 | Event subscribe before Phase 12 | Low | Stub returns not-enabled |
