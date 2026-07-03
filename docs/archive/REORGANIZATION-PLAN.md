# AI Brain — Documentation Reorganization Plan

**Date:** 2026-07-03  
**Purpose:** Simplify documentation structure for better AI discoverability

---

## Current State

### Folders: 22

```
adr/
ai-rules/
architecture/
audits/
checklists/
communication/
constitution/
decision-framework/
decisions/
glossary/
governance/
implementation/
phases/
playbooks/
prompts/
prompts-packs/
review/
roadmap/
standards/
supplementary/
templates/
workflow/
```

### Files: ~120+ files across all folders

---

## Target Structure

```
.ai/
├── 01-core/        # Constitution, glossary, AI rules, decision framework
├── 02-standards/  # Engineering, coding, naming, testing standards
├── 03-workflow/   # Development, review, testing workflows
├── 04-phases/     # Phase documents (1-10)
├── 05-adr/        # Architecture Decision Records
├── 06-templates/  # Templates for ADR, tasks, reports
└── README.md      # Main index
```

**Target Folders: 6** (reduced from 22)

---

## Reorganization Actions

### 01-core/

| Source | Action | Destination |
|--------|--------|-------------|
| constitution/ | MERGE | 01-core/ |
| glossary/ | MERGE | 01-core/ |
| ai-rules/ | MERGE | 01-core/ |
| decision-framework/ | MERGE | 01-core/ |
| governance/constitution/ | MERGE | 01-core/ |
| governance/policy/ | MERGE | 01-core/ |
| governance/registry/ | MERGE | 01-core/ |

### 02-standards/

| Source | Action | Destination |
|--------|--------|-------------|
| standards/ | MERGE | 02-standards/ |
| governance/standards/ | MERGE | 02-standards/ |
| communication/writing-standard.md | MERGE | 02-standards/WRITING.md |

### 03-workflow/

| Source | Action | Destination |
|--------|--------|-------------|
| prompts/ | MERGE | 03-workflow/prompts/ |
| prompts-packs/ | ARCHIVE | ~~03-workflow/prompts-packs/~~ (superseded by prompts/) |
| playbooks/ | MERGE | 03-workflow/playbooks/ |
| implementation/ | MERGE | 03-workflow/ |
| checklists/ | MERGE | 03-workflow/checklists/ |
| communication/ | MERGE | 03-workflow/ |
| workflow/ | MERGE | 03-workflow/ |
| review/ | MERGE | 03-workflow/review/ |

### 04-phases/

| Source | Action | Destination |
|--------|--------|-------------|
| phases/ | KEEP | 04-phases/ |
| roadmap/ | MERGE | 04-phases/ |
| audits/ | ARCHIVE | ~~04-phases/audits/~~ (historical) |
| review/00-PHASE-GATE.md | MOVE | 04-phases/PHASE-GATE.md |
| review/01-PHASE-CHECKLIST.md | MOVE | 04-phases/PHASE-CHECKLIST.md |

### 05-adr/

| Source | Action | Destination |
|--------|--------|-------------|
| adr/ | MERGE | 05-adr/ |
| decisions/ | MERGE | 05-adr/ |

### 06-templates/

| Source | Action | Destination |
|--------|--------|-------------|
| templates/ | KEEP | 06-templates/ |

---

## Files at Root Level

| File | Action | Destination |
|------|--------|-------------|
| README.md | KEEP | Root README (updated) |
| INDEX.md | MERGE | README.md (consolidated) |
| DEPENDENCY-HIERARCHY.md | MOVE | 01-core/DEPENDENCIES.md |
| GOVERNANCE-ARCHITECTURE.md | ARCHIVE | ~~(duplicated in standards)~~ |
| MAINTENANCE.md | MERGE | 03-workflow/MAINTENANCE.md |
| OWNERSHIP.md | MERGE | 01-core/OWNERSHIP.md |
| READING-ORDER.md | MERGE | README.md (as section) |
| TASK_PROMPT.md | MERGE | 03-workflow/TASK-PROMPT.md |
| TASK_PROMPT.md (original) | ARCHIVE | ~~(keep for reference)~~ |

---

## Summary

### Before

| Metric | Count |
|--------|-------|
| Folders | 22 |
| Root files | 8 |
| Total files | ~120+ |

### After

| Metric | Count |
|--------|-------|
| Folders | 6 |
| Root files | 1 |
| Total files | ~120+ (same content, better organized) |

### Token Reduction Estimate

**Before:** AI must read 22 folder READMEs + multiple index files  
**After:** AI reads 1 root README + 6 folder READMEs

**Estimated reduction:** 60-70% fewer files to index for initial discovery

### Discoverability Improvement

**Before:** 
- 22 possible entry points
- Overlapping concerns (prompts vs prompts-packs vs playbooks)
- Duplicated information

**After:**
- 6 clear entry points
- One way to find things
- Clear hierarchy

---

## Actions Required

1. Create new folder structure
2. Move files per plan
3. Update all README files
4. Update cross-references
5. Archive duplicated folders
6. Commit changes

---

## Implementation Order

1. Create 01-core/, 02-standards/, 03-workflow/, 04-phases/, 05-adr/, 06-templates/
2. Move 01-core files
3. Move 02-standards files
4. Move 03-workflow files
5. Move 04-phases files
6. Move 05-adr files
7. Keep 06-templates as-is
8. Consolidate root files
9. Update root README
10. Delete empty folders
11. Commit

---

*No information deleted. No architectural decisions changed. No ADR modified.*
