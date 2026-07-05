# PHASE 7 DESIGN REVIEW — PRINCIPAL ARCHITECT

**Reviewer:** Principal Architect  
**Date:** 2026-07-03  
**Document:** [DESIGN.md](DESIGN.md)  
**Status:** APPROVED

---

## EXECUTIVE SUMMARY

The Phase 7 Agent Runtime Boundary design is fundamentally sound and achieves its primary objective of defining a stable contract between Ratary (memory foundation) and external agent runtimes. The document correctly excludes agent logic, preserves storage-agnosticism, and provides clear boundaries.

**Final Verdict:** APPROVED WITH MINOR CHANGES

---

## FINDINGS

### CRITICAL

None.

---

### MAJOR

| # | Section | Finding | Status |
|---|---------|---------|--------|
| M1 | §3, §11, §21 | **Tool count inconsistency** — Verified actual MCP implementation has 19 tools (`tests/mcp/tools.test.ts`). | ✅ **RESOLVED** |
| M2 | §15 | **Multi-agent write reconciliation not defined** — Added `ISyncManager` contract in Section 19 with full interface definition. | ✅ **RESOLVED** |

---

### MINOR

| # | Section | Finding | Recommendation |
|---|---------|---------|----------------|
| m1 | §14 | **ActorMetadata missing organizationId** | ✅ Added `organizationId?: string` (2026-07-03) |
| m2 | §17 | **Event subscription authorization undefined** | ✅ Scoped to `ownerId`; org-level deferred Phase 10 (2026-07-03) |
| m3 | §20 | **Constitutional checklist incomplete** | ✅ Section deliverables checklist added (2026-07-03) |
| m4 | §23 | **Future phase links may be broken** | ✅ Marked (planned) + roadmap links (2026-07-03) |

---

### SUGGESTIONS

| # | Section | Suggestion | Status |
|---|---------|------------|--------|
| S1 | §10 | Add standard error codes to CapabilityManifest | ✅ **RESOLVED** 2026-07-04 — `errorCodes` + table in [DESIGN.md §10](DESIGN.md) |
| S2 | §10 | Document rate limiting expectations per capability | ✅ **RESOLVED** 2026-07-04 — `rateLimits` + enforcement table in §10 |
| S3 | §11 | Add example JSON-RPC request/response for each tool | ✅ **RESOLVED** 2026-07-04 — envelopes + 19-tool matrix in §11 |
| S4 | §12 | Add OpenAPI schema reference | ✅ **RESOLVED** 2026-07-04 — `/docs/json`, `/docs/yaml` in §12 |

---

## SCORES

| Category | Score | Rationale |
|----------|-------|-----------|
| **Architecture Consistency** | 88/100 | Clear layers; minor inconsistencies in tool count |
| **Future Compatibility** | 85/100 | Good Phase 8-10 foundation; Phase 9 sync contract needs clarification |
| **Repository Stability** | 92/100 | Clear boundaries; forbidden patterns well-documented |
| **Protocol Stability** | 82/100 | Sound policy; tool count inconsistency creates implementation risk |
| **Overall** | **87/100** | Solid design with addressable minor issues |

---

## STRENGTHS

1. **Clear boundary definition** — Section 7 explicitly defines what is inside vs outside
2. **Comprehensive forbidden patterns** — 10 patterns documented in Section 6
3. **Three-phase horizon guarantee** — Rewrite prevention documented in Section 19
4. **Strong ADR alignment** — All 5 ADRs properly referenced and complied
5. **Well-structured versioning** — 12-month deprecation policy is industry-standard
6. **Actor model foresight** — 9 actor types defined with Phase 9-10 extensions

---

## REQUIRED CHANGES BEFORE COMMIT

| Priority | Change | Location | Status |
|----------|--------|----------|--------|
| P0 | Fix tool count to match actual implementation | §3, §11, §21 | ✅ RESOLVED (19 tools — `tests/mcp/tools.test.ts`) |
| P0 | Add ISyncManager basic contract | §19 | ✅ RESOLVED |
| P1 | Add organizationId to ActorMetadata | §14 | ✅ **RESOLVED** 2026-07-04 — usage rules + Phase 10 example in §14 |
| P1 | Expand constitutional checklist | §20 | ✅ **RESOLVED** 2026-07-04 — principles + ADR tables in §20 |
| P2 | Add event subscription scope note | §17 | ✅ **RESOLVED** 2026-07-04 — scope matrix + `EventSubscriptionScope` in §17 |
| P2 | Fix future phase links | §23 | ✅ **RESOLVED** 2026-07-04 — Phases 8–11 DESIGN links in §23 |

---

## CONSTITUTION COMPLIANCE VERIFICATION

| Constitution Rule | Status | Evidence |
|------------------|--------|----------|
| Ratary remains storage-agnostic | ✅ | Ports defined in §11, §12 |
| Ratary remains retrieval-focused | ✅ | IRRetrievalCandidateSource in §3 |
| Ratary remains context-focused | ✅ | ContextBuilder in §5 |
| Ratary never becomes agent runtime | ✅ | Boundary enforced §7 |
| External systems via stable protocols | ✅ | MCP + REST only §8 |
| No planner/executor/workflow | ✅ | Forbidden patterns §6 |
| Clean Architecture preserved | ✅ | Layer diagram §4 |
| Repository Pattern preserved | ✅ | Ports defined §11-§12 |
| Dependency direction preserved | ✅ | Inward flow diagram §4 |
| Future Vector Layer preserved | ✅ | IEmbeddingStore §19 |
| Future Graph Layer preserved | ✅ | IGraphProvider contract §19 |
| Future Agent Layer excluded | ✅ | Boundary document §7 |

---

## ADR COMPLIANCE VERIFICATION

| ADR | Status | Finding |
|-----|--------|---------|
| ADR-001 Multi-source retrieval | ✅ | CompositeRetrievalCandidateSource referenced |
| ADR-002 Workspace identity | ✅ | MemoryScope contract matches exactly |
| ADR-003 Embedding storage | ✅ | IEmbeddingStore referenced |
| ADR-004 Repository ports | ✅ | All ports defined per ADR |
| ADR-005 Content object store | ✅ | Future blob offload mentioned |

---

## RECOMMENDATION

**APPROVED**

All P0 major issues have been resolved:
- ✅ Tool count verified against actual MCP implementation (19 tools)
- ✅ ISyncManager contract defined with full interface

The Phase 7 DESIGN document is ready for commit.

| Issue | Resolution |
|-------|------------|
| M1: Tool count | Verified: MCP implementation has 19 tools. Registry in §11 S3 matrix. |
| M2: ISyncManager | Contract added to Section 19 with `reconcileWrite`, `resolveConflict`, `getStrategy` methods. |

### Remaining Minor Items

All optional P1/P2 items resolved 2026-07-04 (see REQUIRED CHANGES table).

### Post-gate platform note (append-only, 2026-07-04)

Gate verified **19 MCP tools**. Platform SSOT is now **22** (`src/capabilities/mcp-tool-names.ts`) via additive successor phases (7.5, 8, 9, 04.7, 5.5). Phase 7 boundary unchanged.

---

*Review conducted per 08-REVIEW-CHECKLIST.md*
