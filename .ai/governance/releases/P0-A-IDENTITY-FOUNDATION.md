---
id: P0-A-IDENTITY-FOUNDATION
phase: 04-proof-of-platform
status: Complete
owner: Ontorata
workload: Engineering Governance
release_tag: identity-foundation-p0-a-complete
forge_branch: forge/identity-foundation
merged_to: main
updated: 2026-07-08
---

# P0-A Identity Foundation — Release Record

| Field | Value |
|-------|-------|
| **Milestone** | Identity Foundation (P0-A) |
| **Status** | ✅ COMPLETE · 🔒 LOCKED |
| **Release tag** | `identity-foundation-p0-a-complete` |
| **Forge branch** | `forge/identity-foundation` |
| **Consumer proof** | Ontorata-Studio `af266a7` (separate repo — not merged here) |

---

## Architectural boundary (locked)

```
Authentication
        ↓
Tenant Context
        ↓
Permission Evaluation
        ↓
Resource Access
```

Shared implementation: `src/auth/authorization-boundary.ts` (REST + MCP Remote)

---

## Wave chain

| Wave | Focus | Implementation | Governance | Lock tag |
|------|-------|----------------|------------|----------|
| 1 | Data Boundary | `215ce28` | — | — |
| 2 | Identity Context | `2080258` | — | — |
| 3 | Authorization | `ed3b65a` | `e96330b` | `identity-wave-3-locked` |
| 4 | Transport Parity | `b190da5` | `459f925` | `identity-wave-4-locked` |
| 5 | Studio E2E | `24b5511` | `e4a7c71` | `identity-wave-5-locked` |

**Merge commit:** `2a57647` — `merge: identity foundation P0-A waves 1-5` (forge-land on `main`)

**Governance checkpoints:**

- [WAVE-3-AUTHORIZATION.md](../waves/WAVE-3-AUTHORIZATION.md)
- [WAVE-4-TRANSPORT-PARITY.md](../waves/WAVE-4-TRANSPORT-PARITY.md)
- [WAVE-5-STUDIO-E2E.md](../waves/WAVE-5-STUDIO-E2E.md)

**Evidence package:** `.ai/reviews/identity-foundation/`

---

## Test evidence (pre-merge)

| Suite | Result | Command |
|-------|--------|---------|
| Identity | 56/56 ✅ | `npm run test:identity` |
| Studio E2E | 7/7 ✅ | `npm run test:e2e` |
| Full | 88/88 ✅ | `npm test` |

---

## Known non-goals (documented)

| Item | Status |
|------|--------|
| MCP stdio bootstrap (env-based owner/workspace) | Deferred — not P0-A scope |
| Permission / role UI in Studio | Out of scope Wave 5 |
| Per-tenant RBAC storage | Model-ready; storage future |

---

## Next phase

**P0-B — Engineering Governance** (operational maturity)

Blocked until: P0-A forge-land complete ✅

Scope (indicative):

- ADR enforcement
- CI governance gate
- Migration policy
- Audit trail standard
- Release process · environment promotion · contributor workflow

---

## Related

- [identity-foundation-intent.md](../../designs/drafts/identity-foundation-intent.md)
- [acceptance-test.md](../../reviews/identity-foundation/acceptance-test.md)
- [studio-e2e-proof.md](../../reviews/identity-foundation/studio-e2e-proof.md)
- [FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md)
