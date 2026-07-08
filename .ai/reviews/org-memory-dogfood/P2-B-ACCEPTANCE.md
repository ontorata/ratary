# P2-B Acceptance Manifest — Ontory Provider Integration (OpenAI First)

| Field | Value |
|-------|-------|
| **Milestone** | P2-B Provider Integration |
| **Scope** | `ProviderError` · pure mappers · thin OpenAI adapter · Ontory config · REST composition |
| **Ontory** | `forge/ontory-provider-p2-b` @ `e63bb93` |
| **Baseline** | `org-memory-p2-a-complete` |
| **ADR** | ADR-0008 Accepted |
| **Status** | ✅ **ACCEPTED** · CLOSED |
| **Closeout tag** | `org-memory-p2-b-complete` |

---

## Owner Task evaluation (1–7)

| Task | Status |
|------|--------|
| 1 Contracts (`ProviderError`) | ✅ |
| 2 RequestMapper | ✅ |
| 3 ResponseMapper & ErrorMapper | ✅ |
| 4 Thin OpenAIProviderAdapter | ✅ |
| 5 Configuration & composition root | ✅ |
| 6 REST composition (default stub) | ✅ |
| 7 Evidence + A1/A2 | ✅ |

---

## A1 / A2 (Task 7 evidence framing)

| Gate | Status |
|------|--------|
| **A1 Provider execution** — REST → dispatch → config-selected provider → consistent envelope | ✅ PASS |
| **A2 Boundary** — no SDK in Dispatcher/runtime; SDK allowlisted under `adapters/openai`; stub default; OpenAI only via config; Studio vendor-agnostic | ✅ PASS |

ADR acceptance A1/A2 (Studio-agnostic · no SDK types across port): ✅ covered in [ontory-provider-openai-proof.md](./ontory-provider-openai-proof.md).

---

## Validated

- [x] Stub remains default without env override
- [x] OpenAI selectable via `ONTORY_PROVIDER=openai` + `OPENAI_API_KEY`
- [x] Default model policy `gpt-4o-mini` in **config** only
- [x] Official `openai` SDK confined to adapter folder
- [x] Pure mappers (no env/network/logging/retry)
- [x] Thin adapter = compose mappers + client only
- [x] Studio / Kernel contracts not required to change for wave 1
- [x] Out of scope items not introduced (tools · streaming · agents · MCP · memory)

---

## Evidence

- Pack: [ontory-provider-openai-proof.md](./ontory-provider-openai-proof.md)
- ADR: [ADR-0008](../../core/architecture/ADR-0008-ontory-provider-integration.md)
- Blueprint: [ontory-provider-p2-b-plan.md](../../designs/drafts/ontory-provider-p2-b-plan.md)

---

## Next

**CLOSED.** Tag `org-memory-p2-b-complete`. Follow-on providers (Anthropic / Gemini) are separate waves.
