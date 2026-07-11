# P1-D W1 — Workspace Recall Consumer Boundary Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-D AI Workspace |
| **Wave** | W1 — Workspace contracts and public interfaces |
| **Implementation repo** | `Ontorata-Studio` |
| **Ratary baseline** | `org-memory-p1-c-complete` (unchanged) |
| **Status** | ✅ **ACCEPTED** (owner review 2026-07-08) |

---

## Owner review outcome

- Repo separation maintained (Studio consumer · Ratary provider)
- SDK-only recall access path approved
- Dual guard (ESLint + CI script) approved as permanent CI gate
- P1-C regression re-run PASS — Studio changes did not affect recall platform

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
| `src/domain/recall/workspace-context-package.ts` | Immutable consumer types |
| `src/application/recall/workspace-recall.port.ts` | Minimal application entry (`fetchContextPackage` only) |
| `src/infrastructure/ratary/workspace-recall-adapter.ts` | SDK-only adapter |
| `scripts/check-recall-consumer-boundary.mjs` | Permanent CI recall guard |
| `eslint.config.js` | Dev-time import guard |

---

## Permanent CI gates

| Command | Purpose |
|---------|---------|
| `npm run check:recall-boundary` | Recall consumer boundary (no full lint dependency) |
| `npm run test:ci` | Unit tests + recall boundary |
| `npm run eval:recall-intelligence` | P1-C regression (ratary) |

---

## Known pre-existing issue (non-blocker)

`npm run lint` fails on `src/infrastructure/auth/ratary-native-auth-adapter.ts` due to legacy `fetch()` usage outside Ratary adapter allowlist.  
**Not introduced by W1.** Recall boundary check passes independently.

---

## P1-C no-touch confirmation

W1 did not modify Ratary recall intelligence modules (`RecallPolicy`, providers, context assembler).

---

## Next

W2 — recall-stateless session orchestration via `WorkspaceRecallOrchestrator`.
