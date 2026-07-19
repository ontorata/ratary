# Memory decay & lifecycle scoring

> Status: **foundation shipped, disabled by default** (`DECAY_SCORING_ENABLED=false`).
> Runs as stewardship stage #10 (`decay-scoring`) inside `run_stewardship`.

Ratary scores every non-archived memory with a set of normalized **signals**
combined into a single **decay score**. The score is a *retention weight*, not
a deletion countdown: a low score means "resting", recall raises it, and
archival (never deletion) requires several independent conditions at once.

## Signals (the data contract)

Each signal is a value in `[0, 1]`, persisted as JSON in `decay_signals`:

| Signal | Meaning | Source |
|---|---|---|
| `relevance` | Content freshness — half-life on `updated_at` | `DECAY_HALF_LIFE_DAYS` (default 30) |
| `recency` | Time since last activity (`last_accessed`, falling back to `updated_at`) | same half-life |
| `reactivation` | Log-scaled `access_count`, weighted by access recency | saturates at 20 accesses |
| `connectivity` | Log-scaled relation degree — hub memories survive | saturates at degree 10 |
| `importance` | Owner-assigned importance / 100 | `importance` column |
| `governanceProtection` | 1 when the protection lattice matches (see below) | favorite / importance / tags |

Time-based signals never drop below a floor of `0.01`, so the multiplicative
combination cannot collapse to zero.

## Combination

```
decay_score = geometric_mean(relevance^w1, recency^w2, reactivation^w3,
                             connectivity^w4, importance^w5)
```

Weights come from `DECAY_WEIGHTS` (CSV, default all `1`). Because the
combination is multiplicative, a memory must hold up on **every** axis:

- a highly connected memory that is never recalled still decays;
- a frequently recalled memory with no causal links still fades.

Protected memories always score `1`.

### Worked numbers (defaults: half-life 30d, all weights 1)

| Memory | relevance | recency | reactivation | connectivity | importance | score |
|---|---|---|---|---|---|---|
| Stored today, importance 50 | 1.00 | 1.00 | 0.01 | 0.01 | 0.50 | ≈ 0.14 |
| Updated 30d ago, recalled yesterday 20× | 0.50 | 0.98 | ≈ 0.98 | 0.01 | 0.50 | ≈ 0.30 |
| Hub (degree 10), untouched 6 months | ≈ 0.015 | ≈ 0.015 | 0.01 | 1.00 | 0.50 | ≈ 0.06 |
| Favorite, any age | — | — | — | — | — | 1.00 |

(Values from the unit test suite in `tests/decay/` — the tests are the
authoritative worked examples.)

## Protection lattice

A memory is protected — always `active`, score `1`, never archived — when
**any** of these holds:

- `favorite = true`
- `importance >= 90`
- a governance tag is present: `governance`, `adr`, `architecture`, `baseline`

`handoff` is **not** auto-protected: handoffs are usually transient and only
survive through the criteria above or the retention window.

## Lifecycle

```
ACTIVE → DORMANT → FADING → ARCHIVED
   ↑                  │
   └── reactivation ──┘
```

| State | Condition (score `s`) |
|---|---|
| `active` | protected, inside retention window, or `s ≥ 0.35` |
| `dormant` | `0.15 ≤ s < 0.35` |
| `fading` | `archive floor ≤ s < 0.15`, or below floor but gate not met |
| `archived` | ALL of: `s <` `DECAY_ARCHIVE_FLOOR` (0.05) · zero relations · unprotected · outside retention window (`DECAY_RETENTION_DAYS`, 90d) |

Notes:

- The retention window is a **grace period**: memories created or accessed
  within it are never demoted at all.
- Transitions happen only during the stewardship stage; recomputation is
  bidirectional, so a reactivated memory promotes back toward `ACTIVE`.
- **There is no delete path.** `ARCHIVED` uses the existing reversible archive:
  the transition also sets the `archived` flag, so the memory leaves default
  retrieval and list paths but remains recoverable (unarchiving is a user
  action; decay never clears the flag). A future purge policy, if ever
  adopted, is a separate maintenance policy with its own ADR — never part of
  decay.

## Configuration

| Env | Default | Effect |
|---|---|---|
| `DECAY_SCORING_ENABLED` | `false` | Master switch for stage #10 |
| `DECAY_HALF_LIFE_DAYS` | `30` | Half-life for relevance/recency |
| `DECAY_ARCHIVE_FLOOR` | `0.05` | Score below which archival is considered |
| `DECAY_RETENTION_DAYS` | `90` | Grace period (create/access) |
| `DECAY_WEIGHTS` | all `1` | CSV `signal:weight` per-signal exponents |

Run it via stewardship (dry-run is the default and reports intended
transitions without mutating):

```
run_stewardship            # dry-run — inspect `decay-scoring` findings
run_stewardship dryRun=false
```
