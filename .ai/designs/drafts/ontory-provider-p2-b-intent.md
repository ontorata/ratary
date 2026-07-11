# P2-B Ontory Provider Integration — Forge Intent
**Status:** Approved — ready for isolate/blueprint (ADR-0008 Accepted)  
**Slug:** ontory-provider-p2-b-intent  
**Baseline:** `org-memory-p2-a-complete`  
**Branch:** `forge/ontory-provider-p2-b` (in `ontory`)  
**Phase:** 04-proof-of-platform → Ontory provider track  
**Category:** Must Enable  
**ADR:** [ADR-0008](../../core/architecture/ADR-0008-ontory-provider-integration.md) **Accepted**

---

## Problem

P2-A delivered a provider-agnostic Runtime Kernel with a stub. Without a first real adapter, the platform cannot validate production execution — and teams may shortcut by putting vendor SDKs in Studio.

Core question:

> Can Ontory replace the stub with an OpenAI adapter behind `ProviderRuntime` so that real completions flow Studio → REST → Dispatcher → OpenAI → `AIExecutionResponse`, without Studio knowing the vendor and without tools/MCP/memory/agents?

---

## Locked decisions (ADR-0008 Accepted)

| ID | Decision |
|----|----------|
| D1 | Keep existing **`ProviderRuntime`** as the only adapter port |
| D2 | **OpenAI first** · official **`openai` SDK** · mappers confined to adapter folder |
| D3 | **Config is Ontory-only** (`stub` \| `openai`, keys, model default `gpt-4o-mini`, timeout) |
| D4 | **Streaming deferred** — non-streaming `complete()` only |
| D5 | **Error normalization** → Ontory `ProviderError` / envelopes |
| D6 | Request-scoped **timeout/cancel**; no retry orchestrator |

**Acceptance:**  
A1 Studio must not know / select / import the provider.  
A2 Provider-specific SDK types SHALL NOT cross `ProviderRuntime`.

---

## Constraints

1. Start from `org-memory-p2-a-complete` — no Kernel contract breaks without ADR.
2. Obey FROZEN-BOUNDARY-BYPASS-POLICY and ADR-0007.
3. Do not change Studio RuntimePort or `AIExecutionRequest` for OpenAI.
4. No tools, MCP, memory, recall, agents, prompt-template systems, dynamic registry, intelligent routing.
5. Boundary script: OpenAI dependency only under `src/adapters/openai/`.

---

## Target layout (narrow)

```text
ProviderRuntime
        │
        ▼
OpenAIProviderAdapter
        ├── RequestMapper
        ├── ResponseMapper
        ├── ErrorMapper
        └── HttpClient
```

Wire selection in Ontory bootstrap / REST server composition root only.

---

## Alternatives (summary)

| Option | Verdict |
|--------|---------|
| Anthropic first | Defer — OpenAI shapes reusable mappings |
| Local OpenAI-compatible first | Defer — weaker as first contract reference |
| Studio chooses model/vendor | Reject — breaks acceptance |
| Tools in same wave | Reject — second concern |

---

## Impact

| Area | Impact |
|------|--------|
| Ontory | New openai adapter · config · tests |
| Studio | **None** for DoD (path already REST) |
| Ratary | Governance ADR/intent/evidence only |
| Dispatcher | Injection only — no vendor logic |

---

## Open questions

Resolved by owner Accept (2026-07-08). Non-blocking later: Azure OpenAI / OpenRouter as OpenAI-compatible variants.

---

## Stop conditions

- Scope creep (tools, agents, Studio vendor branching, SDK types outside adapter) → halt  

---

## Next

forge-isolate → blueprint → execute OpenAI-only → evidence.
