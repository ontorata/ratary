# Governance Maintenance Strategy

**Purpose:** Long-term upkeep of the `.ai/` directory across assistants, phases, and years.  
**Audience:** Project owner, maintainers.  
**Companion:** [GOVERNANCE-ARCHITECTURE.md](GOVERNANCE-ARCHITECTURE.md)

---

## Principles

1. **Single canonical source** — Normative text lives in one place; `.ai/` registers and routes.
2. **Registry follows reality** — [INDEX.md](INDEX.md) updated in the same commit as any add/rename/remove.
3. **Gate before status** — Roadmap ✅ only after [review/00-PHASE-GATE.md](review/00-PHASE-GATE.md) owner PASS.
4. **ADR immutability** — Approved ADRs are historical; supersede, do not edit.
5. **No silent weakening** — Prompts and checklists MUST NOT reduce MUST gates without owner approval.

---

## Maintenance calendar

| Cadence | Activity | Responsible |
|---------|----------|-------------|
| **Per PR** (governance touch) | Update INDEX; verify cross-refs; no duplicate law | Author + reviewer |
| **Per phase close** | Phase gate record in `phases/NN/`; roadmap ✅; ADR Implemented; retrospective filed | Owner + maintainer |
| **Per phase open** | Readiness review; TASK_PROMPT rotation; ADR gates verified | Owner |
| **Quarterly** | Stale stub audit; broken links; `decisions/` vs `adr/` consistency | Maintainer |
| **Annually** | Constitution chain review; reading order still matches project reality | Owner |
| **On framework change** | Sync `prompts/`, `checklists/`, `constitution/INDEX.md` | Maintainer |

---

## Change procedures

### Adding a governance document

1. Choose folder per [GOVERNANCE-ARCHITECTURE.md §4](GOVERNANCE-ARCHITECTURE.md#4-folder-specifications)
2. One responsibility per file
3. Link upward — do not duplicate constitution or standards
4. Add row to [INDEX.md](INDEX.md)
5. If normative: add to [constitution/INDEX.md](constitution/INDEX.md) reading chain if required reading
6. Owner approval if immutable or architectural

### Migrating canonical text from `docs/` to `.ai/`

1. Owner approves migration
2. Move content; leave stub redirect at old path for one release cycle
3. Update all registry stubs and INDEX
4. Announce in phase retrospective or gate record

### ADR lifecycle maintenance

| Transition | Action |
|------------|--------|
| Proposed → Approved | Owner sign-off; update `adr/accepted/README.md` |
| Approved → Implemented | After phase gate; note in ADR header |
| Approved → Superseded | New ADR references successor; move index entry |

### Phase artifact maintenance

| Artifact | Location | Retention |
|----------|----------|-----------|
| Gate verdict | `phases/NN-name/gate.md` | Permanent |
| Readiness record | `phases/NN-name/readiness.md` | Permanent |
| Retrospective | `phases/NN-name/retrospective.md` or archive | Permanent |
| Design history | `docs/archive/` | Permanent |

---

## Quality checks

Before merging governance PRs:

- [ ] [INDEX.md](INDEX.md) accurate
- [ ] No contradictory MUST rules between `docs/` and `.ai/`
- [ ] RFC 2119 used consistently in normative sections
- [ ] Registry stubs point to existing canonical paths
- [ ] [OWNERSHIP.md](OWNERSHIP.md) still accurate for new files

---

## Decommissioning

| Item | Rule |
|------|------|
| Superseded ADR | Status → Superseded; remain in repo |
| Retired prompt | Move to `prompts/archive/` with README note |
| Obsolete phase folder | Keep for audit; mark README as closed |
| Removed standard | Owner approval; archive in `docs/archive/` |

---

## 10-year evolution triggers

| Trigger | Response |
|---------|----------|
| New storage engine | ADR + `architecture/` + `governance/standards/` cross-ref |
| New AI tool mainstream | Add `prompts/` variant if needed — not new constitution |
| Phase 11+ | Extend `roadmap/` + `phases/11-name/` |
| Enterprise compliance | `phases/10-enterprise/` + security standard update |
| Corpus too large | Split standards further — never merge into monolith |

---

*Subordinate to [OWNERSHIP.md](OWNERSHIP.md).*
