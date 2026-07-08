# Ontory Provider Contract (P2-C.0)

| Field | Value |
|-------|-------|
| **Status** | Draft — frozen against P2-B upon ADR-0009 Accept |
| **Baseline** | `org-memory-p2-b-complete` |
| **Authority** | ADR-0007 · ADR-0008 · ADR-0009 (Proposed) |

---

## Port surface (frozen)

```ts
interface ProviderRuntime {
  readonly name: string;
  complete(request: AIExecutionRequest, requestId: string): Promise<AIExecutionResponse>;
}
```

Across the port, only:

- `AIExecutionRequest`
- `AIExecutionResponse`
- `ProviderError` (thrown)

**MUST NOT** cross: vendor SDK types, raw vendor error objects, provider-specific request DTOs leaked to Dispatcher/Studio.

---

## Envelope requirements (`AIExecutionResponse`)

| Field | Required | Notes |
|-------|----------|-------|
| `text` | yes | Non-empty for successful complete |
| `provider` | yes | Adapter `name` (e.g. `openai`, `stub`) — telemetry, **not** Studio routing |
| `requestId` | yes | Propagated from Dispatcher |
| `finishedAt` | yes | ISO datetime |
| `usage` | optional | Vendor-neutral (`inputChars` / `outputChars` today) — must not embed vendor field names |

Model id / latency are **not** required on the Kernel envelope in P2-B; if added later, require ADR — do not sneak OpenAI-only fields into the contract via harness.

---

## Error requirements (`ProviderError`)

Stable codes: `bad_request` · `unauthorized` · `rate_limited` · `timeout` · `provider_error` · `cancelled` · `configuration`

Rules:

- Adapters map vendor failures → these codes
- `toJSON()` envelope: `{ error, message, retryable }`
- No raw OpenAI/Anthropic/Gemini error payloads as the Studio/Runtime contract

---

## Configuration boundary

- Env/policy lives in Ontory **config** layer
- Adapters receive resolved dependencies (client, model)
- Missing credentials when vendor selected → `ProviderError(configuration)`

---

## Retry boundary

- P2-B/P2-C.0: **no ambient retry orchestrator** in adapter or Dispatcher
- Adapter may not swallow retryable failures without surfacing `ProviderError`
- Harness scenario **C-RTY** detects hidden multi-attempt success that conceals first-fail from Runtime (document expected: single attempt unless future ADR)

---

## Cancellation

P2-B port has no AbortSignal on `complete`. Harness scenario **C-CAN**:

- Maps abort-like failures when adapters throw them
- Full cooperative cancellation is **deferred** until a contract extension ADR (before or with P2-D)

---

## Conformance rule

> A provider adapter is **conformant** when it PASS the required scenario set for its registration without Kernel or Studio changes.
