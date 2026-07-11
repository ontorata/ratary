# Blueprint: P2-D.4 Anthropic Streaming Adapter

| Field | Value |
|-------|-------|
| **Status** | Closed — P2-D.4 complete 2026-07-09 |
| **Intent / Kickoff** | TASK-0029 · P2-D.4 Entry Authorization 2026-07-09 |
| **ADR** | ADR-0012 Accepted · Amended (frozen — **do not modify**) |
| **Repo** | `ontory` · branch `forge/ontory-streaming-p2-d4-anthropic` |
| **Baseline** | `org-memory-p2-d3-complete` @ `1202c5c` |
| **Isolate** | [ontory-streaming-p2-d4-anthropic-isolate.md](./ontory-streaming-p2-d4-anthropic-isolate.md) |
| **Tag (target)** | `org-memory-p2-d4-complete` |
| **Codename** | `TASK-0029` |
| **Phase** | P2-D Streaming · Wave 4 — Anthropic provider conformance |
| **Pattern reference** | P2-D.3 OpenAI streaming (closed) — mirror boundary, not copy vendor shapes |

---

## Objective

Prove the **existing** Anthropic adapter can emit a provider-neutral `AsyncIterable<AIExecutionEvent>` that satisfies ADR-0012 semantic locks — without changing the contract.

```text
Anthropic Messages Streaming API (vendor)
        │
        v
Anthropic Adapter Translation Layer
        │
        v
AIExecutionEvent (ADR-0012 frozen)
        │
        v
Existing Consumer Pipeline
```

**Invariant:** Provider changes ≠ Contract changes.

**P2-D.4 is not Anthropic semantics.** Target proof:

```text
Anthropic API
  + Existing adapter pattern (P2-D.3)
  + ADR-0012 compliance
  = Anthropic streaming conforms
```

---

## Scope lock

### Allowed

| Area | Notes |
|------|-------|
| `src/adapters/anthropic/` | Stream path, event mapper, client stream surface |
| Anthropic SSE / SDK stream consumption | Confined to adapter folder |
| `content_block_delta` → Ontory `delta` | Provider-neutral `payload.text` only |
| Usage / message_stop mapping | Neutral metadata + completed terminal |
| Error → `ProviderError` → `failed` | Reuse existing `error-mapper` |
| Adapter unit tests | Mocked stream — no live network for gate |
| Anthropic P2-D subject | `anthropic-d-lifecycle.conformance.test.ts` only |
| Evidence A1/A2 + release record | Governance closeout |

### Forbidden

| Area | Reason |
|------|--------|
| ADR-0012 / semantic locks | Immutable from P2-D.2 |
| `AIExecutionEvent` / event type union | Frozen envelope |
| Lifecycle validators / consumer tests | Proof layer locked |
| `tests/conformance/scenarios/d-*.ts` | Inherit as-is — no scenario mutation |
| New lifecycle states | FSM frozen |
| Anthropic-specific fields on shared envelopes | P2-C envelope rule |
| Gemini streaming | P2-D.5 |
| OpenAI adapter changes | Already closed at P2-D.3 |
| REST SSE transport in core | Transport-agnostic core |
| `complete()` semantics changes | P2-C path must stay green |

---

## Existing Anthropic provider surface

```text
src/adapters/anthropic/
├── anthropic-provider-adapter.ts  # complete() live; stream() = not_implemented
├── anthropic-client.ts            # Official SDK factory + thin client port
├── request-mapper.ts              # AIExecutionRequest → Messages params
├── response-mapper.ts             # Message → AIExecutionResponse
├── error-mapper.ts                # Vendor failure → ProviderError
└── index.ts
```

**Entry point:** `AnthropicProviderAdapter.stream(request, requestId, signal?)`.

Today:

```ts
async *stream(...): AsyncIterable<AIExecutionEvent> {
  throw new ProviderError('not_implemented', 'Anthropic streaming deferred to P2-D.4');
}
```

P2-D.4 replaces that stub. `complete()` remains unchanged.

---

## Proposed adapter files (mirror P2-D.3 pattern)

| File | Role |
|------|------|
| `stream-event-mapper.ts` | Pure: Anthropic stream-event facts → mapper actions / event factories |
| Client port extension in `anthropic-client.ts` | `messages.stream(...)` → `AsyncIterable` of plain event facts |
| `anthropic-provider-adapter.ts` | Orchestrate: started → map events → terminal; honor `CancellationSignal` |

