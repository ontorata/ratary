# P2-B Ontory Provider Integration — Forge Isolate

| Field | Value |
|-------|-------|
| **Repo** | `D:\Apps\ontory` (`@ontorata/ontory`) |
| **Branch** | `forge/ontory-provider-p2-b` |
| **Baseline** | `org-memory-p2-a-complete` @ `c18cacc` |
| **ADR** | ADR-0008 **Accepted** |
| **Intent** | [ontory-provider-p2-b-intent.md](./ontory-provider-p2-b-intent.md) |
| **Status** | ✅ Isolate active — ready for blueprint execute |
| **Verification** | 2026-07-08 — baseline `npm test` 4 PASS · `check:boundary` OK · typecheck OK |

---

## Pre-flight checklist

- [x] P2-A tagged `org-memory-p2-a-complete`
- [x] ADR-0008 Accepted (OpenAI · official SDK · gpt-4o-mini · streaming deferred · A1/A2)
- [x] Intent approved
- [x] Branch from baseline tag
- [x] No vendor adapter on branch yet (stub only until execute)
- [x] Kernel contracts untouched

---

## Acceptance (isolate)

| Area | Required |
|------|----------|
| Branch from P2-A tag | ✅ |
| Baseline green | ✅ |
| No premature Anthropic/Gemini | ✅ |
| Studio unchanged at isolate | ✅ |

**Reject isolate if:** tools/MCP/agent code appears, or `openai` imported outside planned adapter path before blueprint execute.

---

## Explicit non-goals preserved

Streaming · tools · MCP · memory · recall · agents · dynamic registry · Studio vendor branching

**Ready for forge-blueprint / execute OpenAI-only.** ✅
