# Wave Checkpoints — Identity Foundation (P0-A)

| Field | Value |
|-------|-------|
| **Milestone** | Identity Foundation |
| **Parent** | [identity-foundation-intent.md](../../designs/drafts/identity-foundation-intent.md) |
| **Evidence package** | [identity-foundation/](../../reviews/identity-foundation/) |

---

## Completed waves

| Wave | Artifact | Commit | Status |
|------|----------|--------|--------|
| 1 — Data Boundary | (Wave 1 commit `215ce28`) | `215ce28` | ✅ LOCKED |
| 2 — Identity Context | (Wave 2 commit `2080258`) | `2080258` | ✅ LOCKED |
| 3 — Authorization Boundary | [WAVE-3-AUTHORIZATION.md](./WAVE-3-AUTHORIZATION.md) | `ed3b65a` | ✅ LOCKED |
| 4 — Transport Parity | [WAVE-4-TRANSPORT-PARITY.md](./WAVE-4-TRANSPORT-PARITY.md) | `b190da5` | ✅ LOCKED |
| 5 — Studio E2E | — | — | ⏳ READY |

---

## Gate chain

```
Wave 1 Data Boundary ✅
    ↓
Wave 2 Identity Context ✅
    ↓
Wave 3 Authorization Boundary ✅  ← locked (identity-wave-3-locked)
    ↓
Wave 4 Transport Parity ✅  ← current lock
    ↓
Wave 5 Studio E2E ⏳
```
