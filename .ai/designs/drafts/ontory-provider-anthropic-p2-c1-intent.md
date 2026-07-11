# P2-C.1 Anthropic Provider — Forge Intent

**Status:** Accepted — owner approval 2026-07-08  
**Slug:** ontory-provider-anthropic-p2-c1-intent  
**Baseline:** `org-memory-p2-c0-complete` (Ontory `8e307ce` · ai-brain `0129bcc`)  
**Branch (proposed):** `forge/ontory-provider-anthropic-p2-c1` (ontory only)  
**Phase:** 04-proof-of-platform → Ontory provider track  
**Category:** Must Prove (adapter wave 2)  
**Authority:** ADR-0007 · ADR-0008 (pattern) · ADR-0009 (frozen contract) · [contract.md](../../governance/provider-conformance/contract.md)

---

## Problem

P2-B delivered a thin OpenAI adapter. P2-C.0 froze the Provider Contract and proved OpenAI + stub via an executable harness (`npm run test:conformance`). Anthropic is the **first plug-in wave** that must validate against that contract — not redefine it.

Core question:

> Can Anthropic join Ontory as a second `ProviderRuntime` implementation with **zero** Kernel/Studio contract changes and **full** conformance harness PASS?

---

## Locked decisions

| ID | Decision |
|----|----------|
| D1 | **New forge branch** — `forge/ontory-provider-anthropic-p2-c1`; do **not** continue P2-C.0 harness branch |
| D2 | **Baseline isolate** from `org-memory-p2-c0-complete` |
| D3 | **Thin adapter only** — mirror OpenAI layering (RequestMapper · ResponseMapper · ErrorMapper · Adapter · config wire) |
| D4 | **Official `@anthropic-ai/sdk`** confined to `src/adapters/anthropic/` |
| D5 | **Default model** via Ontory config only (proposed: `claude-3-5-haiku-20241022`; owner may override) |
| D6 | **Conformance gate** — all Anthropic MUST scenarios PASS via **new** `anthropic.conformance.test.ts`; **do not modify** P2-C.0 scenario matrix or contract |
| D7 | **Harness extension** — add Anthropic subject tests + `results/anthropic-pass.md`; C-CAN remains deferred |
| D8 | **A1/A2 evidence** — same acceptance framing as P2-B (Studio vendor-agnostic · no SDK types across port) |
| D9 | **Streaming / tools / MCP / memory / agents** — out of scope |
| D10 | **No multi-provider routing intelligence** — config selects one provider; no runtime refactor |

---

## Constraints (constitution / ADR)

1. `ProviderRuntime.complete` signature **unchanged** (ADR-0007 · ADR-0009).
2. `AIExecutionRequest` / `AIExecutionResponse` / `ProviderError` **unchanged** unless gap proven → new ADR (not expected).
3. Dispatcher must not gain Anthropic payload knowledge.
4. Studio **unchanged** for this wave.
5. Conformance harness contract (`contract.md`, scenario catalog) **frozen** — Anthropic conforms; harness does not bend for Anthropic.
6. Boundary CI: `@anthropic-ai/sdk` import allowed **only** under `src/adapters/anthropic/`.

---

## Decision

Execute **P2-C.1 Anthropic Provider Integration** as a plug-in adapter wave:

```text
AIExecutionRequest
        │
        ▼
AnthropicProviderAdapter  (implements ProviderRuntime)
        ├── RequestMapper      → Messages API params (adapter-local types)
        ├── ResponseMapper     → AIExecutionResponse
        ├── ErrorMapper        → ProviderError
        └── injected client    (official SDK · mocked in CI)
        │
        ▼
Anthropic Messages API
```

Config layer extends `ONTORY_PROVIDER` union: `stub | openai | anthropic`.

REST composition: `createProviderFromConfig` wires Anthropic when selected; **stub remains default**.

---

## Acceptance gate (owner-approved)

```text
org-memory-p2-c0-complete
        │
        ▼
Anthropic Adapter (thin)
        │
        ▼
npm run test:conformance  (OpenAI + stub regression + Anthropic MUST)
        │
        ▼
Evidence A1/A2 + anthropic-pass.md
        │
        ▼
check:boundary PASS
        │
        ▼
tag org-memory-p2-c1-complete
```

---

## In scope

| Area | Deliverable |
|------|-------------|
| Adapter | `src/adapters/anthropic/*` (mirror openai folder shape) |
| Config | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, optional base URL / timeout in `provider-config.ts` |
| REST | Composition root only — no handler business logic |
| Tests | Unit tests (mocked SDK) + `tests/conformance/anthropic.conformance.test.ts` |
| Boundary | Extend `check-runtime-boundary.mjs` anthropic allowlist |
| Governance | `anthropic-pass.md` · P2-C.1 acceptance · ADR-0010 (proposed) · ADR-0009 extension note at closeout |

## Out of scope (explicit)

- Gemini (P2-C.2)
- Streaming (P2-D)
- C-CAN / cancellation contract expansion
- Capability negotiation
- Multi-provider routing / model selection intelligence
- `ProviderRuntime` / Dispatcher / Kernel refactor
- Studio changes
- Conformance contract or scenario matrix changes

---

## Alternatives considered

### A — Extend P2-C.0 branch (rejected)
Mixes harness baseline with vendor code; violates single-intent forge isolation.

### B — Shared generic mapper for all vendors (rejected)
Over-abstraction; violates P2-B thin-adapter precedent and increases blast radius.

### C — Skip conformance until adapter “works” (rejected)
Recreates OpenAI golden-path bias ADR-0009 was written to prevent.

### D — Anthropic via OpenAI-compatible proxy (rejected)
Hides real SDK/error semantics; fails A2 and conformance honesty.

---

## Impact

| Layer | Impact |
|-------|--------|
| **Ontory** | New `adapters/anthropic/` · config extension · conformance subject · boundary allowlist |
| **ai-brain** | Intent · blueprint · ADR-0010 · evidence · release record |
| **Studio** | None |
| **Harness** | **Add** Anthropic subject file only — no contract edits |

---

## Open questions (for owner at approval)

| # | Question | Proposed default |
|---|----------|----------------|
| 1 | Default Anthropic model id? | **`claude-3-5-haiku-20241022`** via config (`ANTHROPIC_MODEL`) — never hard-coded in adapter |
| 2 | ADR path: new ADR-0010 vs extension-only? | **ADR-0010** Accepted · ADR-0009 extension note at closeout only |
| 3 | System+context fold strategy? | Same as OpenAI: fold context into system block |
| 4 | Usage mapping? | Anthropic `input_tokens`/`output_tokens` are source of truth; map to envelope `usage` when present |

---

## Next after approval

1. **forge-isolate** `forge/ontory-provider-anthropic-p2-c1` from `org-memory-p2-c0-complete`
2. **forge-blueprint** — [ontory-provider-anthropic-p2-c1-plan.md](./ontory-provider-anthropic-p2-c1-plan.md)
3. **forge-execute** Tasks 1–8 (mirror P2-B sequencing)
4. **forge-prove** — conformance + full suite green before evidence
5. Closeout tag `org-memory-p2-c1-complete`
