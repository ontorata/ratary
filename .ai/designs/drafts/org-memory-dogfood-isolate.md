---
id: ORG-MEMORY-DOGFOOD
phase: 04-proof-of-platform
stage: forge-isolate
status: Active
owner: Ontorata
workload: Org Memory Dogfood
evidence_package: org-memory-dogfood
constitution:
  - Internal Proof Before Public Capability
  - P0 Baseline Change Policy
dependencies:
  - P0-A-IDENTITY-FOUNDATION
  - P0-B-ENGINEERING-GOVERNANCE
  - org-memory-dogfood-intent
updated: 2026-07-08
---

# Org Memory Dogfood — Forge Isolate (P1-A)

| Field | Value |
|-------|-------|
| **Branch** | `forge/org-memory-dogfood` (from `main` @ `2cb59f2`) |
| **Baseline** | ? **88/88 tests passed** (`npm test`, 2026-07-08) |
| **Intent** | [org-memory-dogfood-intent.md](./org-memory-dogfood-intent.md) — **Approved** |
| **Evidence** | `.ai/reviews/org-memory-dogfood/` (create during execution) |
| **Prerequisite** | P0-A + P0-B RELEASED on origin · baseline frozen |

---

## Scope boundary (P1-A)

### In scope (daily usage proof)

| Domain | Target deliverable |
|--------|--------------------|
| Ingest | engineering docs · ADR · governance · release records · session handoff |
| Recall | MCP search/context/codename path used in real sessions |
| Evidence linkage | memory entry -> review artifact -> release/decision trace |
| Auditability | ingest + recall logs and internal metrics |

### Out of scope (P1-A)

Agent orchestration · complex knowledge graph rollout · external onboarding · Ontory product surface · AI workspace UI.

---

## Baseline audit

| Check | Result |
|------|--------|
| Branch isolation | ? `forge/org-memory-dogfood` active |
| Main baseline source | ? `main` includes P0-A/P0-B RELEASED |
| Existing tests | ? 23 files, 88 tests passed |
| P0 mutation guard | ? [P0-BASELINE-CHANGE-POLICY.md](../../core/constitution/P0-BASELINE-CHANGE-POLICY.md) present |

**Note:** repository currently has pre-existing script edits in working tree. They are carried unchanged and treated as unrelated baseline state.

---

## Exit criteria (isolate -> blueprint gate)

| Question | Answer |
|----------|--------|
| Intent approved? | ? by owner |
| Isolated branch ready? | ? |
| Baseline green? | ? 88/88 |
| Next stage | forge-blueprint |

**Ready for forge-blueprint:** ? proceed.

---

## Related

- [org-memory-dogfood-intent.md](./org-memory-dogfood-intent.md)
- [FIRST-WORKLOAD-ORG-MEMORY.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md)
- [P0-BASELINE-CHANGE-POLICY.md](../../core/constitution/P0-BASELINE-CHANGE-POLICY.md)
- [FORGE-METADATA.md](../../workflow/FORGE-METADATA.md)