Reuse:

- `request-mapper.ts` for model / system / messages / max_tokens
- `error-mapper.ts` for vendor failures
- Response-mapper usage conventions (`input_tokens` / `output_tokens` → `inputChars` / `outputChars`)

SDK (`@anthropic-ai/sdk`) remains allowlisted only under `src/adapters/anthropic/`.

---

## Anthropic event translation rules

Vendor frames stay inside the adapter. Outward events MUST match ADR-0012.

### Mapping table

| Anthropic native | Ontory |
|------------------|--------|
| Stream open / first yield | Adapter emits `started` (sequence `1`) |
| `content_block_delta` with `delta.type === 'text_delta'` and non-empty `delta.text` | `delta` with `payload: { text }` |
| `message_delta` / final usage (`input_tokens`, `output_tokens`) | Hold for late `metadata` and/or `completed.payload.usage` |
| `message_stop` (or clean stream end after text) | `completed` terminal |
| Mapped vendor API error | `failed` with `{ code, message }` from `ProviderError` |
| `CancellationSignal.cancelled` | `cancelled` terminal (ADR-0012 FSM) |

### Explicit ignore / defer

| Anthropic event | Action |
|-----------------|--------|
| `message_start` | ignore (adapter already emitted `started`) |
| `content_block_start` / `content_block_stop` | ignore (structural) |
| `ping` | ignore |
| Empty `text_delta` | ignore (no delta event) |
| Tool / thinking blocks | **out of scope** — do not emit `tool_call` lifecycle in P2-D.4 |

### Delta payload lock

```ts
// REQUIRED
{ type: 'delta', payload: { text: '...' } }

// FORBIDDEN
{ type: 'delta', payload: { content: '...' } }
{ type: 'delta', payload: { text_delta: '...' } }  // Anthropic field leakage
```

Adapter may read Anthropic `delta.text` internally; it MUST emit Ontory `text`.

---

## Terminal emission guarantee

Per stream instance (identical to P2-D.3 / ADR-0012):

1. Exactly **one** terminal: `completed` | `failed` | `cancelled`
2. Terminal is **last**
3. Sequence starts at `1`, strictly increasing, no gaps
4. First non-terminal is `started` (except cancel-before-start → direct `cancelled`)

### Completed payload

```ts
{
  type: 'completed',
  payload: {
    response?: AIExecutionResponse;
    usage?: { inputChars: number; outputChars: number };
  }
}
```

Accumulate streamed text for `response.text` when possible.

### Usage metadata timing

| Source | Timing |
|--------|--------|
| Anthropic usage on `message_delta` / end | Late `metadata` **before** terminal and/or fold into `completed.payload.usage` |
| No usage | Omit — do not invent tokens |
| Early hints | Optional early `metadata` after `started` — neutral fields only |

**Forbidden:** `metadata` after terminal.

---

## Error normalization path

```text
Anthropic API / SDK error
        │
        v
mapAnthropicFailureToProviderError (existing)
        │
        v
ProviderError
        │
        v
AIExecutionEvent { type: 'failed', payload: { code, message } }
```

No raw SDK error objects across `ProviderRuntime`.

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

Rules inherited from ADR-0012 / P2-D.2 / proven on OpenAI P2-D.3:

- Cancel before start → `cancelled`
- Cancel during deltas → stop further deltas; emit `cancelled`
- Cancel after terminal → no-op
- Double cancel → idempotent
- Cancel vs completion race → first terminal wins

`AbortController` MUST NOT appear in `src/runtime/`.

---

## Client port extension

```ts
// Conceptual — exact shape during implement
type AnthropicMessagesClient = {
  messages: {
    create(params): Promise<AnthropicMessageLike>; // existing
    stream(
      params: AnthropicMessageCreateParams,
      options?: { signal?: AbortSignal },
    ): AsyncIterable<AnthropicStreamEventLike>; // plain facts only
  };
};
```

`asAnthropicMessagesClient` updates stay in `anthropic-client.ts`.  
Client MUST NOT emit `AIExecutionEvent`. Tests inject mocked async iterables.

---

## Test inheritance mapping

### Do not modify

- `tests/conformance/scenarios/d-lifecycle.ts`
- `tests/conformance/scenarios/d-cancellation.ts`
- `tests/conformance/scenarios/d-sequence.ts`
- `tests/runtime/lifecycle-validator.ts` (+ unit suites)
- Stub / OpenAI D subjects

