---
name: forge-intent
description: >-
  Crystallize design before code: Socratic refinement, sectioned design doc,
  owner validation. Use for new features, ambiguous requests, or structural changes.
---
# Forge Intent

**Activates:** before writing code for non-trivial work.

## Process

1. Ask clarifying questions — one focused batch at a time
2. Explore 2+ alternatives with tradeoffs (align with ADR policy if structural)
3. Present design in **sections** (≤200 words each); wait for approval per section
4. Check constitution: [.ai/core/architecture/04-ARCHITECTURE.md](../../.ai/core/architecture/04-ARCHITECTURE.md)
5. Write approved design to `.ai/designs/drafts/{slug}.md`

## Design doc template

```markdown
# {Title}
**Status:** Draft — pending approval
**Slug:** {slug}

## Problem
## Constraints (constitution / ADR)
## Decision
## Alternatives considered
## Impact (layers, ports, tests)
## Open questions
```

## Prompt cross-ref

Deep dive: `.ai/workflow/prompts/architecture/system-design-brief.md`

## Stop conditions

- Structural change without ADR path → halt, draft ADR or escalate
- Owner rejects a section → revise before Isolate stage
