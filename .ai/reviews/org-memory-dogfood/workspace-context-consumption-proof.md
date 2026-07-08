# P1-D W3 — ContextPackage Consumption Alignment Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-D AI Workspace |
| **Wave** | W3 — ContextPackage consumption |
| **Implementation repo** | `Ontorata-Studio` |
| **Status** | W3 boundary established |

---

## Required UI path

```text
WorkspaceAiPanel / OntoryChatPage
        │
        ▼
useWorkspaceRecallOrchestrator
        │
        ▼
WorkspaceRecallOrchestrator
        │
        ▼
WorkspaceContextPackage (domain DTO)
```

Forbidden for presentation UI:

- `StudioRataryClient.buildContext`
- `@ratary/sdk` imports
- reordering / filtering / trimming / merging context packages

---

## W3 artifacts (Studio)

| File | Role |
|------|------|
| `src/hooks/useWorkspaceRecallOrchestrator.ts` | UI bridge to orchestrator |
| `src/domain/recall/present-context-package.ts` | Read-only presentation helpers |
| `src/components/workspace/WorkspaceAiPanel.tsx` | Context via orchestrator only |
| `src/pages/OntoryChatPage.tsx` | Context via orchestrator only |

---

## Invariants

1. UI receives **domain** `WorkspaceContextPackage`, not SDK `BuildContextResult`.
2. Presentation helpers preserve item order; no truncation/filter of package content.
3. Session still stores `WorkspaceContextSnapshotRef` only.
4. Guard blocks `buildContext()` outside Ratary adapters and `@ratary/sdk` in pages/components.

---

## Verification

| Command | Expected |
|---------|----------|
| `npm test` | PASS |
| `npm run check:recall-boundary` | PASS |
| `npm run eval:recall-intelligence` | PASS (ratary · P1-C untouched) |

---

## Preview — W4 PromptAssembler

```text
User Prompt → Orchestrator → WorkspaceContextPackage → PromptAssembler → LLM
```

PromptAssembler consumes packages after recall completes — never re-runs retrieval/ranking.
