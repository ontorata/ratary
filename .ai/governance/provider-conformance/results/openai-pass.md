# OpenAI Provider Conformance Result

| Field | Value |
|-------|-------|
| Provider subject | OpenAI adapter |
| Wave | P2-C.0 |
| Baseline | `org-memory-p2-b-complete` |
| Harness tag | `org-memory-p2-c0-complete` |
| Ontory commit | `8e307ce` |
| Verified at | 2026-07-08T23:41:00+07:00 |
| Command | `npm run test:conformance` |
| Overall | PASS |

| Scenario | Status | Evidence |
|----------|--------|----------|
| C-REQ | PASS | Request mapper preserves frozen `AIExecutionRequest` boundary; provider params stay adapter-local. |
| C-RES | PASS | Response normalized to `AIExecutionResponse` with non-empty `text`. |
| C-ERR | PASS | Mocked vendor failures map to stable `ProviderError` codes (401, 400). |
| C-TMO | PASS | AbortError surfaces as `ProviderError(timeout)`. |
| C-CAN | SKIPPED | Deferred: `ProviderRuntime` cancellation requires P2-D execution lifecycle. |
| C-META | PASS | Envelope includes `provider`, `requestId`, `finishedAt`, vendor-neutral `usage`. |
| C-CFG | PASS | Missing OpenAI configuration fails as `ProviderError(configuration)`. |
| C-RTY | PASS | Mocked client invoked once on failure — no silent ambient retry. |

Harness: `tests/conformance/openai.conformance.test.ts` · Runtime `src/` unchanged.
