# Provider Conformance Scenario Catalog (P2-C.0)

| ID | Title | Required for OpenAI | Required for Stub | Notes |
|----|-------|---------------------|-------------------|-------|
| C-REQ | Request mapping | ✅ | ⏭ N/A (stub has no vendor params) | Pure mapper / adapter prep |
| C-RES | Response normalization | ✅ | ✅ | Envelope shape |
| C-ERR | Error mapping | ✅ | ⏭ optional | Unauthorized / bad_request / provider_error |
| C-TMO | Timeout | ✅ | ⏭ optional | AbortError / ETIMEDOUT → timeout |
| C-CAN | Cancellation | ⚠ probe/deferred | ⏭ | Document disposition in results |
| C-META | Metadata envelope | ✅ | ✅ | provider · requestId · finishedAt · usage optional |
| C-CFG | Configuration failure | ✅ (config path) | ⏭ | openai without key → configuration |
| C-RTY | Retry boundary | ✅ | ⏭ | No silent multi-retry in adapter |

Executable implementations: Ontory `tests/conformance/` (after ADR Accept + isolate).
