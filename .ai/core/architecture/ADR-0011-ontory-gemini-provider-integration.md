# ADR-0011 — Ontory Gemini Provider Integration (P2-C.2)

| Field | Value |
|-------|-------|
| **Status** | **Proposed** |
| **Date** | 2026-07-08 |
| **Baseline** | `org-memory-p2-c1-complete` (Ontory `4b3e094`) |
| **Related** | ADR-0007 · ADR-0008 · ADR-0010 · ADR-0009 · FROZEN-BOUNDARY-BYPASS-POLICY |
| **Deciders** | Engineering · Product (owner) |
| **Host repo** | `ontory` (adapters only) |
| **Provider** | Google Gemini (`generateContent`) |
| **Client** | Official `@google/generative-ai` — **adapter folder only** |
| **Default model** | `gemini-2.0-flash` via Ontory config (proposed) |
| **Streaming** | Deferred (P2-D) |
| **Studio impact** | **None** |

---

## Context

Three vendors (stub baseline + OpenAI + Anthropic) now exercise the conformance harness. Gemini completes the **P2-C provider conformance track** before streaming (P2-D) or capability negotiation ADRs.

Owner note: capability metadata may warrant a **future ADR** after three real vendors — **not** bundled into P2-C.2 implementation.

---

## Decision

Implement **GeminiProviderAdapter** as a thin adapter behind frozen `ProviderRuntime`, mirroring P2-B/P2-C.1 patterns.

### Contract boundary (owner-locked)

> **Gemini adapter MUST conform to existing Ontory provider contracts.** Any contract change requires a separate ADR and **MUST NOT** be introduced through provider integration work.

### Configuration

- `ONTORY_PROVIDER=gemini`
- `GEMINI_API_KEY` (required when selected)
- `GEMINI_MODEL` (default: `gemini-2.0-flash` — config layer only)
- Optional: base URL · timeout

---

## In scope

- `src/adapters/gemini/*`
- Config extension · conformance subject · boundary allowlist
- Evidence A1/A2 · `gemini-pass.md`

## Out of scope

- Capability negotiation / metadata model (future ADR)
- C-CAN · streaming · routing intelligence
- Studio / Kernel changes
- Harness contract changes

---

## Definition of Done (P2-C.2)

- [ ] ADR-0011 Accepted
- [ ] `GeminiProviderAdapter` behind `ProviderRuntime`
- [ ] Config selects gemini via env
- [ ] Gemini MUST conformance scenarios PASS
- [ ] stub + openai + anthropic regression PASS
- [ ] `check:boundary` PASS
- [ ] `org-memory-p2-c2-complete` tag
- [ ] ADR-0009 extension note (not P2-C.0 revision)

---

## Next

Accept ADR-0011 + intent → isolate `forge/ontory-provider-gemini-p2-c2` → execute blueprint.
