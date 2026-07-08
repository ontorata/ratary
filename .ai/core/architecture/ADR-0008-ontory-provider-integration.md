# ADR-0008 — Ontory Provider Integration (P2-B · OpenAI First)

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — awaiting owner acceptance before isolate |
| **Date** | 2026-07-08 |
| **Baseline** | `org-memory-p2-a-complete` (Ontory `c18cacc` · Studio `043666e` · ai-brain `35ff553`) |
| **Related** | ADR-0007 · FROZEN-BOUNDARY-BYPASS-POLICY · P2-A Runtime Kernel |
| **Deciders** | Engineering · Product (owner) |
| **Host repo** | `ontory` (adapters only) |
| **First concrete provider** | OpenAI Chat Completions |
| **Studio impact** | **None required** for success (contracts unchanged) |

---

## Context

P2-A locked the Runtime Kernel:

```text
Studio → WorkspaceAiRuntimePort → REST → Dispatcher → ProviderRuntime (stub) → AIExecutionResponse
```

`ProviderRuntime` exists and the Dispatcher is provider-agnostic. Execution still returns stub text. The next layer is a **real vendor adapter** behind that port — without collapsing kernel contracts or teaching Studio about vendors.

Pressure to avoid: putting `openai` in Studio, hard-coding `"provider": "openai"` in UI requests, or expanding P2-B into tools / MCP / agents.

---

## Decision

Execute **P2-B Provider Integration** with **OpenAI as the first concrete adapter**, implementing only:

```text
AIExecutionRequest
        │
        ▼
OpenAIProviderAdapter  (implements ProviderRuntime)
        ├── RequestMapper
        ├── ResponseMapper
        ├── ErrorMapper
        └── HttpClient
        │
        ▼
OpenAI Chat Completions API
        │
        ▼
AIExecutionResponse
```

Dispatcher continues to inject `ProviderRuntime`; it must not gain OpenAI payload knowledge.

### Provider priority (roadmap, not all in P2-B first wave)

| Order | Provider | Wave |
|-------|----------|------|
| 1 | **OpenAI** | **P2-B first** |
| 2 | Anthropic | P2-B follow-on or P2-B.1 |
| 3 | Gemini | later |
| 4 | Local / OpenAI-compatible (Ollama, vLLM, LM Studio) | later |

OpenAI first: broadest API reference; many peers mirror chat/completions; first adapter shapes mapping/error boundaries for the rest.

### Acceptance rule (non-negotiable)

> **Studio must not know which provider is used.**

Forbidden in Studio:

- hard-coded `"provider": "openai"` (or any vendor) on outbound execution requests as a routing decision
- vendor SDK imports
- `if (provider === 'openai')` branching in UI/application layers

Vendor knowledge **stops in Ontory**. Swapping OpenAI → Anthropic → Gemini → Ollama → OpenRouter → Azure OpenAI must not require Studio or Kernel contract changes — only adapter work behind `ProviderRuntime`.

*(Response field `provider: string` remains a **telemetry / envelope label** filled by Ontory after execution — Studio may display it later but must not use it to select vendors.)*

### Locked implementation decisions (P2-B)

#### D1 — Keep `ProviderRuntime` unchanged as the port

Existing interface (P2-A) remains the only adapter contract:

```ts
interface ProviderRuntime {
  readonly name: string;
  complete(request: AIExecutionRequest, requestId: string): Promise<AIExecutionResponse>;
}
```

Do not invent a second “ProviderPort” type that duplicates this.

#### D2 — OpenAI via thin mappers + HTTP (or official SDK confined to adapter package)

Vendor coupling lives under `ontory/src/adapters/openai/` only.  
Official SDK is allowed **inside that folder** if it improves correctness; alternatively raw HTTPS Chat Completions. Prefer the smaller surface that still maps cleanly to envelopes.

#### D3 — Configuration is Ontory-only

Examples: `ONTORY_PROVIDER=openai|stub`, `OPENAI_API_KEY`, `OPENAI_MODEL`, base URL, timeout.  
Studio continues to send `AIExecutionRequest` only; it does not pass API keys or vendor model IDs as routing control (optional future: capability hints in metadata **without** vendor names — deferred).

