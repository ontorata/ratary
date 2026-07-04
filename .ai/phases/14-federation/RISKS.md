# Phase 14 — Federation — RISKS

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R-14-01 | MemoryService rewrite pressure | High | ADR-029 forbids; IKnowledgeExchangeService only |
| R-14-02 | Cloud/region if-else in services | High | Policy port + lint |
| R-14-03 | Cross-org data leak | Critical | Fail-closed policy; trust store |
| R-14-04 | Conflict storms multi-node | Medium | LWW default; cursor in metadata store |
| R-14-05 | Bundle size / PII | High | Policy filterExportable; content limits |
| R-14-06 | Tight coupling to gRPC | Medium | IFederationTransport multi-adapter |
| R-14-07 | Schema creep in memories | Medium | IFederationMetadataStore separate |
| R-14-08 | Phase 13 not ready | Medium | Hard prerequisite |
