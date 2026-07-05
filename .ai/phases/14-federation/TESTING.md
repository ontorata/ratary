# Phase 14 — Federation — TESTING

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
| Phase gate (2026-07-04) | 562 tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/federation/knowledge-exchange.test.ts` | Ports gate, cross-org deny, peer list |
| `tests/db/extension-tracks-migration.test.ts` | `federation_*` tables |
| `tests/capabilities/manifest-contract.test.ts` | `supportsFederation` flag |
| `tests/transport/layer-boundaries.test.ts` | No federation imports in services/ |

---

## Scenarios verified

- [x] Cross-org exchange denied without trust link
- [x] `FEDERATION_ENABLED=false` — routes not mounted
- [x] In-process transport MVP for same-node workspaces
- [x] Orchestrator uses MemoryService create/update only

## Manual verification

```bash
See IMPLEMENTATION.md smoke — pull/push between workspaces with federation env on
```

## Deferred tests

- [ ] Cross-workspace in-process E2E recorded in CI
- [ ] Remote HTTP peer transport

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
