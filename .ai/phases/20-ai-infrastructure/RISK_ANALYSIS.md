# Phase 20 — RISK_ANALYSIS

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-20-01 | Plugin bypasses MemoryService | Low | Critical | Port-only interface; code review; lint forbidden imports |
| R-20-02 | Unsigned/tampered plugin installed | Medium | Critical | ed25519 manifest validator; deny by default |
| R-20-03 | Plugin swap causes data incompatibility | Medium | High | Compatibility matrix in manifest; pre-enable checks |
| R-20-04 | Marketplace confused with payment store | Low | Low | v1 metadata only; clear naming |
| R-20-05 | LLM plugin becomes agent runtime | Medium | High | ILLMInferenceProvider boundary; review checklist |
| R-20-06 | Protocol capability drift (REST vs MCP) | Medium | Medium | Parity integration tests |
| R-20-07 | Env fallback removed accidentally | Low | High | Phase 20 keeps env vars; test OFF path |
| R-20-08 | Cross-tenant plugin enable | Low | Critical | Allow-list + Phase 17; negative tests |
| R-20-09 | Federation sync leaks secrets | Low | Critical | Metadata only; no config secrets in sync |
| R-20-10 | Registry complexity delays capstone | Medium | Medium | Minimal v1; local catalog; defer remote index |
| R-20-11 | Reference plugin maintenance burden | Medium | Low | Thin wrappers; external optional packages |
| R-20-12 | Breaking `/capabilities` clients | Low | Medium | Additive fields only; semver minor |

## Residual risks

- **Remote marketplace index** — supply chain risk if operators add untrusted URLs — document curation policy.
- **Plugin quality** — core validates signature/schema, not semantic correctness of third-party adapters.

## Escalation

| Trigger | Action |
|---------|--------|
| Plugin reaches MemoryService import in review | Block merge |
| Protocol parity test failure | Block merge |
| Unsigned plugin accepted in test | Security incident review |

## Capstone dependency risks

| Dependency | Risk if delayed | Mitigation |
|------------|-----------------|------------|
| Phase 17 | Admin routes unprotected | Block GA until auth wired |
| Phase 18 | No tenant allow-list | Noop allow-list adapter for beta |
| Phase 19 | No plugin metrics | Non-blocking for functional gate |
| Phase 16 | No SDK admin | REST-only admin for beta |
