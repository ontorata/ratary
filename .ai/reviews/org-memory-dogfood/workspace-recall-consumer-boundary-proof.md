# P1-D W1 — Workspace Recall Consumer Boundary Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-D AI Workspace |
| **Wave** | W1 — Workspace contracts and public interfaces |
| **Implementation repo** | `Ontorata-Studio` |
| **Ratary baseline** | `org-memory-p1-c-complete` (unchanged) |
| **Status** | W1 boundary established |

---

## Required dependency graph

```text
application/recall/workspace-recall.port.ts
        │
        ▼
infrastructure/ratary/workspace-recall-adapter.ts
        │
        ▼
StudioRataryClient.buildContext() → @ratary/sdk
```

Forbidden: Studio → Ratary `src/memory/recall/*` or recall policy/provider modules.

---

## W1 artifacts (Studio)

| File | Role |
|------|------|
| `src/domain/recall/workspace-context-package.ts` | Consumer types (no ranking fields) |
| `src/application/recall/workspace-recall.port.ts` | Application entry port |
| `src/infrastructure/ratary/workspace-recall-adapter.ts` | SDK-only adapter |
| `src/infrastructure/ratary/map-sdk-context-result.ts` | Order-preserving SDK mapper |
| `scripts/check-recall-consumer-boundary.mjs` | CI guard: recall-internal patterns + `context.build()` routing |
| `eslint.config.js` | Dev-time import guard |

---

## Verification

| Command | Repo | Expected |
|---------|------|----------|
| `npm test` | Ontorata-Studio | PASS |
| `npm run lint` | Ontorata-Studio | PASS (SDK + recall consumer boundary) |
| `npm run eval:recall-intelligence` | ratary | PASS (P1-C regression) |

---

## P1-C no-touch confirmation

Wave W1 did not modify Ratary recall intelligence modules (`RecallPolicy`, providers, context assembler).
