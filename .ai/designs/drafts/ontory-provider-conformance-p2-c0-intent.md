# P2-C.0 Provider Conformance Harness — Forge Intent
**Status:** Draft — pending ADR-0009 + owner approval  
**Slug:** ontory-provider-conformance-p2-c0-intent  
**Baseline:** `org-memory-p2-b-complete`  
**Branch (proposed):** `forge/ontory-provider-conformance-p2-c0` (ontory)  
**Phase:** 04-proof-of-platform → Ontory provider track  
**Category:** Must Enable (pre-wave)  
**ADR:** [ADR-0009](../../core/architecture/ADR-0009-provider-conformance-harness.md) **Proposed**

---

## Problem

Without an executable conformance harness, Anthropic/Gemini adapters will be validated only against OpenAI’s incidental shape. That recreates vendor lock-in inside a “neutral” port.

Core question:

> Can we prove Stub + OpenAI against a frozen Provider Contract (mapping · envelope · errors · timeout · config · retry boundary) so that Anthropic becomes a plug-in validated by the same suite?

---

## Locked decisions (proposed)

| ID | Decision |
|----|----------|
| D1 | **No new vendors** in P2-C.0 |
| D2 | Freeze documentation + executable scenarios against P2-B types |
| D3 | OpenAI + stub are first harness subjects (mocked clients for CI) |
| D4 | Anthropic blocked until harness PASS |
| D5 | Capability model & streaming **out of scope** |
| D6 | Cancellation may be **deferred/probe** if port lacks AbortSignal |

---

## Constraints

1. Do not mutate `ProviderRuntime` / envelopes for convenience of the harness.
2. Do not import Anthropic/Gemini SDKs.
3. Do not add Studio changes.
4. Keep P2-B tag as immutable checkpoint.

---

## Impact

| Area | Impact |
|------|--------|
| Ontory | `tests/conformance/*` · optional `npm run test:conformance` |
| ai-brain | `.ai/governance/provider-conformance/**` |
| Studio | None |
| Kernel | None (unless gap ADR later) |

---

## Open questions (blocking)

1. Confirm **C-CAN** disposition: **deferred with note** vs expand port now (owner prefers defer)?  
2. Confirm harness command name: `npm run test:conformance`?  
3. Should stub run full matrix or only C-RES / C-META / C-CFG subset?

---

## Next after approval

forge-isolate → blueprint → implement harness against OpenAI+stub → evidence PASS → unlock Anthropic intent.
