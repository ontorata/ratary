# Anthropic Provider Conformance Result

| Field | Value |
|-------|-------|
| Provider subject | Anthropic adapter |
| Wave | P2-C.1 |
| Harness baseline | `org-memory-p2-c0-complete` |
| Closeout tag | `org-memory-p2-c1-complete` |
| Ontory commit | `4b3e094` |
| Verified at | 2026-07-08T23:53:00+07:00 |
| Command | `npm run test:conformance` |
| Overall | PASS |

| Scenario | Status | Evidence |
|----------|--------|----------|
| C-REQ | PASS | System+context fold and user prompt map to Messages API params; model from config. |
| C-RES | PASS | Text blocks normalized to `AIExecutionResponse` with non-empty `text`. |
| C-ERR | PASS | Mocked auth/invalid_request failures map to stable `ProviderError` codes. |
| C-TMO | PASS | AbortError surfaces as `ProviderError(timeout)`. |
| C-CAN | SKIPPED | Deferred: `ProviderRuntime` cancellation requires P2-D execution lifecycle. |
| C-META | PASS | Envelope includes `provider`, `requestId`, `finishedAt`, token-derived usage when present. |
| C-CFG | PASS | Unknown provider / missing `ANTHROPIC_API_KEY` → `ProviderError(configuration)`. |
| C-RTY | PASS | Mocked client invoked once on failure — no silent ambient retry. |

Harness: `tests/conformance/anthropic.conformance.test.ts` · P2-C.0 contract unchanged.

Regression: stub + openai conformance subjects remain PASS.
