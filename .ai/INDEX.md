# Document Index

**Purpose:** Registry of every governance document — one file, one responsibility.  
**Audience:** AI assistants locating authoritative sources.

**Legend:** `canonical` = source of truth today · `native` = lives in `.ai/`

---

## Root

| File | Type | Responsibility |
|------|------|----------------|
| [GOVERNANCE-ARCHITECTURE.md](GOVERNANCE-ARCHITECTURE.md) | native | **Complete governance design** — folders, hierarchy, dependencies |
| [MAINTENANCE.md](MAINTENANCE.md) | native | Long-term upkeep strategy |
| [constitution/INDEX.md](constitution/INDEX.md) | native | **First read** — reading order, authority, dependency, navigation |
| [README.md](README.md) | native | Governance folder overview |
| [INDEX.md](INDEX.md) | native | This registry |
| [DEPENDENCY-HIERARCHY.md](DEPENDENCY-HIERARCHY.md) | native | Authority order |
| [READING-ORDER.md](READING-ORDER.md) | native | Session and task reading sequence |
| [OWNERSHIP.md](OWNERSHIP.md) | native | Amendment authority |

---

## governance/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [governance/README.md](governance/README.md) | native | Folder purpose; immutable vs amendable |
| [governance/constitution/README.md](governance/constitution/README.md) | → [00-CONSTITUTION.md](constitution/00-CONSTITUTION.md) | Immutable project law |
| [governance/standards/engineering.md](governance/standards/engineering.md) | → [01-ENGINEERING-STANDARD.md](standards/01-ENGINEERING.md) | Layers, DI, repos, API rules |
| [governance/standards/coding-style.md](governance/standards/coding-style.md) | → [02-CODING-STYLE.md](standards/02-CODING.md) | Formatting, function size, refactoring |
| [governance/standards/naming.md](governance/standards/naming.md) | → [03-NAMING-CONVENTION.md](standards/03-NAMING.md) | Files, types, env, API names |
| [governance/standards/testing.md](governance/standards/testing.md) | → [06-TESTING-STANDARD.md](standards/06-TESTING.md) | Test types, MockD1, coverage |
| [governance/standards/documentation.md](governance/standards/documentation.md) | → [07-DOCUMENTATION-STANDARD.md](standards/07-DOCUMENTATION.md) | README, ADR, changelog rules |
| [governance/standards/security.md](governance/standards/security.md) | → [11-SECURITY-STANDARD.md](supplementary/SECURITY.md) | Auth, isolation, MCP security |
| [governance/standards/performance.md](governance/standards/performance.md) | → [12-PERFORMANCE-STANDARD.md](supplementary/PERFORMANCE.md) | Budgets and trade-offs |
| [governance/policy/adr-policy.md](governance/policy/adr-policy.md) | → [ADR-POLICY.md](../docs/adr/POLICY.md) | When and how to write ADRs |
| [governance/policy/amendment-policy.md](governance/policy/amendment-policy.md) | native | How governance docs may change |
| [governance/registry/module-owners.md](governance/registry/module-owners.md) | → [AI_BRAIN_CONSTITUTION.md](ai-rules/11-AI-RULES.md) | Canonical module registry |

---

## adr/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [adr/README.md](../../docs/adr/README.md) | native | ADR lifecycle — **canonical** |
| [adr/template.md](../../docs/adr/template.md) | → [adr/000-template.md](../docs/adr/000-template.md) | Blank ADR structure |
| [adr/accepted/README.md](../../docs/adr/accepted/README.md) | native | Index of approved ADRs |

## decisions/ (alias → adr/)

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [decisions/README.md](decisions/README.md) | native | Redirect to adr/ |
| [decisions/template.md](decisions/template.md) | → [adr/template.md](../../docs/adr/template.md) | Alias |
| [decisions/accepted/README.md](decisions/accepted/README.md) | → [adr/accepted](../../docs/adr/accepted/README.md) | Alias |

---

## phases/

