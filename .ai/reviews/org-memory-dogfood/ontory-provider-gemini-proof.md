# Ontory Gemini Provider — Evidence A1/A2

| Field | Value |
|-------|-------|
| **Wave** | P2-C.2 |
| **Ontory pin** | `7241319` |
| **Baseline** | `org-memory-p2-c1-complete` |
| **ADR** | ADR-0011 |

---

## A1 — Provider execution path

Config selects `gemini` via `ONTORY_PROVIDER=gemini` + `GEMINI_API_KEY`.

```text
REST → RuntimeDispatcher → GeminiProviderAdapter (mocked in CI)
  → AIExecutionResponse envelope (provider=gemini, requestId propagated)
```

Verified by `tests/adapters/gemini-provider-adapter.test.ts` and conformance suite.

---

## A2 — Boundary isolation

| Check | Result |
|-------|--------|
| `@google/generative-ai` import only under `src/adapters/gemini/` | ✅ `check:boundary` |
| No Gemini types in `src/runtime/` or Dispatcher | ✅ |
| Default provider remains `stub` without env override | ✅ `provider-config.test.ts` |
| Model id resolved in config — adapter receives explicit `model` | ✅ `DEFAULT_GEMINI_MODEL` in config only |
| No Gemini-specific fields in shared envelopes | ✅ response/error mappers |
| Studio vendor-agnostic (no Studio changes in wave) | ✅ |

---

## Conformance gate

```bash
npm run test:conformance
# stub + openai + anthropic + gemini: 26 passed, 4 skipped (C-CAN deferred)
```

P2-C.0 contract and scenario matrix **unchanged**.

---

## Contract boundary (owner-locked)

Gemini adapter conforms to existing Ontory provider contracts. No port or envelope changes in this wave.
