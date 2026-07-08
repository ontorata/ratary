# ADR-0009 — Provider Conformance Harness (P2-C.0)

| Field | Value |
|-------|-------|
| **Status** | **Accepted · Closed** |
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

| ID | Scenario | OpenAI | Stub | Purpose |
|----|----------|--------|------|---------|
| C-REQ | Request mapping | MUST | OPTIONAL / covered by mapping | Runtime request → provider-facing params (via mapper / adapter path) |
| C-RES | Response normalization | MUST | MUST | Provider-like payload → `AIExecutionResponse` envelope |
| C-ERR | Error mapping | MUST | MUST | Failure facts → `ProviderError` codes |
| C-TMO | Timeout | MUST | MUST | Timeout/abort-like failure → `ProviderError(timeout)` |
| C-CAN | Cancellation | DEFER | DEFER | Lifecycle cancellation contract requires later execution lifecycle support |
| C-META | Metadata envelope | MUST | MUST | `provider`, `requestId`, `finishedAt`, optional `usage` present and vendor-neutral |
| C-CFG | Configuration failure | MUST | MUST | Missing key / invalid provider → `ProviderError(configuration)` |
| C-RTY | Retry boundary | MUST | OPTIONAL | Adapter must not silently retry in ways that hide errors from Runtime (no ambient retry orchestrator) |

### Governance output layout

```text
.ai/governance/provider-conformance/
  contract.md
  scenarios/
  results/
```

Executable harness lives in **ontory** (e.g. `tests/conformance/` + `npm run test:conformance`) and writes/links results under governance `results/` when run for evidence. The `ai-brain` governance mirror also exposes `npm run test:conformance` to verify that accepted contract artifacts and checked-in results remain aligned.

### Locked principles

1. **P2-B contracts are frozen** — harness validates; it does not quietly extend OpenAI golden-path fields into the Kernel.
2. **No `if (provider === 'openai')` in Dispatcher/Runtime** — conformance shares scenarios; adapters remain the only vendor branch points.
3. **Capability negotiation is out of P2-C.0** — belongs after ≥2 real vendors (P2-C.2+).
4. **Streaming is out** — P2-D.
5. **Anthropic/Gemini code is out** — P2-C.1 / P2-C.2.

### Deferred probes (honest gaps)

P2-B `ProviderRuntime.complete` has no AbortSignal parameter yet. Scenario **C-CAN** is accepted as:

```text
C-CAN
Status: deferred

Reason:
ProviderRuntime cancellation contract requires execution lifecycle support.

Target:
P2-D Streaming / execution lifecycle wave
```

Harness must not pretend cancellation is fully productized if the port cannot cancel an in-flight call.

### Accepted owner decisions

1. **C-CAN:** defer implementation, preserve contract awareness, and keep a scenario placeholder. Do not add an active field contract in P2-C.0.
2. **Command:** use `npm run test:conformance`.
3. **Stub matrix:** required subset is **C-RES / C-META / C-CFG**. Stub may also run C-ERR/C-TMO to prove the boundary, but it does not need to simulate a full vendor.

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

- [x] ADR-0009 Accepted
- [x] `contract.md` published under `.ai/governance/provider-conformance/`
- [x] Scenario catalog checked in under `scenarios/`
- [x] CI/local command documented as `npm run test:conformance`
- [x] OpenAI (mocked) + stub subjects PASS required scenarios
- [x] C-CAN disposition recorded as deferred with ADR note
- [x] Results snapshot in `results/` for evidence
- [x] Explicit gate: **P2-C.1 Anthropic blocked until harness PASS**

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

P2-C.0 is closed at the governance/evidence layer. Do not add new scenarios or providers to this acceptance baseline before P2-C.1.

P2-C.1 Anthropic may open as a separate adapter wave only when:

1. Anthropic adapter implementation is complete.
2. `ProviderRuntime` contract remains unchanged unless a later ADR accepts a change.
3. `npm run test:conformance` passes.
4. `.ai/governance/provider-conformance/results/anthropic-pass.md` is added.
5. ADR-0009 is updated only as an extension note, not as a P2-C.0 revision.

---

## Extension note — P2-C.1 Anthropic subject registered (2026-07-08)

P2-C.1 added **Anthropic** as a conformance subject via `tests/conformance/anthropic.conformance.test.ts` and `results/anthropic-pass.md`. This is **not** a revision of the P2-C.0 scenario matrix or Provider Contract.

| Field | Value |
|-------|-------|
| Ontory commit | `4b3e094` |
| Closeout tag | `org-memory-p2-c1-complete` |
| Contract change | **None** |
| Harness matrix change | **None** — new subject file only |

---

## Extension note — P2-C.2 Gemini subject registered (2026-07-09)

P2-C.2 added **Gemini** as a conformance subject via `tests/conformance/gemini.conformance.test.ts` and `results/gemini-pass.md`. This is **not** a revision of the P2-C.0 scenario matrix or Provider Contract.

| Field | Value |
|-------|-------|
| Ontory commit | `7241319` |
| Closeout tag | `org-memory-p2-c2-complete` |
| Contract change | **None** |
| Harness matrix change | **None** — new subject file only |
| Envelope rule | No Gemini-specific fields in shared envelopes |
