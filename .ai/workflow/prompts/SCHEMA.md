# Prompt Metadata Schema

**Purpose:** Define the required fields and conventions for every file in the prompt library.  
**Audience:** Maintainers, all AI assistants.  
**Scope:** Repository-agnostic - portable across projects.

---

## File layout

```
prompts/
├── SCHEMA.md                 ← this document
├── PROMPT-LIBRARY.md         ← master catalog
├── README.md                 ← entry point
└── {category}/
    ├── README.md             ← category index
    └── {prompt-slug}.md      ← one prompt per file
```

**Categories (fixed set):** `planning`, `analysis`, `architecture`, `implementation`, `migration`, `testing`, `review`, `documentation`, `release`, `operations`.

---

## Required sections per prompt

Every `{prompt-slug}.md` MUST contain these sections in order:

| Section | Content |
|---------|---------|
| **Header** | Title, category, ID, version |
| **Purpose** | One paragraph - single responsibility |
| **Expected input** | Bulleted list of what the operator provides |
| **Expected output** | Bulleted list of deliverables |
| **When to execute** | Lifecycle trigger(s) |
| **Dependencies** | Prior prompts, documents, or gates |
| **Compatible AI assistants** | Tool suitability notes |
| **Prompt** | Copy-paste block with `{PLACEHOLDERS}` |

---

## Placeholder conventions

Use `{UPPER_SNAKE_CASE}` placeholders. Never hardcode repository paths.

| Placeholder | Meaning |
|-------------|---------|
| `{PROJECT_NAME}` | Product or repository name |
| `{TASK_DESCRIPTION}` | User goal or ticket text |
| `{GOVERNANCE_ROOT}` | Governance directory (e.g. `.ai/`, `docs/governance/`) |
| `{CONSTITUTION_PATH}` | Highest authority document path |
| `{ARCHITECTURE_PATH}` | Structural architecture document path |
| `{ADR_INDEX_PATH}` | ADR registry path |
| `{SOURCE_ROOT}` | Application source root (e.g. `src/`) |
| `{SCOPE}` | Bounded scope statement |
| `{CONSTRAINTS}` | Non-negotiable constraints |
| `{TARGET_MODULE}` | Module, service, or component name |
| `{BASELINE_VERSION}` | Release or commit reference |
| `{ENVIRONMENT}` | `local`, `staging`, `production` |

Operators replace placeholders before execution.

---

## Prompt ID format

```
{category}/{prompt-slug}
```

Example: `architecture/adr-authoring`

---

## Versioning

| Field | Rule |
|-------|------|
| **Version** | Semantic `MAJOR.MINOR.PATCH` in file header |
| **MAJOR** | Output contract or purpose changed |
| **MINOR** | Clarification; backward compatible |
| **PATCH** | Typo or formatting only |

---

## Compatibility matrix (default)

Unless a prompt notes otherwise, all prompts are compatible with:

| Assistant | Suitability |
|-----------|-------------|
| **ChatGPT** | Planning, analysis, architecture, documentation |
| **Claude** | Planning, analysis, architecture, review, documentation |
| **Cursor** | Analysis, implementation, testing, review (codebase access) |
| **Codex** | Implementation, testing, migration (code generation) |
| **Gemini** | Analysis, documentation, review |
| **OpenHands** | Implementation, testing, operations (agent execution) |

Prompts that require repository file access SHOULD note **IDE agents preferred** (Cursor, Codex, OpenHands).

---

## Rules

1. Prompts MUST NOT redefine governance law - they reference `{GOVERNANCE_ROOT}` documents.
2. Prompts MUST NOT weaken approval gates or skip dependencies.
3. One prompt, one responsibility - split compound workflows.
4. English only in prompt bodies.
5. No repository-specific module names, paths, or technology stack unless supplied via placeholders.

---

*Subordinate to project constitution when installed; portable schema when copied standalone.*
