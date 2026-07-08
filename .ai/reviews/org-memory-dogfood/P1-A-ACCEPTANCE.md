# P1-A Acceptance Manifest — Org Memory Dogfood

| Field | Value |
|-------|-------|
| **Milestone** | P1-A Org Memory Dogfood |
| **Scope** | Ingest · Recall · Evidence linkage · Metrics · Handoff trace |
| **Branch** | `forge/org-memory-dogfood` |
| **Commit range** | `f47b39b` .. `6aa8af6` |
| **Status** | BLOCK (pending G4 remediation) |
| **Primary reference** | This file is the single acceptance source of truth |

---

## Acceptance gates (G1–G6)

| Gate | Status | Notes |
|------|--------|-------|
| G1 | PASS | Primary internal usage chain established |
| G2 | PASS | ADR recall successful |
| G3 | PASS | Release history recall successful |
| G4 | BLOCK | Evidence-backed answer missing one required source |
| G5 | PASS | End-to-end trace linkage exists |
| G6 | PASS | P0 baseline stability preserved |

Detail: [`acceptance-test.md`](./acceptance-test.md)

---

## Evidence references

- Ingest: [`ingestion-log.md`](./ingestion-log.md)
- Recall: [`recall-log.md`](./recall-log.md)
- Evidence mapping: [`evidence-trace.md`](./evidence-trace.md)
- Handoff trace: [`mcp-interaction-log.md`](./mcp-interaction-log.md)
- Metrics: [`internal-usage-metrics.md`](./internal-usage-metrics.md)
- Quality rollup: [`P1-A-QUALITY-SUMMARY.md`](./P1-A-QUALITY-SUMMARY.md)
- Decision: [`decision.md`](./decision.md)

---

## Metrics snapshot

- `ingestion_count=143`
- `recall_count=3`
- `successful_recall=2`
- `failed_recall=1`
- `pass_rate=66.67`
- `average_latency=2.33`
- `duplicate_memory=5`
- `orphan_memory=1`
- `drift_incidents=1`

Source: `metrics_run_id=35e39c3f-d8e8-40dc-b6f8-0289c4fc4fd6`

---

## Risks and known limitations

1. G4 recall miss indicates incomplete evidence retrieval for one governance question.
2. Recall sample size still small (`query_count=3`) — acceptable for dogfood baseline, not final target.
3. Single-organization scope (`organization_count=1`) is intentional for P1-A.

---

## Exit criteria checklist (P1-A)

- [x] Tasks 1–6 complete
- [ ] G1–G6 all PASS
- [x] `npm test` stable (88/88)
- [x] Evidence collection traceable
- [x] Quality summary up to date
- [x] Handoff trace verifiable end-to-end
- [x] Metrics reproducible from official commands
- [x] Out-of-scope changes excluded from milestone commits

---

## Reviewer sign-off

- [ ] Engineering review
- [ ] Governance review
- [ ] Founder/owner closeout approval
