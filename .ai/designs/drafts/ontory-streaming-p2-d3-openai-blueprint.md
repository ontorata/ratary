# Blueprint: P2-D.3 OpenAI Streaming Adapter

| Field | Value |
|-------|-------|
| **Status** | Closed — P2-D.3 complete 2026-07-09 |

| **Intent / Kickoff** | TASK-0028 · P2-D.3 Forge Authorization 2026-07-09 |
| **ADR** | ADR-0012 Accepted · Amended (frozen — **do not modify**) |
| **Repo** | `ontory` · branch `forge/ontory-streaming-p2-d3-openai` |
| **Baseline** | `org-memory-p2-d2-complete` @ `9b63290` |
| **Isolate** | [ontory-streaming-p2-d3-openai-isolate.md](./ontory-streaming-p2-d3-openai-isolate.md) |
| **Tag (target)** | `org-memory-p2-d3-complete` |
| **Codename** | `TASK-0028` |
| **Phase** | P2-D Streaming · Wave 3 — OpenAI provider conformance |

---

## Objective

Prove the **existing** OpenAI adapter can emit a provider-neutral `AsyncIterable<AIExecutionEvent>` that satisfies ADR-0012 semantic locks — without changing the contract.

```text
OpenAI Streaming API (vendor)
        │
        v
OpenAI Adapter Translation Layer
        │
        v
AIExecutionEvent (ADR-0012 frozen)
        │
        v
Existing Consumer Pipeline
```

**Invariant:** Provider changes ≠ Contract changes.

---

## Scope lock

### Allowed

| Area | Notes |
|------|-------|
| `src/adapters/openai/` | Stream path, chunk mapper, client stream surface |
| OpenAI SSE / SDK stream consumption | Confined to adapter folder |
| Delta / finish_reason / usage mapping | Provider-neutral payloads only |
| Error → `ProviderError` → `failed` event | Reuse existing error-mapper |
| Adapter unit tests | Mocked stream client — no live network required for gate |
| OpenAI subject inheritance of P2-D scenarios | New subject file only — **no scenario edits** |
| Evidence A1/A2 + release record | Governance closeout |

### Forbidden

| Area | Reason |
|------|--------|
| ADR-0012 / semantic locks | Immutable anchor from P2-D.2 |
| `AIExecutionEvent` / event type union | Frozen envelope |
| Lifecycle validators / consumer contract tests | Proof layer already locked |
| `tests/conformance/scenarios/d-*.ts` | Inherit as-is — no `d-openai-*` scenario files |
| New lifecycle states | FSM frozen |
| OpenAI-specific fields on shared envelopes | P2-C envelope rule |
| Anthropic / Gemini streaming | P2-D.4 / P2-D.5 |
| REST SSE transport adapter | Outside provider adapter; core stays transport-agnostic |
| `complete()` semantics changes | P2-C path must remain green |

---

## Existing OpenAI provider surface

Current layout (preserve architecture; extend, do not restructure):

```text
src/adapters/openai/
├── openai-provider-adapter.ts   # ProviderRuntime — complete() live; stream() = not_implemented
├── openai-client.ts             # Official SDK factory + thin client port
├── request-mapper.ts            # AIExecutionRequest → Chat Completions params
├── response-mapper.ts           # ChatCompletion → AIExecutionResponse
├── error-mapper.ts              # Vendor failure → ProviderError
└── index.ts
```

**Entry point:** `OpenAIProviderAdapter.stream(request, requestId, signal?)`.

Today:

```ts
async *stream(...): AsyncIterable<AIExecutionEvent> {
  throw new ProviderError('not_implemented', 'OpenAI streaming deferred to P2-D.3');
}
```

P2-D.3 replaces that stub with a real translation loop. `complete()` remains unchanged.

---

## Proposed adapter files (preserve existing pattern)

Add thin modules beside existing mappers (names may adjust slightly if needed; do not invent a parallel package):

| File | Role |
|------|------|
| `stream-event-mapper.ts` (or `event-mapper.ts`) | Pure: OpenAI chunk-like facts → `AIExecutionEvent` payloads |
| Stream support in `openai-client.ts` / client port | Extend `OpenAIChatClient` with streaming create (or parallel stream port) |
| `openai-provider-adapter.ts` | Orchestrate: started → map chunks → terminal; honor `CancellationSignal` |

Reuse:

- `request-mapper.ts` for messages/model
- `error-mapper.ts` for vendor failures
- `response-mapper.ts` patterns for final text/usage normalization where applicable

SDK (`openai`) remains allowlisted only under `src/adapters/openai/`.

---

## SSE / chunk translation rules

Vendor frames stay inside the adapter. Outward events MUST match ADR-0012.

