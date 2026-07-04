# Phase 6.5 — Progressive Retrieval — IMPLEMENTATION

**Status:** Implemented  
**ADR:** [ADR-024 Implemented](../../../docs/adr/024-progressive-retrieval-policy.md)

## Deliverables

- `IRetrievalPolicy`, `DefaultRetrievalPolicy`, `RetrievalPlan`
- Hook in `ContextService.buildContext` (after rank, before hydration)
- Additive `retrievalPlan` in REST/MCP context responses
- Env: `RETRIEVAL_POLICY_VERSION` (default `1`)

## Non-regression

Default policy reproduces summary-only context path; all flags off = identical behavior.
