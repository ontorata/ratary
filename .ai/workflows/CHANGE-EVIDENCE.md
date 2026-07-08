# Change Evidence — Minimum Requirements

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 3 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |

---

## Purpose

Define **minimum evidence** so every change — human or AI — is auditable before merge.

---

## Universal fields (all changes)

| Field | Required | Description |
|-------|----------|-------------|
| Change summary | ✅ | What and why (1–3 sentences) |
| Files changed | ✅ | Key paths; not a raw `git status` dump |
| Architecture impact | ✅ | None / Low / Medium / High + explanation |
| Tests executed | ✅ | Commands + pass/fail counts |
| Governance artifacts updated | ✅ | List `.ai/` and `docs/` paths, or explicit "none" with reason |
| Known risks | ✅ | Open issues · follow-ups · deferred debt |
| Ready for merge | ✅ | ⬜ / ✅ with justification |

---

## By change class

### Code (behavior)

| Evidence | Location |
|----------|----------|
| Implementation Completion Report | PR body or `.ai/reviews/<id>/implementation.md` |
| Test output | CI or local `npm run ci:governance` |
| Documentation Impact Check | PR checklist — categories checked |
| ADR reference | If architecture paths touched (CI-04) |

### Architecture / boundary

| Evidence | Location |
|----------|----------|
| ADR amendment or new ADR | `.ai/core/architecture/` or `.ai/core/adr/` |
| Architecture change map alignment | [ARCHITECTURE-CHANGE-MAP.md](../core/governance/ARCHITECTURE-CHANGE-MAP.md) |
| Identity tests | `npm run test:identity` |
| Review notes | `.ai/reviews/` or wave checkpoint |

### Governance wave (P0-B)

| Evidence | Location |
|----------|----------|
| Wave checkpoint | `.ai/governance/waves/WAVE-N-*.md` |
| Proof artifact | `.ai/reviews/engineering-governance/*-proof.md` |
| Lock tag | `engineering-governance-wave-N-locked` |
| `ci:governance` | Pass when pipeline/code touched |

### Documentation only

| Evidence | Location |
|----------|----------|
| Impact rationale | Why no code change |
| Cross-links valid | INDEX · README · public mirror |
| Review | PR description |

### Release

| Evidence | Location |
|----------|----------|
| Release record | `.ai/governance/releases/` |
| Remote verification | `git ls-remote` tags |
| Test baseline | Document counts (e.g. 88/88) |

---

## AI-assisted changes — additional fields

| Field | Required |
|-------|----------|
| Agent role | execution · review · governance |
| Tool | Cursor · Claude Code · other |
| Protocol followed | Link to [AI-DEVELOPMENT-PROTOCOL.md](./AI-DEVELOPMENT-PROTOCOL.md) |
| Scope confirmation | Wave / blueprint / owner approval reference |
| Handoff artifact | [IMPLEMENTATION-REPORT-TEMPLATE.md](./IMPLEMENTATION-REPORT-TEMPLATE.md) when switching agents |

---

## Evidence anti-patterns

| Anti-pattern | Result |
|--------------|--------|
| "Tests pass" without command | ❌ Insufficient |
| Empty architecture impact on auth change | ❌ Insufficient |
| Code PR with no `.ai/` or `docs/` touch | ❌ `ci:docs-impact` fail |
| Chat summary only, no repo artifact | ❌ Not auditable |

---

## Templates

- [COMPLETION-REPORT-TEMPLATE.md](../core/governance/COMPLETION-REPORT-TEMPLATE.md) — merge-ready PR
- [IMPLEMENTATION-REPORT-TEMPLATE.md](./IMPLEMENTATION-REPORT-TEMPLATE.md) — agent-to-agent handoff

---

## Related

- [AI-DEVELOPMENT-PROTOCOL.md](./AI-DEVELOPMENT-PROTOCOL.md)
- [SESSION-HANDOFF.md](./SESSION-HANDOFF.md)
