# Architectural Decision Index

This index tracks all Architectural Decision Records (ADRs) for the Ontorata project, their status, relationships, and scope.

**Purpose:**
- Quick reference for active architectural decisions
- Evolution history tracking
- Supersession relationship visibility
- Audit support (reviewers don't need to traverse entire repository)

---

## Active ADRs

| ADR | Title | Status | Scope | Phase | Date |
|-----|-------|--------|-------|-------|------|
| [ADR-0012](ADR-0012-ontory-streaming-execution-lifecycle.md) | Ontory Streaming & Execution Lifecycle | **Accepted · Amended** | Streaming execution contract | P2-D | 2026-07-09 |
| [ADR-0013](ADR-0013-p2-intelligence-layer-invariants.md) | P2 Intelligence Layer Architectural Invariants | **Intended Foundation** | Intelligence evolution (P2-E+) | P2-E | 2026-07-11 |

---

## Supersession Relationships

| ADR | Supersedes | Superseded By | Notes |
|-----|------------|---------------|-------|
| ADR-0012 | Deferred streaming notes in ADR-0008 | — | Frozen streaming contract |
| ADR-0013 | — | — | Supersedable through formal process |

---

## Historical ADRs

_(When ADRs are superseded, they move to this section with supersession date)_

| ADR | Title | Status | Superseded Date | Superseded By | Reason |
|-----|-------|--------|-----------------|---------------|--------|
| _(none yet)_ | | | | | |

---

## ADR Status Definitions

| Status | Meaning |
|--------|---------|
| **Proposed** | Under review, not yet authoritative |
| **Intended Foundation** | Documented architectural guidance, supersedable through formal process |
| **Accepted** | Formally accepted through governance process |
| **Amended** | Accepted with subsequent amendments |
| **Superseded** | Replaced by later ADR (see Superseded By column) |
| **Deprecated** | No longer recommended, but not formally superseded |

---

## Scope Definitions

| Scope | Description | Phases |
|-------|-------------|--------|
| **Streaming execution contract** | Provider-neutral event streams, lifecycle management | P2-D |
| **Intelligence evolution** | Observation, analysis, recommendation, decision support | P2-E through P2-I |

---

## Usage Guidelines

### For Engineers
- **Before implementation:** Check active ADRs for architectural constraints
- **During implementation:** Verify compliance with relevant ADR verification gates
- **If constraints conflict:** Propose supersession through formal ADR process

### For Reviewers
- **During PR review:** Verify ADR compliance (reference ADR in PR description)
- **For architectural changes:** Check if new ADR needed or existing ADR supersession required
- **For audit:** Use this index as entry point to architectural decisions

### For Governance
- **When accepting new ADR:** Update this index with status and relationships
- **When superseding ADR:** Move to Historical section, update relationships
- **Quarterly review:** Verify index accuracy against repository state

---

## Relationship with Evidence

**ADRs document design decisions. Evidence documents verification.**

| Artifact Type | Purpose | Location |
|---------------|---------|----------|
| **ADR** | Why system designed this way | `.ai/core/architecture/` |
| **Evidence** | What was verified | `.ai/reviews/org-memory-dogfood/` |
| **Tests** | Proof of contract compliance | `tests/` |

**Cross-references:**
- ADR-0012 → P2-D evidence packages (P2-D-1 through P2-D-5)
- ADR-0013 → P2-E-ACCEPTANCE.md, ontory-streaming-p2-e-intelligence-proof.md

---

## Index Maintenance

**Responsibility:** Engineering (updated with each ADR acceptance/supersession)

**Update triggers:**
- New ADR proposed → Add to Active section
- ADR accepted → Update status
- ADR superseded → Move to Historical, update relationships
- ADR amended → Update status, add amendment note

**Verification:** Quarterly audit to ensure index matches repository state

---

**Last Updated:** 2026-07-11  
**Maintainer:** Engineering  
**Next Review:** 2026-10-11 (quarterly)
