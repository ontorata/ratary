---
id: P2-B-ONTORY-PROVIDER-OPENAI
phase: 04-proof-of-platform
status: closed
distribution: baseline-locked
owner: Ontorata
workload: Ontory Provider Integration (OpenAI First)
baseline_tag: org-memory-p2-a-complete
forge_branch_governance: forge/ai-workspace-p1-d
forge_branch_ontory: forge/ontory-provider-p2-b
ontory_head: e63bb93
studio_head: 043666e
studio_note: unchanged from P2-A (RuntimePort → REST; no vendor SDK)
governance_head: fe70ede
closeout_tag: org-memory-p2-b-complete
acceptance_manifest: .ai/reviews/org-memory-dogfood/P2-B-ACCEPTANCE.md
proof_artifact: .ai/reviews/org-memory-dogfood/ontory-provider-openai-proof.md
adr: ADR-0008
updated: 2026-07-08
---

# Org Memory P2-B Completion — Ontory Provider Integration (OpenAI First)

## Objective

Replace the P2-A stub-only execution path with a **thin OpenAI provider adapter** behind `ProviderRuntime`, selected via Ontory configuration, without changing the Runtime Kernel or Studio contracts.

---

## Locked path

```text
REST Adapter
     │
     ▼
Runtime Dispatcher
     │
     ▼
Provider Runtime Port
     │
     ├── Stub Provider (default)
     │
     └── OpenAI Adapter → OpenAI SDK (adapters/openai only)
```

---

## Baseline pins (`org-memory-p2-b-complete`)

| Repo | Branch | Commit | Tag target |
|------|--------|--------|------------|
| **ontory** | `forge/ontory-provider-p2-b` | `e63bb93` | ✅ |
| **ai-brain (ratary)** | `forge/ai-workspace-p1-d` | `fe70ede` | ✅ (evidence pack / DoD) |
| **Ontorata-Studio** | `forge/ai-workspace-p1-d` | `043666e` | unchanged from P2-A (no P2-B Studio code) |

Closeout narrative commits after `fe70ede` document the release but are **not** the architectural evidence baseline.

---

## Guarantees locked

- Domain / Dispatcher / runtime contracts do not know the vendor
- Provider swappable without Kernel changes
- Official `openai` SDK stops at `src/adapters/openai/`
- Configuration selects provider; adapters do not own env policy
- Studio remains vendor-agnostic (A1)
- SDK types do not cross `ProviderRuntime` (A2)
- Default provider remains **stub**

---

## Explicit non-goals (deferred)

| Item | Phase |
|------|-------|
| Anthropic / Gemini / local OpenAI-compatible adapters | later P2-B waves |
| Streaming | separate milestone |
| Tools / MCP / agents / memory / recall | later phases |

---

## Evidence

- Acceptance: [P2-B-ACCEPTANCE.md](../../reviews/org-memory-dogfood/P2-B-ACCEPTANCE.md)
- Proof: [ontory-provider-openai-proof.md](../../reviews/org-memory-dogfood/ontory-provider-openai-proof.md)
- ADR: [ADR-0008](../../core/architecture/ADR-0008-ontory-provider-integration.md)

## Gates at closeout

Ontory @ `e63bb93`: **34 tests PASS** · `check:boundary` OK · typecheck OK

---

## Status

**CLOSED** · **Provider Integration Complete (OpenAI wave 1)** · tag `org-memory-p2-b-complete`
