# Blueprint: knowledge-ingestion-p1-b

| Field | Value |
|-------|-------|
| **Status** | Approved — execute unlocked |
| **Branch** | `forge/knowledge-ingestion` |
| **Intent** | [knowledge-ingestion-p1-b-intent.md](./knowledge-ingestion-p1-b-intent.md) |
| **Isolate** | [knowledge-ingestion-p1-b-isolate.md](./knowledge-ingestion-p1-b-isolate.md) |
| **Baseline** | `org-memory-p1-a-complete` @ `f52b0be` |
| **Evidence package** | `.ai/reviews/org-memory-dogfood/` |

---

## Execution progress

- [x] Task 1 — Formalize P1-B contract and gate package
- [x] Task 2 — Add ADR for ingestion pipeline decision
- [x] Task 3 — Implement lifecycle and contract scaffolding
- [ ] Task 4 — Implement idempotency, deduplication, and retry controls
- [ ] Task 5 — Expand ingestion metrics for P1-B quality
- [ ] Task 6 — Refresh acceptance artifacts and non-regression guard
- [ ] Task 7 — Prepare P1-B release-ready governance trail

---

## Problem statement

P1-A proved recall and evidence chain closure. P1-B must prove ingestion quality and control at pipeline level: deterministic lifecycle, idempotency, deduplication, metadata integrity, and organization isolation.

Key P1-A limitation:
- ingestion execution exists, but stage-level contracts and failure/retry semantics are not explicit enough for scale-safe evolution.

---

## Objectives

1. Define stage-by-stage ingestion architecture with clear invariants.
2. Establish durable contracts for document, chunk, embedding, version, and evidence trace.
3. Enforce deterministic and resumable ingestion behavior.
4. Produce reproducible metrics and acceptance evidence for G1-G6.

---

## Scope

### In scope
- Ingestion pipeline contracts and stage transitions.
- Idempotency, deduplication, retry, and resumability rules.
- Ingestion-focused metrics and acceptance evidence updates.
- Governance and CI guard synchronization for P1-B.

### Out of scope
- Retrieval ranking redesign (P1-C).
- AI workspace UX features (P1-D).
- Knowledge graph/orchestration expansion.
- Marketplace/public API feature extensions unrelated to ingestion quality.

---

## Architecture (target for P1-B)

```text
Knowledge Source
    ->
Normalizer
    ->
Chunk Builder
    ->
Embedding Generator
    ->
Knowledge Store
    ->
Index Update
```

---

## Pipeline stages

| Stage | Input | Output | Invariants | Failure mode | Retry strategy |
|------|-------|--------|------------|--------------|----------------|
| Source intake | source descriptors + file pointers | canonical raw payload | source path + org scope are present | source not found / read error | max 2 retries, exponential backoff |
| Normalizer | raw payload | `KnowledgeDocument` | stable `documentId`, normalized metadata, deterministic digest | parse/validation error | fail-fast for invalid schema; retry for transient read |
| Chunk Builder | `KnowledgeDocument` | `KnowledgeChunk[]` | deterministic chunk key per version | chunk split failure | retry once if transient tokenizer/runtime fault |
| Embedding Generator | `KnowledgeChunk[]` | `EmbeddingRecord[]` | embedding linked to chunk/version/org | provider or timeout failure | max 2 retries with backoff |
| Knowledge Store | document/chunk/embedding records | persisted versioned records | transactional consistency for persisted unit | storage write failure | resumable replay from last persisted stage |
| Index Update | persisted records | searchable index entries | index points only to committed records | index sync failure | replayable index update job |

---

## Contracts (initial)

### `KnowledgeDocument`
- **Required:** `documentId`, `organizationId`, `sourceType`, `sourceRef`, `title`, `content`, `contentDigest`, `version`, `ingestedAt`
- **Optional:** `workspaceId`, `tags`, `author`, `language`, `lastModifiedAt`, `metadata`

### `KnowledgeChunk`
- **Required:** `chunkId`, `documentId`, `organizationId`, `version`, `sequence`, `text`, `textDigest`
- **Optional:** `tokenCount`, `section`, `metadata`

### `EmbeddingJob`
- **Required:** `jobId`, `organizationId`, `documentId`, `chunkIds`, `model`, `requestedAt`, `attempt`
- **Optional:** `provider`, `workspaceId`, `traceId`

### `EmbeddingRecord`
- **Required:** `embeddingId`, `chunkId`, `organizationId`, `version`, `model`, `vectorDigest`, `createdAt`
- **Optional:** `dimensions`, `providerLatencyMs`, `metadata`

### `KnowledgeVersion`
- **Required:** `versionId`, `documentId`, `organizationId`, `contentDigest`, `status`, `createdAt`
- **Optional:** `previousVersionId`, `changeReason`, `supersededAt`

---

## Idempotency rules

1. Duplicate upload with identical digest -> no new version; log as duplicate.
2. Duplicate chunk for same `documentId+version+sequence` -> skip and increment duplicate counter.
3. Replay ingestion for completed version -> replay-safe, no duplicate persistent writes.
4. Interrupted ingestion -> resumable from last persisted state.
5. Retry after crash -> same input must converge to same persisted result set.

---

## Transaction boundary

```text
persist document metadata
    -> (atomic boundary A)
chunking + chunk persist
    -> (atomic boundary B per document version)
embedding generation + embedding persist
    -> (resumable/replayable boundary C)
index update
    -> (replayable boundary D)
```

- **Atomic:** boundary A and B.
- **Resumable:** boundary C.
- **Replayable:** boundary C and D.

---

## Error strategy

