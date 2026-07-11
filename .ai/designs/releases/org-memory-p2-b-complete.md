# Org Memory P2-B Completion

> Canonical release path: [`.ai/governance/releases/P2-B-ONTORY-PROVIDER-OPENAI.md`](../../governance/releases/P2-B-ONTORY-PROVIDER-OPENAI.md)

## Objective

Ontory Provider Integration wave 1 — thin OpenAI adapter behind `ProviderRuntime`.

## Locked path

```text
REST → Dispatcher → ProviderRuntime → Stub (default) | OpenAI Adapter → SDK
```

## Baseline pins

| Repo | Commit |
|------|--------|
| ontory | `e63bb93` |
| ai-brain (tag / evidence) | `fe70ede` |
| Ontorata-Studio | `043666e` (unchanged from P2-A) |

## Guarantees

- Vendor knowledge stops in Ontory adapters  
- Config selects provider; Kernel unchanged  
- Studio vendor-agnostic  
- Streaming / tools / agents out of scope  

## Tag

`org-memory-p2-b-complete`

## Next

Later provider adapters (Anthropic / Gemini / local) or streaming — new waves / ADRs as needed.