### Mapping table

| OpenAI native | Ontory event |
|---------------|--------------|
| Stream open / first yield | `started` (sequence `1`) |
| `choices[0].delta.content` (non-empty string) | `delta` with `payload: { text: string }` |
| Optional early/late usage or model hints (neutral only) | `metadata` (optional) |
| `finish_reason` present / stream end with success | `completed` (exactly one terminal) |
| Mapped vendor API error | `failed` with `{ code, message }` from `ProviderError` |
| `CancellationSignal.cancelled` before/during stream | `cancelled` terminal (ADR-0012 FSM) |

### Delta payload lock (corrects kickoff shorthand)

Kickoff text used `payload.content`. **ADR-0012 wins:**

```ts
// REQUIRED
{ type: 'delta', payload: { text: '...' } }

// FORBIDDEN in shared contract
{ type: 'delta', payload: { content: '...' } }  // OpenAI field name leakage
```

Adapter may read OpenAI `delta.content` internally; it MUST emit `text`.

### Empty / skip rules

- Empty `delta.content` → do not emit a delta event
- Role-only / empty chunks → ignore
- `tool_calls` in stream → **out of scope** (do not emit `tool_call` lifecycle in P2-D.3; reserved type remains deferred)

---

## Terminal emission guarantee

Per stream instance:

1. Exactly **one** terminal: `completed` | `failed` | `cancelled`
2. Terminal is **last** — no further yields
3. Sequence starts at `1`, strictly increasing, no gaps
4. First non-terminal event is `started` (except cancel-before-start → direct `cancelled`, same as stub / D-CANCEL-1)

### Completed payload

Follow ADR-0012 completed flexibility:

```ts
{
  type: 'completed',
  payload: {
    response?: AIExecutionResponse; // preferred when text available
    usage?: { inputChars: number; outputChars: number };
    metadata?: Record<string, unknown>; // vendor-neutral only
  }
}
```

Accumulate streamed text for `response.text` when possible so consumers can treat stream completion like a final envelope.

### Usage metadata timing

| Source | Timing |
|--------|--------|
| OpenAI stream `usage` (if present on final chunk / include_usage) | Prefer late `metadata` **before** terminal, and/or fold into `completed.payload.usage` |
| No usage from vendor | Omit usage — do not invent tokens |
| Early model/routing hints | Optional early `metadata` after `started` — neutral fields only |

**Forbidden:** emit `metadata` after terminal.

---

## Error normalization path

```text
OpenAI API / SDK error
        │
        v
mapOpenAIFailureToProviderError (existing)
        │
        v
ProviderError { code, message, retryable, ... }
        │
        v
AIExecutionEvent {
  type: 'failed',
  payload: { code, message }  // no raw SDK error object
}
```

If failure occurs before any event: still emit a valid stream ending in `failed` (or throw only if stream never started — prefer yielding `failed` for consumer uniformity when `stream()` has begun). Match stub/conformance expectations: consumers iterate events; terminal `failed` is valid.

Do **not** expose OpenAI exception classes across `ProviderRuntime`.

---

## Cancellation boundary

```text
CancellationSignal (runtime)
        │
        v
Adapter observes signal.cancelled / onCancel
        │
        v
Abort vendor stream internally (AbortController inside adapter only)
        │
        v
AIExecutionEvent { type: 'cancelled' }  // if not already terminal
```

Rules (inherited from ADR-0012 / P2-D.2):

- Cancel before start → `cancelled` terminal (started optional/absent OK)
- Cancel during deltas → stop further deltas; emit `cancelled`
- Cancel after terminal → no-op
- Double cancel → idempotent
- Cancel vs provider completion race → first terminal wins

`AbortController` / SDK abort types MUST NOT appear in `src/runtime/`.

---

## Client port extension

Extend the thin client surface without leaking SDK types through `ProviderRuntime`:

```ts
// Conceptual — exact shape during implement
type OpenAIChatClient = {
  chat: {
    completions: {
      create(params): Promise<OpenAIChatCompletionLike>; // existing complete path
      // streaming: create({ ...params, stream: true }) → AsyncIterable<chunk-like>
    };
  };
};
```

`asOpenAISdkClient` / factory updates stay in `openai-client.ts`. Tests inject mocked async iterables.

---

## Test inheritance mapping

### Do not modify

- `tests/conformance/scenarios/d-lifecycle.ts`
- `tests/conformance/scenarios/d-cancellation.ts`
- `tests/conformance/scenarios/d-sequence.ts`
- `tests/runtime/lifecycle-validator.ts` (+ unit suites)
- Stub subject `stub-d-lifecycle.conformance.test.ts`

### Add

