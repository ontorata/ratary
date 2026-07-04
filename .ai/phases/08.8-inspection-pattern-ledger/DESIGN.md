# Phase 8.8 — Inspection Pattern Ledger — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented (2026-07-05) · ADR-059 Implemented  
**ADR gate:** [ADR-059](../../adr/059-inspection-pattern-ledger.md) — **Accepted**  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) · extends [08.5](../08.5-observation-reflection-learning/DESIGN.md) · [08.6](../08.6-learning-intelligence/DESIGN.md) · [07.1](../07.1-agent-forge/DESIGN.md)

---

## Purpose

Build a **repository- and workspace-scoped ledger** of inspection patterns learned only from **acted-upon** outcomes (fixes merged, inspect PASS after blocker, explicit confirmed signals). Patterns **inform** future inspections and MCP recall; they do **not** auto-block or auto-comment without concrete diff evidence.

Distinct from generic handoff notes (`save_memory`) and from ranking-only signal adaptation (Phase 8.5).

---

## Architecture

```
External observers: Forge Inspect · CI · MCP submit_signal · REST (optional)
        │
        ▼
ISignalNormalizer → MemoryQualitySignal (signalType: inspection_outcome)
        │
        ▼
IMemorySignalIngestor (Phase 8.5 — append-only, scoped)
        │
        ▼
LearningEventRecorder (Phase 8.6 — when both flags ON)
        │
        ▼
Batch: IInspectionPatternMiner (L23) + IFeedbackLearningEngine (L27)
        │
        ▼
IInspectionPatternStore (side-store) ──► Memory records (type: architecture | task)
        │                                      metadata: confidence, scope, protected
        ▼
Recall: search_memory + retrieval policy ──► Forge Inspect checklist hints
        │
        ▼ (optional, gated)
Federation: Charter Pattern promotion (org scope)
```

**Hot path:** append signals only. **No** pattern extraction on CRUD. **No** LLM on ingest path.

---

## Core concepts (original vocabulary)

| Term | Meaning |
|------|---------|
| **Inspection Pattern** | Deterministic rule describing a recurring problem class + trigger scope (paths, modules, ADR tags) |
| **Ledger entry** | Stored pattern with `confidence`, `evidenceCount`, `lastConfirmedAt`, `patternScope` |
| **Acted-upon** | Outcome marked `resolved: true` with inspect PASS or land/merge evidence |
| **Charter Pattern** | Org-level pattern promoted after independent confirmation in N workspaces (Federation) |
| **Protected** | Human-edited or pinned — exempt from automated decay |

---

## Signal contract

Extend Phase 8.5 with new signal type:

```typescript
signalType: 'inspection_outcome'
payload: {
  kind: 'inspection_outcome';
  source: 'forge_inspect' | 'ci' | 'mcp' | 'rest';
  taskId?: string;
  severity: 'constitutional' | 'critical' | 'major';
  category: 'boundary' | 'adr' | 'testing' | 'security' | 'phase_gate';
  resolved: boolean;
  diffScope?: { paths?: string[]; modules?: string[]; adrIds?: string[] };
  patternHint?: string; // optional human label — not auto-trusted until confirmed by miner
}
```

**Learning rule:** only events with `resolved: true` and severity ≥ `major` feed the miner. Ignored or `minor`-only outcomes are excluded.

---

## Extraction policy (inclusion / exclusion)

| **Extract to ledger** | **Exclude** |
|----------------------|-------------|
| Constitution / layer boundary violations | Formatting, naming taste |
| Missing tests for behavior changes | Subjective style comments |
| ADR or phase gate misses | One-off `minor` without recurrence |
| Security-relevant gaps (deterministic rules) | LLM chain-of-thought |

Miner output is **deterministic** (rule aggregation over events) in v1 — no LLM summarization in `src/`.

---

## Ports (planned)

| Port | Responsibility | Phase 8.6 track |
|------|----------------|-----------------|
| `IInspectionPatternStore` | CRUD side-store + link to memory rows | — |
| `IInspectionPatternMiner` | Event batch → candidate patterns | L23 (`IPatternMiner` specialization) |
| `IInspectionConfidencePolicy` | Pure confidence + decay math | L27 (`IFeedbackLearningEngine` hook) |
| `ICharterPatternPromoter` | Cross-workspace promotion policy | Federation 14 |
| `IInspectionRecallSource` | Rank patterns for diff scope | Consumes search + snapshot |

Implementations live under `src/learning/inspection/` (planned) — not in agent runtime.

---

## Consumption (Forge + MCP)

| Consumer | Behavior |
|----------|----------|
| **forge-inspect** Pass 1 | Retrieve relevant ledger entries; emit prioritized checklist — **blockers still from spec/constitution only** |
| **forge-recall** | `search_memory` tags `inspection-pattern`, project scope |
| **forge-remember** | May emit `inspection_outcome` signal when owner confirms pattern |
| **External agents** | MCP `submit_signal` + `search_memory` — no new runtime in `src/` |

Patterns surface only when **concrete evidence** matches `diffScope` triggers — never speculative flags.

---

## Confidence lifecycle

| State | Condition |
|-------|-----------|
| **active** | confidence ≥ threshold; recent confirmation |
| **aging** | no confirmation within configured window — confidence decays |
| **low** | below surface threshold — recall deprioritized |
| **archived** | auto-archived after decay floor (recoverable) |
| **protected** | owner edit or pin — no auto decay/archive |

Contradictions: graph relation `contradicts` between ledger entries (Phase 8 graph); stewardship task surfaces conflicts — neither entry silently wins.

---

## MemoryService impact

**None** on default CRUD signatures. Ledger may **create** memory rows (`memoryType: architecture`) via orchestrator when enabled — same boundary as learning jobs (not hot path).

---

## Boundaries

- No PR review bot in this repo — consumption is workflow + MCP only
- No agent planner / executor / autonomous loop
- No storage of review chain-of-thought
- Federation Charter promotion **opt-in** and policy-gated (cross-org fail closed)
- v1 miner is deterministic; ML hook deferred to L29 external boundary

---

## Non-goals

- SaaS dashboard for pattern management (deferred — MCP + REST list sufficient for v1)
- Auto-merge or auto-fix from patterns
- Style lint duplication (CI already owns formatting)
- Replacing `forge-inspect` constitutional blockers

---

## Success criteria

- [x] ADR-059 Accepted
- [x] `INSPECTION_LEDGER_ENABLED=false` → zero regression (default env)
- [x] `inspection_outcome` signal ingested when 8.5 ON — ✅
- [x] Miner produces ledger entries from resolved major+ events — ✅
- [x] Forge Inspect documents recall hook — ✅
- [x] Confidence decay + protected flag behavior tested — ✅
- [x] Contradiction relation detectable — ✅
- [x] Charter promotion behind Federation flag — ✅

---

## Deferred

| ID | Item |
|----|------|
| D88-01 | REST admin UI for ledger CRUD |
| D88-02 | CI webhook adapter (GitHub/GitLab) |
| D88-03 | Semantic similarity for pattern clustering (embeddings) |
| D88-04 | ML-assisted pattern generalization (L29 external) |

---

## Future phase interactions

| Phase | Interaction |
|-------|-------------|
| **8.5** ✅ | Signal ingest port |
| **8.6** ✅ | Event store + L23/L27 engines |
| **7.1** ✅ | Forge pipeline consumers |
| **9.6** ⏳ | Lifecycle metadata alignment |
| **14** ✅ | Charter Pattern exchange (optional) |
| **12** ⏳ | Event bus fan-out for inspection outcomes |

See [DELIVERY-TRACK.md](DELIVERY-TRACK.md).
