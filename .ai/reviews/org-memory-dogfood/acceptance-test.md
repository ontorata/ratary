# P1-A Org Memory Dogfood — Acceptance Test (G1–G6)

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Milestone** | P1-A Org Memory Dogfood |
| **Branch** | `forge/org-memory-dogfood` |
| **Commit range** | `f47b39b` .. `6aa8af6` |
| **Updated** | 2026-07-08 |

---

## Gate matrix

| Gate | Criterion | Status | Evidence |
|------|-----------|--------|----------|
| **G1** | Ontorata uses Ratary as primary engineering memory | PASS | `mcp-interaction-log.md` (session/handoff chain), `internal-usage-metrics.md` (`organization_count=1`) |
| **G2** | Latest ADRs discoverable via MCP recall | PASS | `recall-log.md` query `q-g2-adr-recall` successful |
| **G3** | Release history reconstructable from memory | PASS | `recall-log.md` query `q-g3-release-history` successful |
| **G4** | AI answers governance/architecture from evidence | BLOCK | `q-g4-evidence-answer` failed with `missing_evidence=evidence-p1-question` |
| **G5** | Decision ↔ evidence ↔ release linked without manual stitching | PASS | `evidence-trace.md` + `mcp-interaction-log.md` chain (`session_id -> ... -> evidence_run_id`) |
| **G6** | P0 baseline untouched except permitted classes | PASS | `npm test` 88/88 pass; no P0 foundation mutation in P1-A scope |

---

## Metrics snapshot

From `internal-usage-metrics.md` (`metrics_run_id=35e39c3f-d8e8-40dc-b6f8-0289c4fc4fd6`):

- `ingestion_count=143`
- `recall_count=3`
- `successful_recall=2`
- `failed_recall=1`
- `average_latency=2.33`
- `pass_rate=66.67`
- `duplicate_memory=5`
- `orphan_memory=1`
- `drift_incidents=1`

---

## Verification

```bash
npm test
npm run eval:org-memory-recall
npm run trace:org-memory-handoff -- --ratary-codename TASK-0007
npm run metrics:org-memory
```

All commands run successfully in this milestone branch.

---

## Result

**Acceptance state: BLOCK (5 PASS / 1 BLOCK).**

P1-A is audit-ready but not yet closure-ready due to G4 miss. Next step is remediation in Task 8/follow-up recall iteration to eliminate missing source and raise pass rate.