### Add

| Artifact | Purpose |
|----------|---------|
| `tests/conformance/anthropic-d-lifecycle.conformance.test.ts` | Same 13 runners against Anthropic (mocked stream) |
| `tests/adapters/anthropic-stream-*.test.ts` | Unit: event→action mapping, stop, usage, cancel, errors |
| Existing `anthropic.conformance.test.ts` | Must remain PASS (P2-C complete path) |

### Acceptance count (gate)

| Suite | Count | Role |
|-------|-------|------|
| P2-D inherited on Anthropic | **13** | Lifecycle / cancel / sequence |
| P2-C Anthropic subject | **8** (1 skipped C-CAN) | complete() regression |
| Full suite regression | stub + openai (+ D subject) + gemini + runtime | Must stay green |

---

## Execution tasks

- [x] Task 0 — forge-isolate from `org-memory-p2-d3-complete`
- [x] Task 1 — Owner approve this blueprint
- [x] Task 2 — Stream event mapper (pure) + unit tests
- [x] Task 3 — Client stream port + SDK wiring
- [x] Task 4 — `AnthropicProviderAdapter.stream()` orchestration + cancellation
- [x] Task 5 — Anthropic P2-D conformance subject (13 scenarios)
- [x] Task 6 — Gates: `npm test` · `typecheck` · `check:boundary` · regression
- [x] Task 7 — Evidence A1/A2 + acceptance + release record
- [x] Task 8 — Tag `org-memory-p2-d4-complete`

---

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC-1 | Anthropic `stream()` yields ADR-0012-valid event sequences (mocked) |
| AC-2 | `text_delta` → `payload.text` (no Anthropic field leakage) |
| AC-3 | Terminal exactly once; `completed` / `failed` / `cancelled` per FSM |
| AC-4 | CancellationSignal aborts vendor stream internally |
| AC-5 | Errors normalize via existing error-mapper → `failed` |
| AC-6 | Usage timing: late metadata and/or completed.usage; never after terminal |
| AC-7 | 13 P2-D scenarios PASS on Anthropic subject without scenario edits |
| AC-8 | P2-C Anthropic + OpenAI D + stub + gemini regression green |
| AC-9 | ADR-0012 and runtime contracts unchanged |
| AC-10 | Boundary check PASS (`@anthropic-ai/sdk` only under adapters/anthropic) |

---

## Definition of Done

```text
org-memory-p2-d3-complete
        +
Anthropic streaming adapter
        +
13 P2-D scenarios PASS (Anthropic subject)
        +
P2-C regression green
        +
ADR-0012 unchanged
        +
Evidence A1/A2

        ↓

org-memory-p2-d4-complete
```

---

## Evidence pack (Task 7)

| Artifact | Path |
|----------|------|
| Proof | `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-d4-anthropic-proof.md` |
| Acceptance | `.ai/reviews/org-memory-dogfood/P2-D-4-ACCEPTANCE.md` |
| Release | `.ai/governance/releases/P2-D-4-ONTORY-ANTHROPIC-STREAMING.md` |

---

## Risks / open notes

1. **SDK stream shape** — Prefer official SDK async iterable / MessageStream; still map to frozen events.
2. **Usage timing** — Anthropic often sends usage on `message_delta` near end; emit metadata before terminal.
3. **Structural events** — `message_start` / block start-stop must not become Ontory event types.
4. **Pattern fidelity** — Follow P2-D.3 responsibility split (client=transport, mapper=interpretation, adapter=semantics).

---

## Explicit non-goals

- P2-E Native Intelligence
- Gemini streaming
- Tool / thinking stream mapping
- Capability negotiation / routing
- Changing OpenAI or stub lifecycle validators
- Live credential streaming as harness acceptance

---

## Gate status

| Gate | Status |
|------|--------|
| Isolate | ✅ Active @ `1202c5c` |
| Blueprint | ✅ Approved |
| Task 2 Stream event mapper | ✅ Complete |
| Task 3 Client stream port | ✅ Complete |
| Task 4 Adapter.stream orchestration | ✅ Complete |
| Task 5 Anthropic P2-D subject (13) | ✅ Complete |
| Task 6–8 Evidence + closeout + tag | ✅ Complete |
| P2-D.5 Gemini | ⏳ NEXT from `org-memory-p2-d4-complete` |
