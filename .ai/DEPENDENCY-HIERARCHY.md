# Dependency Hierarchy

**Purpose:** Define authority order when documents, prompts, or assistant defaults conflict.  
**Audience:** All AI assistants.  
**Normative keywords:** RFC 2119 (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY).

**Canonical chain:** [constitution/INDEX.md](constitution/INDEX.md)

---

## Governance chain

```
00-CONSTITUTION
        │
        ▼
13-AI-DECISION-FRAMEWORK
        │
        ▼
04-ARCHITECTURE
        │
        ▼
ADR
        │
        ▼
01-ENGINEERING-STANDARD
        │
        ▼
02-CODING-STYLE
        │
        ▼
03-NAMING-CONVENTION
        │
        ▼
05-DEVELOPMENT-WORKFLOW
        │
        ▼
06-TESTING-STANDARD
        │
        ▼
07-DOCUMENTATION-STANDARD
        │
        ▼
08-REVIEW-CHECKLIST
        │
        ▼
09-ROADMAP
```

---

## Authority stack

| Priority | Source | Location | Role |
|----------|--------|----------|------|
| 1 | Explicit owner instruction | Current session | Overrides when stated |
| 2 | Constitution | [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) | Immutable law |
| 3 | Decision framework | [13-AI-DECISION-FRAMEWORK.md](../decision-framework/13-AI-DECISION-FRAMEWORK.md) | How to decide |
| 4 | Structural architecture | [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) | Layer and port law |
| 5 | Approved ADRs | [decisions/accepted](decisions/accepted/README.md) | Structural decisions |
| 6 | Engineering standard | [01-ENGINEERING-STANDARD.md](../standards/01-ENGINEERING.md) | Domain rules |
| 7 | Coding style | [02-CODING-STYLE.md](../standards/02-CODING.md) | Format and refactor |
| 8 | Naming convention | [03-NAMING-CONVENTION.md](../standards/03-NAMING.md) | Identifiers |
| 9 | Development workflow | [05-DEVELOPMENT-WORKFLOW.md](../workflow/05-WORKFLOW.md) | Process gates |
| 10 | Testing standard | [06-TESTING-STANDARD.md](../standards/06-TESTING.md) | Verification |
| 11 | Documentation standard | [07-DOCUMENTATION-STANDARD.md](../standards/07-DOCUMENTATION.md) | Doc triggers |
| 12 | Review checklist | [08-REVIEW-CHECKLIST.md](../standards/08-REVIEW.md) | Pre-merge gate |
| 13 | Roadmap | [09-ROADMAP.md](../roadmap/09-ROADMAP.md) | Phase evolution |
| 14 | Module registry | [AI_BRAIN_CONSTITUTION.md](../ai-rules/11-AI-RULES.md) | Canonical owners |
| 15 | Operational snapshot | [ARCHITECTURE.md](../architecture/10-PHASE-STATUS.md) | Current phase status |
| 16 | Active task | [TASK_PROMPT.md](../TASK_PROMPT.md) | Scoped work |
| 17 | Existing codebase | `src/` | Established patterns |
| 18 | User request | Session | When not conflicting |
| 19 | Tool defaults | Model / IDE | Lowest authority |

**Supplementary** (subordinate to the chain): [10](../ai-rules/11-AI-RULES.md) · [11](../supplementary/SECURITY.md) · [12](../supplementary/PERFORMANCE.md) · [14](../supplementary/WRITING.md)

---

## Dependency rules

- Lower priority MUST NOT violate higher priority.
- Prompts and templates in `.ai/prompts/` and `.ai/templates/` are subordinate to the governance chain.
- Checklists verify compliance; they do not create new law.
- Equal priority at the same tier → halt and escalate per [prompts/escalation.md](prompts/escalation.md).

---

## Cross-folder dependencies

```
constitution/INDEX.md  ← canonical reading + authority order
        │
        ├──► governance/ (registry stubs → docs/)
        ├──► decisions/ (ADR index)
        ├──► architecture/ (structural + snapshot stubs)
        ├──► workflow/ (process stubs)
        ├──► prompts/ (executable; never override chain)
        ├──► templates/ (blank forms)
        ├──► checklists/ (verify chain)
        └──► roadmap/ (phase stub)
```

---

## Amendment impact

| If amended | Must review for conflict |
|------------|--------------------------|
| Constitution | Entire governance chain |
| Decision framework | constitution/INDEX, prompts, checklists |
| Architecture | ADRs, engineering standard, roadmap |
| ADR (new Approved) | Architecture snapshot, TASK_PROMPT, `src/` |
| Engineering standard | Coding style, naming, checklists |

---

*Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md).*
