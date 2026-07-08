# Change Gating Process

| Field | Value |
|-------|-------|
| **Status** | Active — governance as process, not documents only |
| **Authority** | [ENGINEERING-CONSTITUTION.md](../constitution/ENGINEERING-CONSTITUTION.md) |
| **Last updated** | 2026-07-07 |

---

## Purpose

Governance must **gate** evolution — not sit in a folder. Every significant change follows this flow.

---

## Flow

```
Feature Idea
      │
      ▼
RFC (if change is significant / decision unclear)
      │
      ▼
Architecture Review
      │
      ▼
ADR (if new architectural decision)
      │
      ▼
Blueprint Update (if implementation pattern changes)
      │
      ▼
Standards Check (conventions still met?)
      │
      ▼
Implementation
      │
      ▼
Tests
      │
      ▼
Documentation
      │
      ▼
Release
      │
      ▼
Post-release Review
      │
      ▼
Implementation Completion Protocol
      │
      ▼
Engineering Completion Report → Ready for Merge
```

**Organization rule:** No PR is complete until `.ai` and `docs` are synchronized.

See [IMPLEMENTATION-COMPLETION-PROTOCOL.md](./IMPLEMENTATION-COMPLETION-PROTOCOL.md).

---

## Gate definitions

| Gate | When required | Output |
|------|---------------|--------|
| **RFC** | Significant scope; multiple alternatives; decision not ready | Draft RFC in `.ai/core/rfc/` |
| **Architecture Review** | Cross-repo impact; boundary touch; security | Review notes; RFC/ADR decision |
| **ADR** | New accepted architectural decision | ADR-NNN Accepted |
| **Blueprint** | Pattern or topology change | Updated blueprint md |
| **Standards** | All PRs — API shape, logging, tests, ADR-014 | Checklist pass |
| **Tests** | All behavior changes | Green CI |
| **Documentation** | User-facing or API changes | Updated docs |
| **Release** | SemVer + changelog | Tagged release |
| **Post-release** | Significant features | Retro; metrics; AI-GOVERNANCE lifecycle check |
| **Completion** | Every merge | Architecture sync; Completion Report per protocol |

---

## Post-implementation (mandatory)

After code is written — **before merge**:

```
Code → Architecture Impact Review → Update .ai → Update docs → Tests → Completion Report → Merge
```

Full rules: [IMPLEMENTATION-COMPLETION-PROTOCOL.md](./IMPLEMENTATION-COMPLETION-PROTOCOL.md)

---

## When to skip RFC

| Change type | Path |
|-------------|------|
| Bug fix, no boundary change | Implementation → Tests → Release |
| Standard-compliant small feature | ADR not needed if no new decision |
| Policy tunable (retention days) | Policy update only |

When unsure → RFC first. Cheaper than wrong ADR.

---

## RFC → ADR promotion

1. RFC status `Under Review` → discussion
2. Accepted → create ADR-NNN; RFC status `Accepted → ADR-NNN`
3. Rejected → RFC status `Rejected` with reason — keep file

Example: RFC-001 Agent Runtime v2 → ADR-015 (when accepted).

---

## PR checklist (implementation gate)

> **No PR complete until `.ai` and `docs` synchronized.**

- [ ] Architecture Impact Analysis performed (Rule 2)
- [ ] Constitution boundaries respected (repo ownership)
- [ ] ADR-014: no provider conditionals in business layer
- [ ] ADR-012: `owner_id` on data paths
- [ ] API standard error format
- [ ] Tests added/updated
- [ ] Public `docs/` updated
- [ ] Private `.ai/` governance reviewed/updated
- [ ] ADR/RFC linked or filed
- [ ] Engineering Completion Report (significant changes)

---

## Significant change signals

Triggers **RFC + likely ADR**:

- New product boundary or repo responsibility
- New data classification or training path
- Agent runtime structural change
- Auth model change
- Breaking public API
- New external provider integration (ADR-014 adapter only)

### Identity foundation boundaries (mandatory ADR — P0-B Wave 1)

Changes affecting **identity**, **tenant**, **permission**, **data ownership**, or **transport boundary** MUST amend or reference:

| Topic | ADR |
|-------|-----|
| Identity resolution · auth middleware | [ADR-0001](../architecture/ADR-0001-identity-boundary.md) |
| Tenant / org isolation | [ADR-0002](../architecture/ADR-0002-tenant-isolation.md) |
| Permission model · authorization boundary | [ADR-0003](../architecture/ADR-0003-authorization-model.md) |
| REST ↔ MCP parity · transport scope | [ADR-0004](../architecture/ADR-0004-transport-parity.md) |

Path map: [ARCHITECTURE-CHANGE-MAP.md](./ARCHITECTURE-CHANGE-MAP.md) · CI: `npm run ci:adr-impact`

---

## Post-release review

Within 2 weeks of significant release:

1. Did metrics/traces match expectations? (ADR-010)
2. Any isolation or security surprises? (ADR-012)
3. Eval regression? (ADR-011)
4. Update AI-GOVERNANCE maturity notes if needed
5. File follow-up RFC/ADR for debt discovered

---

## Governance freeze

**No new governance document types** until this process runs on real features. Extend existing RFC/ADR/standards/blueprints only.

---

## Related

- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](./IMPLEMENTATION-COMPLETION-PROTOCOL.md)
- [COMPLETION-REPORT-TEMPLATE.md](./COMPLETION-REPORT-TEMPLATE.md)
- [AI-GOVERNANCE.md](./AI-GOVERNANCE.md)
- [GOVERNANCE-STATUS.md](./GOVERNANCE-STATUS.md)
- [../rfc/INDEX.md](../rfc/INDEX.md)
