# Phase 09.7 — Memory Evolution — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/evolution/memory-diff-engine.test.ts` | Field-level diff |
| `tests/evolution/memory-merge-policy.test.ts` | Merge policy |
| `tests/composition/memory-evolution-ports.test.ts` | Env gating |
| `tests/db/extension-tracks-migration.test.ts` | `memory_versions`, `memory_heads` |
| `tests/capabilities/manifest-builder.test.ts` | `supportsMemoryEvolution` |
| `tests/api/evolution.test.ts` | REST restore (D97-01) + merge (D97-02) E2E |

---

## Scenarios verified

- [x] Diff detects title/content changes
- [x] Merge unions tags; empty incoming never wipes base text (`memory-merge-policy.test.ts`)
- [x] Composition disabled by default
- [x] Migration creates version + head tables
- [x] MemoryService signatures unchanged when flag off
- [x] E2E update → list versions → restore head (D97-01)
- [x] E2E merge base version + current head via REST (D97-02)

---

## Current regression

840 passed | 3 skipped (default env, 2026-07-05) (full suite, all master flags OFF)