| Error class | Behavior | Evidence expectation |
|-------------|----------|----------------------|
| Validation error | fail-fast, mark invalid document | invalid counter + source reference |
| Parsing error | fail-fast unless transient source read | failed counter + parser reason |
| Embedding failure | retry with bounded backoff | retry_count + final status |
| Storage failure | retry if transient, else halt stage | persistent error with checkpoint info |
| Index failure | queue replayable index job | index failure log + replay result |

---

## Testing plan

### Unit
- normalizer deterministic digest behavior
- chunk key determinism and duplicate detection
- retry policy/backoff limiter

### Integration
- end-to-end ingest run from source to persisted records
- resumable ingestion after forced interruption
- index replay on simulated failure

### Acceptance
- G1 pipeline execution deterministic
- G2 organization isolation enforced
- G3 metadata/version integrity complete
- G4 evidence chain complete
- G5 metrics reproducibility
- G6 governance + regression green

### Regression
- `npm test`
- `npm run ci:org-memory-acceptance`
- `npm run ci:governance`

---

## Task breakdown

## Task 1 — Formalize P1-B contract and gate package
- **Files:** `.ai/designs/drafts/knowledge-ingestion-p1-b-intent.md`, `.ai/designs/drafts/knowledge-ingestion-p1-b-plan.md`, `.ai/designs/drafts/knowledge-ingestion-p1-b-isolate.md`
- **Do:** lock blueprint scope, stage contracts, idempotency rules, and acceptance mappings.
- **Verify:** `rg "Idempotency|Acceptance Gates|KnowledgeDocument|Transaction boundary" .ai/designs/drafts/knowledge-ingestion-p1-b-*.md`
- **Done when:** blueprint is self-sufficient and implementation-ready without architecture ambiguity.

## Task 2 — Add ADR for ingestion pipeline decision
- **Files:** `.ai/core/architecture/ADR-0005-knowledge-ingestion-pipeline.md`, `.ai/core/architecture/README.md`
- **Do:** record architecture decision, alternatives, and long-term consequences for staged/resumable ingestion.
- **Verify:** `npm run ci:adr-impact`
- **Done when:** ADR exists and architecture registry references it.

## Task 3 — Implement lifecycle and contract scaffolding
- **Files:** `scripts/lib/org-memory-sync.ts`, `scripts/sync-org-memory.ts`, `scripts/forge/remember-org-memory.ts`
- **Do:** encode stage transitions, canonical IDs, and resumable checkpoints per contract.
- **Verify:** `npm run sync:org-memory && npm run trace:org-memory-handoff -- --ratary-codename P1B-T3 --notes "p1-b task3"`
- **Done when:** ingestion run emits stage-aware evidence with stable identifiers.

## Task 4 — Implement idempotency, deduplication, and retry controls
- **Files:** `scripts/lib/org-memory-sync.ts`, `.ai/reviews/org-memory-dogfood/ingestion-log.md`
- **Do:** enforce duplicate handling, bounded retry, and crash-safe replay semantics.
- **Verify:** `npm run sync:org-memory`
- **Done when:** repeated runs on unchanged input do not create inconsistent duplicates.

## Task 5 — Expand ingestion metrics for P1-B quality
- **Files:** `scripts/metrics/org-memory-usage.ts`, `.ai/reviews/org-memory-dogfood/internal-usage-metrics.md`
- **Do:** add ingestion quality metrics (`ingestion_coverage_pct`, `deduplication_ratio`, `normalization_success_rate`, `ingest_to_recall_ready_latency_ms`).
- **Verify:** `npm run metrics:org-memory`
- **Done when:** official metrics command outputs complete P1-B metric schema.

## Task 6 — Refresh acceptance artifacts and non-regression guard
- **Files:** `.ai/reviews/org-memory-dogfood/acceptance-test.md`, `.ai/reviews/org-memory-dogfood/P1-A-QUALITY-SUMMARY.md`, `.ai/reviews/org-memory-dogfood/P1-A-ACCEPTANCE.md`, `scripts/ci/org-memory-acceptance-check.mjs`
- **Do:** evolve acceptance evidence mapping for ingestion-focused gates while preserving P1-A closeout integrity.
- **Verify:** `npm run ci:org-memory-acceptance && npm run ci:governance`
- **Done when:** gate evidence remains reproducible and CI checks are green.

## Task 7 — Prepare P1-B release-ready governance trail
- **Files:** `.ai/governance/releases/P1-A-ORG-MEMORY-DOGFOOD.md`, `.ai/governance/releases/README.md`, `.ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md`, `.ai/sessions/CURRENT.md`
- **Do:** maintain release and session traces aligned with P1-B progress milestones.
- **Verify:** `rg "P1-B|Knowledge Ingestion|forge/knowledge-ingestion" .ai/governance/releases/*.md .ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md .ai/sessions/CURRENT.md`
- **Done when:** governance trail can explain P1-B state without implicit context.

---

## Dependencies

- Task 1 before all implementation tasks.
- Task 2 before Task 3 (architecture decision first).
- Task 3 before Task 4 and Task 5.
- Task 4 and Task 5 before Task 6.
- Task 6 before Task 7 closeout trail update.

## Parallelizable groups

- **Group A (parallel):** Task 2 and Task 7 (documentation-only updates).
- **Group B (parallel):** Task 4 and Task 5 after Task 3.
- **Sequential gate:** Task 6 after Group B complete.

---

## Exit criteria (blueprint stage)

- [x] Problem, objectives, and scope are explicit.
- [x] Stage contracts and transaction boundaries are defined.
- [x] Error/retry/idempotency behavior is defined.
- [x] Test strategy is defined per test level.
- [x] Task list includes exact file paths and verification commands.
- [x] ADR task is included for architecture decision traceability.

Owner approval required before `forge-execute`.
