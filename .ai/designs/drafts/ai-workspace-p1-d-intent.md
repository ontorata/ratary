# P1-D AI Workspace — Forge Intent
**Status:** Approved — locked · milestone CLOSED (`org-memory-p1-d-complete`)
**Slug:** ai-workspace-p1-d-intent
**Baseline:** `org-memory-p1-c-complete` @ `d1ddc1e`
**Implementation repo:** `Ontorata-Studio` · branch `forge/ai-workspace-p1-d`
**Governance repo:** `ratary` (ai-brain) · P1-C frozen baseline
**Phase:** 04-proof-of-platform
**Category:** Must Prove / Must Enable
**Approved:** 2026-07-08

---

## Problem

P1-C locked recall intelligence as a reproducible platform layer: contracts, ranking, context assembly, and evaluation harness (G1–G7 PASS).  
What is still missing is a **consumer layer** that turns `ContextPackage` into a usable AI workspace experience — session lifecycle, interaction flow, and orchestration — without mutating recall behavior.

Core question:

> Can Ontorata deliver a tenant-safe AI workspace that consumes recall outputs exclusively through public contracts, while all P1-C regression gates remain green?

---

## Locked decisions (owner — immutable for P1-D)

### D1 — Primary codebase: Ontorata Studio

Workspace is user-facing orchestration. Ratary remains platform memory/recall.

```text
Ontorata Studio → Ratary Recall API → P1-C Recall Intelligence (frozen)
```

Studio must not host recall intelligence implementation.

### D2 — Public recall API: SDK canonical

```text
SDK (canonical)
  ├── MCP adapter (transport)
  └── REST facade (optional later)
```

MCP is transport/protocol, not contract definition.

### D3 — CI import boundary: dual guard

| Layer | Mechanism |
|-------|-----------|
| Dev feedback | ESLint `no-restricted-imports` |
| CI gate | Dedicated `check-recall-consumer-boundary.mjs` |

### D4 — W5 fixtures: phased

1. **Smoke/integration:** 3–5 queries (determinism, fast iteration)
2. **Extended regression:** larger corpus after W5 stabilizes

---

## Constraints (constitution / ADR / governance)

1. P1-D starts from `org-memory-p1-c-complete`.
2. Public P1-C contracts only — no internal recall module imports in Studio.
3. P1-C regression (G1–G7) must stay PASS on every P1-D merge candidate.
4. P1-C recall internals frozen — changes require new recall milestone + ADR.
5. Acyclic dependency: workspace → recall only.

---

## Allowed changes (P1-D — consumer layer only)

1. AI Workspace orchestration (session/workspace lifecycle).
2. Prompt/context orchestration consuming recall **outputs** (no re-rank/re-fetch).
3. Workspace UI/UX, streaming, interaction flow.
4. Tool orchestration above recall layer.
5. Studio public interfaces + P1-D evaluation harness.
6. P1-D governance artifacts.

---

## Forbidden changes (P1-D)

Frozen P1-C platform layer (in Ratary): `RecallPolicy`, `RecallDecision`, providers, context budgeting, `ContextPackage` assembly semantics.

Forbidden in Studio: direct recall internals, workspace-side ranking, bypass of public SDK API.

---

## Dependency graph (required)

```text
Workspace (P1-D / Studio)
    │
    ▼
Recall API (@ratary/sdk)
    │
    ▼
ContextPackage / RecallResult
    │
    ▼
Recall Intelligence (P1-C — frozen)
```

---

## Wave structure

| Wave | Focus |
|------|-------|
| W1 | Workspace contracts and public interfaces |
| W2 | Session / workspace orchestration |
| W3 | `ContextPackage` consumption |
| W4 | AI interaction pipeline |
| W5 | Integration evaluation (smoke → extended) |
| W6 | Documentation and release closeout |

---

## Owner approval

- [x] Problem and scope approved
- [x] Frozen P1-C boundary approved
- [x] Wave structure approved
- [x] Open questions resolved (D1–D4 locked)

**Next:** `forge-isolate` → blueprint → execute W1.