#### D4 — Streaming deferred

P2-B first wave is **non-streaming** `complete()` only. Streaming is a later ADR/wave; do not enlarge Dispatcher for streams now.

#### D5 — Error normalization into Ontory error envelope

Map vendor HTTP/SDK failures to stable Ontory errors (e.g. `bad_request`, `unauthorized`, `rate_limited`, `provider_error`, `timeout`) without leaking raw OpenAI error JSON to Studio as the contract.

#### D6 — Timeout & cancellation

Request-scoped timeout; honor abort/cancel when wired through Dispatcher/REST. No ambient retry orchestrator in P2-B.

---

## Mapping (conceptual)

| From | To |
|------|----|
| `prompt.system` + `prompt.context` + `prompt.user` | OpenAI `messages[]` (system / user — context may fold into system or prefixed user; document chosen fold in adapter README) |
| `capability`, `tools[]` | **Ignored for execution** in P2-B (no tool calling); may be logged |
| OpenAI message content | `AIExecutionResponse.text` |
| Adapter `name` | `AIExecutionResponse.provider` (e.g. `"openai"`) |
| Optional token/char stats | `usage` if easily available; else omit |

---

## In scope

- `OpenAIProviderAdapter` implementing `ProviderRuntime`
- Request / response / error mappers
- HTTP(S) client (or SDK) confined to adapter
- Ontory config to select stub vs openai for Dispatcher injection
- Unit tests with mocked vendor HTTP (no live key required for CI)
- Optional smoke against live API behind explicit env (local only)
- Health/readiness notes for provider config presence

## Out of scope (explicit)

- Tool calling / function calling execution  
- MCP  
- Memory / retrieval / recall  
- Agent loop / workflow orchestration  
- Advanced prompt templates / prompt management  
- Dynamic multi-provider registry / intelligent routing / model selection  
- Complex retry orchestration  
- Streaming completions  
- Studio API or `WorkspaceAiRuntimePort` contract changes  
- Anthropic / Gemini adapters in the **first** P2-B ship (document as next adapters; do not block OpenAI DoD on them)

---

## Alternatives considered

### A — Anthropic first (rejected for P2-B wave 1)
Strong product fit, but Chat Completions remains the wider industry template; OpenAI-first maximizes reusable mapper lessons.

### B — OpenAI-compatible local first (rejected as first)
Good for cost, weak as contract-shaping reference without stable cloud API semantics.

### C — Expand Studio to pick models (rejected)
Violates Studio-agnostic acceptance and frozen boundary policy.

### D — Add tools in the same milestone (rejected)
Second concern; defer.

---

## Definition of Done (P2-B wave 1)

- [ ] ADR-0008 Accepted
- [ ] `OpenAIProviderAdapter` behind `ProviderRuntime`
- [ ] Dispatcher can inject OpenAI **or** stub via Ontory config (not Studio)
- [ ] Request/response/error mapping covered by tests
- [ ] Studio unchanged for path (still RuntimePort → REST); no vendor SDK in Studio
- [ ] Acceptance rule verified: Studio has no hardcoded vendor routing
- [ ] Boundary CI still PASS (vendor SDK only under openai adapter path)
- [ ] Evidence pack + acceptance for P2-B

---

## Consequences

### Positive

- Proves stub → real provider without Kernel or Studio redesign  
- Establishes mapper/error patterns for Anthropic / Gemini follow-ons  
- Keeps vendor SDKs out of the product UI repo  

### Tradeoffs

- Live OpenAI smoke requires secrets; CI stays mocked  
- Streaming users wait for a later wave  
- Tools still unavailable  

### Non-goals

- P2-C Studio productization expansion as P2-B scope  
- Ratary recall changes  

---

## Recommended next Forge steps (after acceptance)

1. Approve this ADR + [ontory-provider-p2-b-intent.md](../../designs/drafts/ontory-provider-p2-b-intent.md)  
2. forge-isolate from `org-memory-p2-a-complete` on `ontory`  
3. Narrow blueprint: OpenAI adapter + config wire + tests + evidence  
4. Do **not** open Anthropic until OpenAI DoD is green  

**Next:** owner **Accept** ADR-0008 → unlock isolate/blueprint (OpenAI adapter only).
