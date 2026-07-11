# Ontory Anthropic Provider — Evidence A1/A2

| Field | Value |
|-------|-------|
| **Wave** | P2-C.1 |
| **Ontory pin** | `4b3e094` |
| **Baseline** | `org-memory-p2-c0-complete` |
| **ADR** | ADR-0010 |

---

## A1 — Provider execution path

Config selects `anthropic` via `ONTORY_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`.

```text
REST → RuntimeDispatcher → AnthropicProviderAdapter (mocked in CI)
  → AIExecutionResponse envelope (provider=anthropic, requestId propagated)
```

Verified by `tests/adapters/anthropic-provider-adapter.test.ts` and conformance suite.

---

## A2 — Boundary isolation

| Check | Result |
|-------|--------|
| `@anthropic-ai/sdk` import only under `src/adapters/anthropic/` | ✅ `check:boundary` |
| No Anthropic types in `src/runtime/` or Dispatcher | ✅ |
| Default provider remains `stub` without env override | ✅ `provider-config.test.ts` |
| Model id resolved in config — adapter receives explicit `model` | ✅ `DEFAULT_ANTHROPIC_MODEL` in config only |
| Studio vendor-agnostic (no Studio changes in wave) | ✅ |

---

## Conformance gate

```bash
npm run test:conformance
# stub + openai + anthropic: 19 passed, 3 skipped (C-CAN deferred)
```

P2-C.0 contract and scenario matrix **unchanged**.

---

## Contract boundary (owner-locked)

Anthropic adapter conforms to existing Ontory provider contracts. No port or envelope changes in this wave.
