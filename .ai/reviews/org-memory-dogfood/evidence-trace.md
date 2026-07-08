# P1-A Org Memory Dogfood — Evidence Trace

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Purpose** | query -> evidence trace for G2/G3/G4 recall harness |

---

## run_id=3e3951d1-89d3-4dc1-b075-0fac8ff7ab93

### query_id=q-g2-adr-recall gate=G2
- query: What is the canonical order between authentication tenant context and permission evaluation?
- successful: true
- evidence_ids: evidence-adr-0001, evidence-p1-question, evidence-p0-policy
- missing_evidence: none
  - evidence_ref: .ai/core/architecture/ADR-0001-identity-boundary.md (evidence-adr-0001)
  - evidence_ref: .ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md (evidence-p1-question)
  - evidence_ref: .ai/core/constitution/P0-BASELINE-CHANGE-POLICY.md (evidence-p0-policy)

### query_id=q-g3-release-history gate=G3
- query: Which merge commit and release tag prove P0-B Engineering Governance is released on origin?
- successful: true
- evidence_ids: evidence-p0b-release, evidence-p0-policy, evidence-adr-0001
- missing_evidence: none
  - evidence_ref: .ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md (evidence-p0b-release)
  - evidence_ref: .ai/core/constitution/P0-BASELINE-CHANGE-POLICY.md (evidence-p0-policy)
  - evidence_ref: .ai/core/architecture/ADR-0001-identity-boundary.md (evidence-adr-0001)

### query_id=q-g4-evidence-answer gate=G4
- query: What changes are allowed on frozen P0 baseline and why is feature work moved to P1?
- successful: false
- evidence_ids: evidence-p0-policy, evidence-p0b-release, evidence-adr-0001
- missing_evidence: evidence-p1-question
  - evidence_ref: .ai/core/constitution/P0-BASELINE-CHANGE-POLICY.md (evidence-p0-policy)
  - evidence_ref: .ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md (evidence-p0b-release)
  - evidence_ref: .ai/core/architecture/ADR-0001-identity-boundary.md (evidence-adr-0001)

## run_id=1ed2b83d-fbcb-4153-ab99-0a67d274c29c

### query_id=q-g2-adr-recall gate=G2
- query: What is the canonical order between authentication tenant context and permission evaluation?
- successful: true
- evidence_ids: evidence-adr-0001, evidence-p1-question, evidence-p0-policy, evidence-p0b-release
- missing_evidence: none
  - evidence_ref: .ai/core/architecture/ADR-0001-identity-boundary.md (evidence-adr-0001)
  - evidence_ref: .ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md (evidence-p1-question)
  - evidence_ref: .ai/core/constitution/P0-BASELINE-CHANGE-POLICY.md (evidence-p0-policy)
  - evidence_ref: .ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md (evidence-p0b-release)

### query_id=q-g3-release-history gate=G3
- query: Which merge commit and release tag prove P0-B Engineering Governance is released on origin?
- successful: true
- evidence_ids: evidence-p0b-release, evidence-p0-policy, evidence-adr-0001, evidence-p1-question
- missing_evidence: none
  - evidence_ref: .ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md (evidence-p0b-release)
  - evidence_ref: .ai/core/constitution/P0-BASELINE-CHANGE-POLICY.md (evidence-p0-policy)
  - evidence_ref: .ai/core/architecture/ADR-0001-identity-boundary.md (evidence-adr-0001)
  - evidence_ref: .ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md (evidence-p1-question)

### query_id=q-g4-evidence-answer gate=G4
- query: What changes are allowed on frozen P0 baseline and why is feature work moved to P1?
- successful: true
- evidence_ids: evidence-p0-policy, evidence-p0b-release, evidence-adr-0001, evidence-p1-question
- missing_evidence: none
  - evidence_ref: .ai/core/constitution/P0-BASELINE-CHANGE-POLICY.md (evidence-p0-policy)
  - evidence_ref: .ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md (evidence-p0b-release)
  - evidence_ref: .ai/core/architecture/ADR-0001-identity-boundary.md (evidence-adr-0001)
  - evidence_ref: .ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md (evidence-p1-question)

