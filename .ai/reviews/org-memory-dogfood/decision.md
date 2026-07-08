# P1-A Org Memory Dogfood — Decision Record

| Field | Value |
|-------|-------|
| **Decision** | BLOCK closeout (proceed with remediation) |
| **Milestone** | P1-A Org Memory Dogfood |
| **Branch** | `forge/org-memory-dogfood` |
| **Reference** | `acceptance-test.md` · `P1-A-ACCEPTANCE.md` |
| **Date** | 2026-07-08 |

---

## Summary

P1-A implementation and evidence chain are operational:

- deterministic ingest pipeline
- deterministic recall harness
- session/handoff trace automation
- internal usage metrics

However, acceptance gate **G4** is still **BLOCK** due to one missing evidence source in query `q-g4-evidence-answer`.

---

## Why block now

Closeout requires all G1–G6 pass. Current status is **5 PASS / 1 BLOCK**, so final lock/tag is deferred.

Blocking item:

- `missing_evidence=evidence-p1-question` in `evidence-trace.md`

---

## Required remediation

1. Improve recall fixture/ranker coverage for G4 query.
2. Re-run:
   - `npm run eval:org-memory-recall`
   - `npm run metrics:org-memory`
3. Confirm:
   - `missing_sources=0`
   - `failed_recall=0`
   - `pass_rate` improves above current baseline.
4. Update acceptance pack and quality summary.

---

## Next action

Proceed to Task 8 (CI/non-regression guard) + targeted G4 recall remediation before attempting baseline lock and `org-memory-p1-a-complete` tag.