| Artifact | Purpose |
|----------|---------|
| `tests/conformance/openai-d-lifecycle.conformance.test.ts` | Same 13 runners against OpenAI adapter (mocked stream) |
| `tests/adapters/openai-stream-*.test.ts` | Unit: chunk→event mapping, finish_reason, usage, cancel, errors |
| Existing `openai.conformance.test.ts` | Must remain PASS (P2-C complete path) |

### Acceptance count (gate)

| Suite | Count | Role |
|-------|-------|------|
| P2-D inherited scenarios on OpenAI | **13** | Lifecycle / cancel / sequence |
| P2-C OpenAI subject | **8** (1 skipped C-CAN) | complete() regression |
| Full suite regression | stub + anthropic + gemini + runtime | Must stay green |

**“21 inherited scenarios”** = 13 P2-D + OpenAI P2-C subject coverage (including skipped C-CAN as deferred, not failed). All runnable inherited cases MUST PASS.

---

## Execution tasks

- [x] Task 0 — forge-isolate from `org-memory-p2-d2-complete`
- [x] Task 1 — Owner approve this blueprint
- [x] Task 2 — Stream event mapper (pure) + unit tests
- [x] Task 3 — Client stream port + SDK wiring (`stream: true`)
- [x] Task 4 — `OpenAIProviderAdapter.stream()` orchestration + cancellation
- [x] Task 5 — OpenAI P2-D conformance subject (13 scenarios)
- [x] Task 6 — Gates: `npm test` · `typecheck` · `check:boundary` · P2-C regression
- [x] Task 7 — Evidence A1/A2 + acceptance + release record
- [x] Task 8 — Tag `org-memory-p2-d3-complete`


---

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC-1 | OpenAI `stream()` yields ADR-0012-valid event sequences (mocked) |
| AC-2 | Delta maps `delta.content` → `payload.text` (no `content` leakage) |
| AC-3 | Terminal exactly once; `completed` / `failed` / `cancelled` per FSM |
| AC-4 | CancellationSignal aborts vendor stream internally; emits `cancelled` when appropriate |
| AC-5 | Errors normalize via existing error-mapper → `failed` payload |
| AC-6 | Usage timing: late metadata and/or completed.usage; never after terminal |
| AC-7 | 13 P2-D scenarios PASS on OpenAI subject without scenario file edits |
| AC-8 | P2-C OpenAI + stub + anthropic + gemini regression green |
| AC-9 | ADR-0012 and runtime contracts unchanged (diff review) |
| AC-10 | Boundary check PASS (`openai` SDK only under adapters/openai) |

---

## Definition of Done

```text
org-memory-p2-d2-complete
        +
OpenAI streaming adapter
        +
13 P2-D scenarios PASS (OpenAI subject)
        +
P2-C regression green
        +
ADR-0012 unchanged
        +
Evidence A1/A2

        ↓

org-memory-p2-d3-complete
```

---

## Evidence pack (Task 7)

| Artifact | Path |
|----------|------|
| Proof | `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-d3-openai-proof.md` |
| Acceptance | `.ai/reviews/org-memory-dogfood/P2-D-3-ACCEPTANCE.md` |
| Release | `.ai/governance/releases/P2-D-3-ONTORY-OPENAI-STREAMING.md` |

---

## Risks / open notes

1. **SDK stream shape** — Official `openai` package stream vs raw SSE; prefer SDK async iterable inside adapter, still map to frozen events.
2. **Usage availability** — Some stream modes omit usage unless `stream_options.include_usage`; adapter should request when supported, tolerate absence.
3. **Kickoff `content` vs ADR `text`** — Blueprint locks `text`; implementation must follow ADR.
4. **Cancel-before-start** — Match stub semantics already proven in D-CANCEL-1.

---

## Explicit non-goals

- P2-E Native Intelligence
- Anthropic / Gemini streaming
- Tool call streaming
- Capability negotiation / routing
- Changing stub lifecycle validators
- Live credential streaming as harness acceptance (operational verification only)

---

## Gate status

| Gate | Status |
|------|--------|
| Isolate | ✅ Active @ `9b63290` |
| Blueprint | ✅ Approved |
| Task 2 Stream event mapper | ✅ Complete |
| Task 3 Client stream port | ✅ Complete |
| Task 4 Adapter.stream orchestration | ✅ Complete |
| Task 5 OpenAI P2-D subject (13) | ✅ Complete |
| Task 6–8 Evidence + closeout + tag | ✅ Complete |
| P2-D.4 Anthropic | ⏳ NEXT from `org-memory-p2-d3-complete` |
| P2-D.5 Gemini | 🔒 Blocked until P2-D.4 |

