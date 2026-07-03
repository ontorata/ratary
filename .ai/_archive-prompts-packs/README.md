# AI Brain — Prompt Packs

**Purpose:** Simplified, role-based prompt packs for AI-assisted development.  
**Structure:** Organized by role and workflow stage.  
**Version:** 1.0.0

---

## Quick Start

Pilih role Anda:

| Role | When |
|------|------|
| [roles/architect.md](roles/architect.md) | System design, architecture decisions |
| [roles/backend.md](roles/backend.md) | Feature implementation |
| [roles/reviewer.md](roles/reviewer.md) | Code and design review |
| [roles/tester.md](roles/tester.md) | Test design and verification |
| [roles/devops.md](roles/devops.md) | Deployment and operations |

---

## Workflow Stages

```
Session Start
      │
      ▼
Development Phase
      │
      ▼
    ┌─────────────────────────────────────────────┐
    │                                             │
    ▼                                             ▼
Code/Design                                  Testing
    │                                             │
    ▼                                             ▼
Review ───────────────────────────────────▶ Testing
    │                                             │
    └───────────▶ Pass? ◀────────────────────────┘
                  │
                  │ No
                  ▼
              Fix & Retry
                  │
                  │ Yes
                  ▼
              Release
```

---

## Folder Structure

```
prompts-packs/
├── system/
│   ├── constitution.md      # Core rules
│   ├── architecture.md       # Layer patterns
│   ├── glossary.md           # Terminology
│   └── ai-decision-framework.md  # Decision rules
│
├── roles/
│   ├── architect.md          # Architecture role
│   ├── backend.md           # Implementation role
│   ├── reviewer.md          # Review role
│   ├── tester.md            # Testing role
│   └── devops.md            # Operations role
│
├── phases/
│   ├── phase-01.md          # Foundation
│   ├── phase-02.md          # Knowledge
│   ├── phase-03.md          # Authorization
│   ├── phase-04.md          # Intelligence
│   ├── phase-05.md          # Embedding
│   ├── phase-06.md          # Hybrid Retrieval
│   ├── phase-07.md          # Agent Runtime
│   ├── phase-08.md          # Knowledge Graph
│   ├── phase-09.md          # Multi-AI
│   └── phase-10.md          # Enterprise
│
└── workflows/
    ├── development.md        # Development workflow
    ├── review.md             # Review workflow
    ├── testing.md            # Testing workflow
    ├── refactor.md           # Refactoring workflow
    ├── migration.md          # Migration workflow
    ├── phase-check.md         # Phase completion check
    ├── release.md            # Release workflow
    └── documentation.md      # Documentation workflow
```

---

## Usage

### 1. Start Session

```
Baca: system/constitution.md
Baca: system/architecture.md
Baca: roles/{role Anda}.md
```

### 2. Before Any Work

```
Jalankan: workflows/development.md
Jawab checklist:
✓ Layer mana yang berubah
✓ Apakah melanggar Constitution
✓ Apakah melanggar ADR
✓ Apakah backward compatible
✓ Apakah future compatible
```

### 3. During Development

```
 Ikuti: roles/{role Anda}.md
 Patuhi: system/constitution.md
```

### 4. Before Commit

```
Jalankan: workflows/review.md
Jalankan: workflows/testing.md
```

---

## Phase-Specific

Setiap phase memiliki checklist di `phases/phase-{NN}.md`

| Phase | Focus |
|-------|-------|
| 1 | Foundation |
| 2 | Knowledge |
| 3 | Authorization |
| 4 | Intelligence |
| 5 | Embedding |
| 6 | Hybrid Retrieval |
| 7 | Agent Runtime |
| 8 | Knowledge Graph |
| 9 | Multi-AI |
| 10 | Enterprise |

---

## Rules

1. Baca constitution SEBELUM做任何工作
2. Jangan melanggar boundary yang sudah ditetapkan
3. Jangan implement agent logic di dalam repository
4. Semua perubahan harus melalui layer yang benar
5. Test harus PASS sebelum commit

---

*Portable across AI tools: Cursor, Claude, Codex, Gemini, OpenHands*
