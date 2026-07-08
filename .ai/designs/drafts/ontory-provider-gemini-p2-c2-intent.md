# P2-C.2 Gemini Provider — Forge Intent

**Status:** Draft — pending owner approval  
**Slug:** ontory-provider-gemini-p2-c2-intent  
**Baseline:** `org-memory-p2-c1-complete` (Ontory `4b3e094` · ai-brain `0640737`)  
**Branch (proposed):** `forge/ontory-provider-gemini-p2-c2` (ontory only)  
**Phase:** 04-proof-of-platform → Ontory provider track  
**Category:** Must Prove (adapter wave 3)  
**Authority:** ADR-0007 · ADR-0008/0010 (pattern) · ADR-0009 (frozen contract) · [contract.md](../../governance/provider-conformance/contract.md)

---

## Problem

OpenAI (P2-B) and Anthropic (P2-C.1) proved the conformance harness generalizes. Gemini is the **third plug-in** — it must conform to the same frozen Provider Contract without bending the harness or opening capability negotiation early.

Core question:

> Can Gemini join Ontory as a third `ProviderRuntime` implementation with zero Kernel/Studio changes and full conformance PASS alongside stub + openai + anthropic regression?

---

## Locked decisions

| ID | Decision |
|----|----------|
| D1 | **New forge branch** — `forge/ontory-provider-gemini-p2-c2` from `org-memory-p2-c1-complete` |
| D2 | **Thin adapter only** — mirror OpenAI/Anthropic layering |
| D3 | **Official `@google/generative-ai`** confined to `src/adapters/gemini/` |
| D4 | **Default model** via config only (proposed: `gemini-2.0-flash`) |
| D5 | **Context fold** — same as OpenAI/Anthropic: system + context → system block; user prompt separate |
| D6 | **Usage** — Gemini token counts are source of truth when present; map to envelope `usage` |
| D7 | **Conformance** — add `gemini.conformance.test.ts` + `gemini-pass.md`; **do not modify** P2-C.0 matrix |
| D8 | **ADR-0011** — Gemini implementation ADR separate from ADR-0009 contract |
| D9 | **Capability metadata / negotiation** — **out of scope** (future ADR after ≥3 vendors if needed) |
| D10 | **C-CAN / streaming / routing / runtime refactor** — out of scope |

### Contract boundary (owner pattern)

> **Gemini adapter MUST conform to existing Ontory provider contracts.** Any contract change requires a separate ADR and **MUST NOT** be introduced through provider integration work.

---

## Decision

Execute **P2-C.2 Gemini Provider Integration**:

```text
AIExecutionRequest
        │
        ▼
GeminiProviderAdapter  (implements ProviderRuntime)
        ├── RequestMapper
        ├── ResponseMapper
        ├── ErrorMapper
        └── injected client (@google/generative-ai · mocked in CI)
        │
        ▼
Gemini generateContent API
```

Config extends `ONTORY_PROVIDER`: `stub | openai | anthropic | gemini`.

---

## Acceptance gate

```text
org-memory-p2-c1-complete
        ↓
Gemini adapter
        ↓
npm run test:conformance
  stub + openai + anthropic + gemini MUST PASS
        ↓
Evidence A1/A2 + gemini-pass.md
        ↓
check:boundary PASS
        ↓
org-memory-p2-c2-complete
```

---

## In scope

| Area | Deliverable |
|------|-------------|
| Adapter | `src/adapters/gemini/*` |
| Config | `GEMINI_API_KEY`, `GEMINI_MODEL`, optional base URL / timeout |
| Tests | Unit (mocked) + `tests/conformance/gemini.conformance.test.ts` |
| Boundary | Allow `@google/generative-ai` under `adapters/gemini/` only |
| Governance | ADR-0011 · evidence · ADR-0009 extension note at closeout |

## Out of scope (explicit)

- Capability negotiation / provider capability metadata ADR (note: may emerge after 3 vendors — **not** in P2-C.2)
- C-CAN cancellation
- Streaming (P2-D)
- Multi-provider routing intelligence
- Studio changes
- Harness contract or scenario matrix changes

---

## Alternatives considered

### A — Shared generic vendor mapper (rejected)
Violates thin-adapter precedent; increases blast radius across three vendors.

### B — Open capability negotiation in P2-C.2 (rejected)
Scope creep; P2-C track goal is conformance proof, not capability model.

### C — Skip conformance for Gemini (rejected)
Breaks ADR-0009 plug-in principle.

---

## Open questions (for owner at approval)

| # | Question | Proposed default |
|---|----------|------------------|
| 1 | Default Gemini model id? | `gemini-2.0-flash` via `GEMINI_MODEL` config |
| 2 | SDK package | `@google/generative-ai` (official) |
| 3 | ADR-0011 separate from ADR-0009? | Yes — contract vs implementation split preserved |

---

## Next after approval

1. Accept ADR-0011 + intent  
2. forge-isolate `forge/ontory-provider-gemini-p2-c2` @ `org-memory-p2-c1-complete`  
3. Execute [ontory-provider-gemini-p2-c2-plan.md](./ontory-provider-gemini-p2-c2-plan.md)  
4. Closeout tag `org-memory-p2-c2-complete`
