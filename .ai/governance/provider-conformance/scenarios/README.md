# Provider Conformance Scenario Catalog (P2-C.0)

| ID | Title | OpenAI | Stub | Notes |
|----|-------|--------|------|-------|
| C-REQ | Request mapping | MUST | OPTIONAL / covered by mapping | Pure mapper / adapter prep |
| C-RES | Response normalization | MUST | MUST | Envelope shape |
| C-ERR | Error mapping | MUST | MUST | Unauthorized / bad_request / provider_error |
| C-TMO | Timeout | MUST | MUST | AbortError / ETIMEDOUT → timeout |
| C-CAN | Cancellation | DEFER | DEFER | Lifecycle cancellation contract requires P2-D execution lifecycle support |
| C-META | Metadata envelope | MUST | MUST | provider · requestId · finishedAt · usage optional |
| C-CFG | Configuration failure | MUST | MUST | missing key / invalid provider → configuration |
| C-RTY | Retry boundary | MUST | OPTIONAL | No silent multi-retry in adapter |

Stub required subset: **C-RES / C-META / C-CFG**. C-ERR and C-TMO are included in P2-C.0 to prove boundary behavior without simulating a complete vendor.

Executable command: `npm run test:conformance`.
