# ADR-1001: Provider Abstraction Strategy

**Status:** Accepted  
**Date:** 2026-07-11  
**Phase:** P2-B (Provider Architecture Validation)  
**Authority:** Chief Architect

---

## Context

Ontory must support multiple AI providers (OpenAI, Anthropic, Gemini) without the business layer (RuntimeDispatcher) depending on provider-specific SDKs or payload shapes.

**Problem:** Provider-specific code leaking into business logic creates:
- Tight coupling to specific provider SDKs
- Business layer changes when adding/replacing providers
- Provider-specific conditionals (`if provider == "openai"`) scattered across code
- Difficult provider replacement

**Architectural Principle (AP-004):**
> Provider Abstraction Before Provider Lock-In

---

## Decision

Implement **ProviderRuntime interface** as the abstraction boundary between business layer and provider-specific adapters.

### Architecture

```
RuntimeDispatcher (Business Layer)
         ↓ depends on
   ProviderRuntime (Interface)
         ↑ implemented by
   OpenAI / Anthropic / Gemini / Stub Adapters
```

### Contract

```typescript
export interface ProviderRuntime {
  readonly name: string;
  
  complete(
    request: AIExecutionRequest, 
    requestId: string
  ): Promise<AIExecutionResponse>;
  
  stream(
    request: AIExecutionRequest, 
    requestId: string, 
    signal?: CancellationSignal
  ): AsyncIterable<AIExecutionEvent>;
}
```

### Rules

1. **Business layer ONLY knows `ProviderRuntime` interface**
   - NO imports from `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`
   - NO provider-specific conditionals
   - NO provider-specific types

2. **Provider-specific code ONLY in adapters**
   - `src/adapters/openai/` → OpenAI SDK
   - `src/adapters/anthropic/` → Anthropic SDK
   - `src/adapters/gemini/` → Gemini SDK
   - `src/adapters/stub-provider/` → Mock for testing

3. **Configuration-based provider selection**
   - `ONTORY_PROVIDER` environment variable
   - `createProviderFromConfig()` factory function
   - NO runtime provider switching (one provider per process)

---

## Consequences

### Positive

✅ **Zero business layer changes when replacing provider**  
Evidence: EVD-001-L3-provider-swap-test (PASS)

✅ **New provider addition is isolated to adapter**  
New provider = create new adapter directory, implement `ProviderRuntime`, register in config

✅ **Provider-agnostic interface contract**  
Request: `AIExecutionRequest` (vendor-neutral)  
Response: `AIExecutionResponse` (vendor-neutral)

✅ **Testable with mock provider**  
Stub provider enables fast unit tests without API calls

### Negative

⚠️ **Provider capabilities must be normalized**  
Provider-specific features (e.g., OpenAI function calling, Anthropic citations) require mapping to vendor-neutral contract or explicit capability detection

⚠️ **Configuration-based switching only**  
Runtime provider switching not supported (acceptable trade-off for current scope)

---

## Implementation Evidence

**Commit:** `460f0f143f3989a218e1d935dc72526c01d018cb`  
**Test:** `tests/runtime/provider-swap.test.ts`  
**Result:** ✅ PASS (4/4 tests)

### Exit Criteria Validated

✅ Business layer (RuntimeDispatcher) only knows `ProviderRuntime` interface  
✅ OpenAI provider works  
✅ Stub (mock) provider works  
✅ Provider swap via configuration  
✅ **Zero business layer changes when swapping** (validated via test)  
✅ No OpenAI SDK imports in business layer  
✅ No provider conditionals in business layer  
✅ Provider swap test passes  
✅ Interface contract test passes

---

## Related Documents

- **Architecture Principle:** AP-004 (Provider Abstraction Before Provider Lock-In)
- **Success Criteria:** Provider Independence (P2-B Level 1)
- **Quality Attribute:** QA-MAINT-001 (Provider Addition <2 days, zero consumer changes)
- **Evidence:** EVD-001-L3-provider-swap-test.md

---

## Review Notes

**Reviewer:** Chief Architect  
**Review Date:** 2026-07-11  
**Status:** Accepted

**Key Findings:**
- Provider abstraction implementation already exists and is mature
- Exit criteria validated through automated test
- No architectural surprises discovered
- Abstraction holds under swap test

**Architectural Impact:**
- Stage 1.0 baseline validated (provider abstraction works in practice)
- No ACR required (implementation aligns with architectural intent)

---

**Document Version:** 1.0  
**Date:** 2026-07-11  
**Status:** Accepted  
**Evidence Quality:** L3 (Automated Test)
