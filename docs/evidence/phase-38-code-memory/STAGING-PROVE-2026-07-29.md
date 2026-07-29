# Phase 38 — Staging prove evidence (B–D)

**Date:** 2026-07-29  
**Pack:** [OPS-PACK.md](./OPS-PACK.md)  
**Fixture:** `fixture/` (2 TS files)  
**Production flag:** remains `CODE_MEMORY_ENABLED=false`

## B — Fixture dry-run (flag off)

| Field | Value |
|-------|--------|
| enabled | `false` |
| filesScanned | 2 |
| nodes | 8 |
| edges | 13 |
| runId | `null` |

## C — Fixture dry-run (flag on)

| Field | Value |
|-------|--------|
| CODE_MEMORY_ENABLED | `true` |
| CODE_STORE_PROVIDER | `sql` |
| dryRun | `true` |
| enabled | `true` |
| filesScanned / nodes / edges | 2 / 8 / 13 |
| runId | `null` (no persist) |

## D — In-memory execute (`npm run prove:code-memory`)

| Field | Value |
|-------|--------|
| ok | `true` |
| touchesD1 | `false` |
| dryRun | `false` |
| enabled | `true` |
| filesScanned / nodes / edges | 2 / 8 / 13 |
| runId | `c6afdd89-1708-4dcc-8f73-1b877a50381f` |
| getById round-trip | PASS |

## Remaining (Owner-gated)

- **E** — Staging D1 migrate + `index:code:execute` on fixture  
- **F** — Production enable (only after E Accept)

Do **not** run execute against production D1 from laptop `.env`.