| File | Type | Responsibility |
|------|------|----------------|
| [phases/README.md](phases/README.md) | native | Phase index — 11 folders, lifecycle rules |
| [phases/PHASE-DOCUMENT-SCHEMA.md](phases/PHASE-DOCUMENT-SCHEMA.md) | native | Ten-document schema, lifecycle, roadmap mapping |
| `phases/NN-name/` | native × 11 | Per-phase: README, DESIGN, IMPLEMENTATION, MIGRATION, TESTING, REVIEW, COMPLETION, RETROSPECTIVE, CHECKLIST, RISKS |

**Phase folders:** `01-foundation` … `10-enterprise` (includes `02.5`, `02.6`). Closed phases: read-only at gate PASS.

---

## architecture/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [architecture/README.md](architecture/README.md) | native | Structural vs operational docs |
| [architecture/structural-law.md](architecture/structural-law.md) | → [04-ARCHITECTURE.md](architecture/04-ARCHITECTURE.md) | Layers, ports, dependency direction |
| [architecture/operational-snapshot.md](architecture/operational-snapshot.md) | → [ARCHITECTURE.md](architecture/10-PHASE-STATUS.md) | Current phase, ports, test count |

---

## workflow/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [workflow/README.md](workflow/README.md) | native | Process folder purpose |
| [workflow/decision-framework.md](workflow/decision-framework.md) | → [13-AI-DECISION-FRAMEWORK.md](decision-framework/13-AI-DECISION-FRAMEWORK.md) | Decision flow and principles |
| [workflow/development-workflow.md](workflow/development-workflow.md) | → [05-DEVELOPMENT-WORKFLOW.md](workflow/05-WORKFLOW.md) | Review → release gates |
| [workflow/engineering-analysis.md](workflow/engineering-analysis.md) | → [ENGINEERING.md](workflow/05-WORKFLOW.md) | Pre-code analysis template |

---

## communication/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [communication/README.md](communication/README.md) | native | AI output conventions folder |
| [communication/ai-protocol.md](communication/ai-protocol.md) | → [10-AI-COMMUNICATION.md](ai-rules/11-AI-RULES.md) | Vocabulary and response structure |
| [communication/writing-standard.md](communication/writing-standard.md) | → [14-WRITING-STANDARD.md](supplementary/WRITING.md) | Documentation form and RFC 2119 |

---

## prompts/

| File | Type | Responsibility |
|------|------|----------------|
| [prompts/README.md](prompts/README.md) | native | Library entry — categories, rules, legacy redirects |
| [prompts/PROMPT-LIBRARY.md](prompts/PROMPT-LIBRARY.md) | native | Master catalog — 40 prompts, dependency graph |
| [prompts/SCHEMA.md](prompts/SCHEMA.md) | native | Metadata schema, placeholders, versioning |
| `prompts/{category}/` | native × 10 | Planning, analysis, architecture, implementation, migration, testing, review, documentation, release, operations (4 prompts each) |
| [prompts/operations/session-start.md](prompts/operations/session-start.md) | native | Session entry (`operations/session-start`) |
| [prompts/implementation/pre-implementation-gate.md](prompts/implementation/pre-implementation-gate.md) | native | Pre-code gate |
| [prompts/documentation/session-handoff.md](prompts/documentation/session-handoff.md) | native | Session continuity |
| [prompts/operations/escalation.md](prompts/operations/escalation.md) | native | Blocker escalation |

**Portable:** Repository-agnostic — uses `{PLACEHOLDERS}` not hardcoded paths.

---

## playbooks/

| File | Type | Responsibility |
|------|------|----------------|
| [playbooks/README.md](playbooks/README.md) | native | Playbook index — procedures vs prompts |
| [playbooks/phase-start.md](playbooks/phase-start.md) | native | Open phase N+1 (Readiness READY) |
| [playbooks/phase-completion.md](playbooks/phase-completion.md) | native | Close phase N (Gate PASS) |
| [playbooks/hotfix.md](playbooks/hotfix.md) | native | Urgent production fix |
| [playbooks/incident-response.md](playbooks/incident-response.md) | native | Production incident procedure |
| [playbooks/rollback.md](playbooks/rollback.md) | native | Deploy/migration rollback |
| [playbooks/release.md](playbooks/release.md) | native | Scheduled release to production |

