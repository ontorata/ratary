# P1-C Recall Intelligence — Evaluation Log

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Schema** | `run_id`, `fixture_version`, `policy_version`, `query_count`, `pass_rate`, `avg_top_k_precision`, `ordering_correct_rate`, `isolation_failures`, `trace_complete_rate`, `candidate_set_hash` |
| **Mode** | fixed fixture ranking evaluation |

---

## run_id=9f331b05-71d0-4207-8fcb-949523bfcbb2

- started_at: 2026-07-08T09:56:58.000Z
- fixture_version: p1c-recall-intelligence-v1
- policy_version: 1.0.0
- query_count: 3
- successful_recalls: 3
- failed_recalls: 0
- pass_rate: 100.00%
- avg_top_k_precision: 1.0000
- ordering_correct_rate: 100.00%
- isolation_failures: 0
- trace_complete_rate: 100.00%
- candidate_set_hash: 1b820fd835c10c45

| query_id | gate | successful | ordering_correct | top_k_precision | isolation_leak | policy_version |
|----------|------|------------|------------------|-----------------|----------------|----------------|
| q-mangrove-migration | G4 | true | true | 1.00 | false | 1.0.0 |
| q-isolation | G2 | true | true | 1.00 | false | 1.0.0 |
| q-determinism-repeat | G1 | true | true | 1.00 | false | 1.0.0 |

### Ranking comparisons

#### q-mangrove-migration
- expected: `cand-adr-0001 > cand-migration-policy`
- actual: `cand-adr-0001 > cand-migration-policy`
- decision_hash: `308a617026bab3ca`
- missing_expected: `none`

#### q-isolation
- expected: `cand-foreign`
- actual: `cand-foreign`
- decision_hash: `aeba47f3a6d2c99a`
- missing_expected: `none`

#### q-determinism-repeat
- expected: `cand-adr-0001 > cand-migration-policy > cand-meeting-notes`
- actual: `cand-adr-0001 > cand-migration-policy > cand-meeting-notes`
- decision_hash: `2d4ad5f7b3bc8fac`
- missing_expected: `none`

---
