# ADR-0010 — Ontory Anthropic Provider Integration (P2-C.1)

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Date** | 2026-07-08 |
| **Accepted** | 2026-07-08 |
| **Baseline** | `org-memory-p2-c0-complete` (Ontory `8e307ce`) |
| **Related** | ADR-0007 · ADR-0008 · ADR-0009 · FROZEN-BOUNDARY-BYPASS-POLICY |
| **Deciders** | Engineering · Product (owner) |
| **Host repo** | `ontory` (adapters only) |
| **Provider** | Anthropic Messages API |
| **Client** | Official `@anthropic-ai/sdk` — **adapter folder only** |
| **Default model** | `claude-3-5-haiku-20241022` via Ontory config (proposed) |
| **Streaming** | Deferred (P2-D) |
| **Studio impact** | **None** |

---

## Context

P2-C.0 closed with an executable conformance harness. Anthropic is the first adapter wave that must **plug into** the frozen Provider Contract without modifying it.

ADR-0008 established the thin-adapter pattern for OpenAI. P2-C.1 repeats that pattern for Anthropic behind the same `ProviderRuntime` port.

---

## Decision

Implement **AnthropicProviderAdapter** as a thin adapter:

```text
AIExecutionRequest → RequestMapper → SDK client → ResponseMapper → AIExecutionResponse
                              └── ErrorMapper → ProviderError
```

### Non-negotiable rules (inherited from ADR-0008)

- **A1** — Studio remains vendor-agnostic
- **A2** — Anthropic SDK types do not cross `ProviderRuntime`
- **Conformance** — `npm run test:conformance` MUST PASS for Anthropic subject before closeout
- **No contract changes** — harness validates; adapter conforms

### Contract boundary (owner-locked)

> **Anthropic adapter MUST conform to existing Ontory provider contracts.** Any contract change requires a separate ADR and **MUST NOT** be introduced through provider integration work.

### Configuration

- `ONTORY_PROVIDER=anthropic`
- `ANTHROPIC_API_KEY` (required when selected)
- `ANTHROPIC_MODEL` (default when unset: `claude-3-5-haiku-20241022` — **config layer only**, adapter receives resolved model)
- Optional: base URL · timeout (mirror OpenAI config shape)

---

## In scope

- `src/adapters/anthropic/*`
- Config extension · REST composition wire
- Unit tests (mocked) + conformance subject
- Evidence A1/A2 · `anthropic-pass.md`

## Out of scope

- Gemini · streaming · tools · MCP · memory · agents
- Multi-provider routing intelligence
- `ProviderRuntime` / Dispatcher changes
- Conformance contract / scenario matrix changes

---

## Definition of Done (P2-C.1)

- [ ] ADR-0010 Accepted
- [ ] `AnthropicProviderAdapter` behind `ProviderRuntime`
- [ ] Config selects anthropic via env
- [ ] All Anthropic MUST conformance scenarios PASS
- [ ] OpenAI + stub conformance regression PASS
- [ ] `check:boundary` PASS with anthropic SDK allowlist
- [ ] Evidence pack + `org-memory-p2-c1-complete` tag
- [ ] ADR-0009 extension note (not P2-C.0 revision)

---

## Consequences

### Positive

- Proves harness generalizes beyond OpenAI
- Establishes second vendor without Kernel redesign

### Tradeoffs

- Maintains parallel mapper folders (OpenAI + Anthropic) — intentional thin adapters vs premature abstraction

---

## Next

Accept ADR-0010 + intent → forge-isolate `forge/ontory-provider-anthropic-p2-c1` → execute blueprint.