---

## audits/

| File | Type | Responsibility |
|------|------|----------------|
| [audits/README.md](audits/README.md) | native | Audit index and rules |
| [audits/phase-01.md](audits/phase-01.md) | native | Phase 1 Foundation audit |
| [audits/phase-02.md](audits/phase-02.md) | native | Phase 2 Knowledge audit |
| [audits/phase-03.md](audits/phase-03.md) | native | Phase 3 Authorization audit |
| [audits/phase-04.md](audits/phase-04.md) | native | Phase 4 Memory Intelligence audit |
| [audits/phase-05.md](audits/phase-05.md) | native | Phase 5 Embedding audit |
| [audits/latest.md](audits/latest.md) | native | **Active** aggregate audit — pre-Phase 6 |

---

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [templates/README.md](templates/README.md) | native | Template usage rules |
| [templates/adr.md](templates/adr.md) | → [adr/000-template.md](../docs/adr/000-template.md) | ADR blank form |
| [templates/task-prompt.md](templates/task-prompt.md) | → [TASK_PROMPT.template.md](workflow/12-TASK-TEMPLATE.md) | Phase task blank form |
| [templates/design-discussion.md](templates/design-discussion.md) | native | Pre-implementation design blank |
| [templates/completion-report.md](templates/completion-report.md) | native | Phase completion blank |

---

## checklists/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [checklists/README.md](checklists/README.md) | native | Checklist-only folder rules |
| [checklists/decision-gate.md](checklists/decision-gate.md) | → [13-AI-DECISION-FRAMEWORK.md](decision-framework/13-AI-DECISION-FRAMEWORK.md) | Pre-code verification |
| [checklists/pre-merge.md](checklists/pre-merge.md) | → [08-REVIEW-CHECKLIST.md](standards/08-REVIEW.md) | Pre-merge verification |
| [checklists/release.md](checklists/release.md) | native | Release gate verification |

---

## roadmap/

| File | Canonical | Responsibility |
|------|-----------|----------------|
| [roadmap/README.md](roadmap/README.md) | native | Phase planning folder |
| [roadmap/phases.md](roadmap/phases.md) | → [09-ROADMAP.md](roadmap/09-ROADMAP.md) | Phase 1–10 evolution |

---

## review/

| File | Type | Responsibility |
|------|------|----------------|
| [review/README.md](review/README.md) | native | Phase lifecycle overview |
| [review/00-PHASE-GATE.md](review/00-PHASE-GATE.md) | native | Close phase — owner verdict |
| [review/01-PHASE-CHECKLIST.md](review/01-PHASE-CHECKLIST.md) | native | Design → gate verification |
| [review/02-PHASE-SCORECARD.md](review/02-PHASE-SCORECARD.md) | native | Quality dimensions at gate |
| [review/03-PHASE-RETROSPECTIVE.md](review/03-PHASE-RETROSPECTIVE.md) | native | Post-gate lessons template |
| [review/04-PHASE-READINESS.md](review/04-PHASE-READINESS.md) | native | Open next phase — prerequisites |

---

## implementation/

| File | Type | Responsibility |
|------|------|----------------|
| [implementation/README.md](implementation/README.md) | native | Boundary: non-governance docs |

---

## Future expansion (reserved)

| Path | When to add |
|------|-------------|
| `decisions/proposed/` | Per-draft ADR files when volume grows |
| `decisions/superseded/` | When ADRs are retired |
| `roadmap/phases/NN-name.md` | One file per phase design handoff |
| `governance/standards/mcp.md` | If MCP rules outgrow engineering standard |
| `prompts/incident-response.md` | Production incident workflow |

---

*Update this index when adding or reclassifying any document.*
