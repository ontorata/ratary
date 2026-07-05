# Document Ownership

**Purpose:** Define who may create, amend, and approve each document class in `.ai/` and linked governance.  
**Audience:** Project owner, maintainers, AI assistants, contributors.

---

## Roles

| Role | Authority |
|------|-----------|
| **Project owner** | Amends constitution, approves ADRs, approves normative changes to standards and decision framework |
| **Maintainers** | Updates operational snapshots, registry entries, INDEX; proposes standard amendments via PR |
| **AI assistants** | Read and apply all documents; MUST NOT amend governance without owner request |
| **Contributors** | Propose changes via PR; owner approval required for normative edits |

---

## Ownership by folder

| Folder | Owner may amend | AI assistant |
|--------|-----------------|--------------|
| `governance/constitution/` | Owner only | Read only |
| `governance/standards/` | Owner (normative); maintainer (clarifications) | Read only |
| `governance/policy/` | Owner | Read only |
| `governance/registry/` | Owner + maintainer (module list) | Read only |
| `decisions/` | Owner approves status; author proposes | Read only; draft ADR in Proposed |
| `architecture/` | Maintainer updates snapshot; owner for structural law | Read only |
| `workflow/` | Owner (normative); maintainer (cross-refs) | Read only |
| `communication/` | Owner | Read only |
| `prompts/` | Maintainer + owner | Read; MUST NOT weaken gates |
| `templates/` | Maintainer | May fill instances; MUST NOT alter template structure without PR |
| `checklists/` | Owner + maintainer | Read only |
| `roadmap/` | Owner (phases); maintainer (status markers) | Read only |
| `implementation/` | Active task owner / maintainer | `TASK_PROMPT.md` per phase |

---

## Ownership by document type

| Document type | Amendment rule |
|---------------|----------------|
| Constitution | Owner only; breaking change requires explicit announcement |
| ADR | Author drafts → Proposed → owner Approves / Rejects / Supersedes |
| Engineering standard | Owner approval; version note in commit message |
| Prompt | Maintainer PR; must not contradict decision framework |
| Template | Maintainer PR; single responsibility per template file |
| Checklist | Owner or maintainer; must link to authoritative rule |
| TASK_PROMPT | Rotated per phase; not a permanent standard |

---

## AI assistant obligations

- AI assistants MUST NOT silently edit files under `governance/`, `decisions/`, or `workflow/` during unrelated implementation.
- AI assistants MAY propose amendments when the owner requests documentation updates.
- AI assistants MUST cite canonical paths when registry stubs point to `docs/`.

---

## Revision audit

Every normative amendment MUST:

1. State what decision impact changed  
2. Update [INDEX.md](INDEX.md) if file added, removed, or reclassified  
3. Update cross-references in dependent documents  
4. Pass owner review before merge  

---

*Subordinate to [governance/constitution](../../core/constitution/00-CONSTITUTION.md).*
