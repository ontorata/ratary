# ADR-0009 — Provider Conformance Harness (P2-C.0)

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — awaiting owner acceptance before isolate |
| **Date** | 2026-07-08 |
| **Baseline** | `org-memory-p2-b-complete` (Ontory `e63bb93` · ai-brain `fe70ede`) |
| **Related** | ADR-0007 · ADR-0008 · FROZEN-BOUNDARY-BYPASS-POLICY |
| **Deciders** | Engineering · Product (owner) |
| **Host repo** | `ontory` (harness) + `ai-brain` (governance contract) |
| **Providers in this wave** | **None new** — prove existing OpenAI (+ stub) against frozen contract |
| **Unlocks** | P2-C.1 Anthropic · then P2-C.2 Gemini · P2-D Streaming separate |

---

## Context

P2-B frozen an OpenAI thin adapter behind `ProviderRuntime`. Without a **conformance harness**, the next vendor (Anthropic) risks copying OpenAI-shaped assumptions, making the Kernel look vendor-neutral while being OpenAI-biased in practice.

Owner roadmap:

```text
P2-C.0 Conformance Harness  →  P2-C.1 Anthropic  →  P2-C.2 Gemini  →  P2-D Streaming
```

P2-C.0 must not deliver new vendors.

---

## Decision

Introduce **P2-C.0 Provider Conformance Harness** that:

1. Freezes a written **Provider Contract** (governance + executable checks) against P2-B types:
   - `AIExecutionRequest`
   - `AIExecutionResponse`
   - `ProviderError`
   - `ProviderRuntime`
2. Runs a **scenario suite** against **registered** adapters via a thin harness driver (injected fakes / mocks — no live network for CI).
3. Registers **OpenAI** (and **stub** where meaningful) as the first subjects. Future Anthropic/Gemini only register when their adapters exist.
4. Does **not** change Kernel contracts unless a gap is proven and escalated via new ADR.

### Architecture

```text
Provider Contract (frozen)
        │
        ▼
Conformance Harness
        │
        ├── StubRuntimeProvider     (baseline subject)
        ├── OpenAIProviderAdapter   (P2-B subject · mocked client)
        ├── AnthropicAdapter        (future · P2-C.1)
        └── GeminiAdapter           (future · P2-C.2)
```

### Minimum scenario matrix

| ID | Scenario | Purpose |
|----|----------|---------|
| C-REQ | Request mapping | Runtime request → provider-facing params (via mapper / adapter path) |
| C-RES | Response normalization | Provider-like payload → `AIExecutionResponse` envelope |
| C-ERR | Error mapping | Failure facts → `ProviderError` codes |
| C-TMO | Timeout | Timeout/abort-like failure → `ProviderError(timeout)` |
| C-CAN | Cancellation | Documented behavior for cancel/abort (may be **probe / deferred green** if port lacks AbortSignal in P2-B) |
| C-META | Metadata envelope | `provider`, `requestId`, `finishedAt`, optional `usage` present and vendor-neutral |
| C-CFG | Configuration failure | Missing key / invalid provider → `ProviderError(configuration)` |
| C-RTY | Retry boundary | Adapter must not silently retry in ways that hide errors from Runtime (no ambient retry orchestrator) |

### Governance output layout

```text
.ai/governance/provider-conformance/
  contract.md
  scenarios/
  results/
```

Executable harness lives in **ontory** (e.g. `tests/conformance/` + `npm run test:conformance`) and writes/links results under governance `results/` when run for evidence.

### Locked principles

1. **P2-B contracts are frozen** — harness validates; it does not quietly extend OpenAI golden-path fields into the Kernel.
2. **No `if (provider === 'openai')` in Dispatcher/Runtime** — conformance shares scenarios; adapters remain the only vendor branch points.
3. **Capability negotiation is out of P2-C.0** — belongs after ≥2 real vendors (P2-C.2+).
4. **Streaming is out** — P2-D.
5. **Anthropic/Gemini code is out** — P2-C.1 / P2-C.2.

### Deferred probes (honest gaps)

P2-B `ProviderRuntime.complete` has no AbortSignal parameter yet. Scenario **C-CAN** shall:

- assert current ErrorMapper maps `AbortError` → `timeout`/`cancelled` as already defined, **or**
- mark **SKIP/DEFERRED** with explicit note that full cancellation semantics require a later contract ADR before P2-D / Anthropic.

Harness must not pretend cancellation is fully productized if the port cannot cancel an in-flight call.

---

## Alternatives considered

### A — Jump to Anthropic adapter (rejected)
Hidden OpenAI bias; expensive backfill of harness mid-flight.

### B — Expand Kernel for capabilities/streaming now (rejected)
Scope creep; violates P2-B freeze and owner sequencing.

### C — Documentation-only checklist without executable tests (rejected)
Not regression-safe; OpenAI remains unchallenged golden path.

---

## Definition of Done (P2-C.0)

- [ ] ADR-0009 Accepted
- [ ] `contract.md` published under `.ai/governance/provider-conformance/`
- [ ] Scenario catalog checked in under `scenarios/`
- [ ] Executable conformance suite in Ontory; CI/local command documented
- [ ] OpenAI (mocked) + stub subjects PASS required scenarios
- [ ] C-CAN disposition recorded (pass / deferred with ADR note)
- [ ] Results snapshot in `results/` for evidence
- [ ] Explicit gate: **P2-C.1 Anthropic blocked until harness PASS**

---

## Consequences

### Positive

- Provider expansion becomes plug-in + prove, not hope
- OpenAI cannot silently redefine the contract
- Integration checkpoint remains `org-memory-p2-b-complete`

### Tradeoffs

- Slight delay before Anthropic
- Some scenarios document deferred semantics (cancellation)

---

## Next after acceptance

1. forge-isolate from `org-memory-p2-b-complete` on `ontory`
2. Blueprint: contract docs · harness runner · OpenAI+stub subjects · results
3. On PASS → unlock P2-C.1 Anthropic intent only
