# P1-D AI Workspace — Forge Isolate

| Field | Value |
|-------|-------|
| **Implementation branch** | `forge/ai-workspace-p1-d` (`Ontorata-Studio`) |
| **Studio baseline commit** | `af266a7` |
| **Ratary baseline tag** | `org-memory-p1-c-complete` |
| **Ratary baseline commit** | `d1ddc1e9c41739526491ba00e4702c8e43bb5a6b` |
| **Intent** | [ai-workspace-p1-d-intent.md](./ai-workspace-p1-d-intent.md) |
| **Verification timestamp** | `2026-07-08T17:10:48+07:00` |
| **Status** | ✅ Isolate active — ready for blueprint W1 |

---

## Pre-flight checklist

- [x] P1-C intent locked (`org-memory-p1-c-complete`)
- [x] P1-D intent approved with D1–D4 locked decisions
- [x] Primary codebase: Ontorata Studio
- [x] Allowed / forbidden boundaries declared
- [x] Wave structure W1–W6 defined

---

## Change boundary (allowed in P1-D)

**Ontorata-Studio only** (consumer layer):

1. Workspace/session orchestration modules.
2. Public workspace ports consuming `@ratary/sdk`.
3. UI/UX and interaction pipeline above recall outputs.
4. Studio-side integration evaluation harness.
5. ESLint + CI recall consumer boundary guards.

**Ratary (ai-brain):** P1-C artifacts remain frozen. SDK public surface may evolve only as contract export (not recall internals).

---

## Explicit no-touch boundary

### Ratary P1-C frozen (no changes without ADR)

- `src/memory/recall/recall-policy.ts`
- `src/memory/recall/*-candidate-provider.ts`
- `src/memory/recall/context-budget.ts`
- `src/memory/recall/context-package-assembler.ts`
- P1-C evaluation fixture expectations (unless regression intentionally versioned)

### Studio forbidden

- Import Ratary `src/` or internal recall namespaces
- Implement ranking, candidate selection, or context budgeting in Studio
- `fetch()` outside approved Ratary adapter modules

---

## Baseline verification (must pass before implementation)

### Ratary (`org-memory-p1-c-complete`)

| Command | Result |
|---------|--------|
| `npm run eval:recall-intelligence` | ✅ PASS — 100% pass_rate, isolation_failures=0 |
| `candidate_set_hash` | `1b820fd835c10c45` |

### Ontorata-Studio (`forge/ai-workspace-p1-d` @ `af266a7`)

| Command | Result |
|---------|--------|
| `npm test` | ✅ PASS — 8 files / 22 tests |
| `npm run lint` | (baseline before W1 changes) |

---

## Risks and assumptions

### Risks

1. SDK `BuildContextResult` may lag full `ContextPackage` shape until SDK export catches up (W3 alignment).
2. Studio may accidentally add recall logic in UI hooks without boundary guards.

### Assumptions

1. Studio accesses recall only via `@ratary/sdk` through `StudioRataryClient` adapter.
2. P1-C regression runs remain mandatory on Ratary for every P1-D PR touching integration.

---

## Exit criteria (isolate → blueprint)

- [x] Dual-repo baseline provenance recorded
- [x] Boundaries documented
- [x] Ratary P1-C eval green
- [x] Studio tests green at branch creation
- [x] No P1-D implementation code before isolate record

**Ready for forge-blueprint W1:** ✅ proceed.
