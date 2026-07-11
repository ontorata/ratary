# Wave 5 — End-to-End Proof

- generated_at=2026-07-08T07:08:56.980Z
- execution_id=e31672af-deca-4382-8700-cea08df3fdde

## 1) Golden Path Scenario

- stage_source_intake=completed
- stage_normalizer=completed
- stage_chunk_builder=completed
- stage_embedding_generator=completed
- stage_knowledge_store=completed
- stage_index_update=completed
- knowledge_id=doc-d66623514aec1d81
- version_id=kv-34b8acb2dbb424b1
- index_event_id=idx-796f7ad81c0a8a84
- final_status=completed

## 2) Failure Injection Proof

### Case A — Embedding failure
- embedding_stage=failed
- store_stage=skipped
- index_stage=skipped
- expected=embedding FAILED, store/index not advanced

### Case B — Store success, index failure
- embedding_stage=completed
- store_stage=completed
- index_stage=failed
- recovery_queue=kv-a31d28298159ee59
- expected=store AVAILABLE, index FAILED with recovery queue

### Case C — Replay same input
- replay_a_versions=1
- replay_b_versions=1
- replay_a_embeddings=1
- replay_b_embeddings=1
- duplicate_prevented=1

## 3) MCP / Context Consumer Proof

- allowed_org_context_count=1
- blocked_org_context_count=0
- allowed_embedding_count=1
- blocked_embedding_count=0
- cancelled_job_reference=job-2dff57d2b85f2a0c

## 4) Invariant Checklist

- [x] Full ingestion lifecycle executes as one chain
- [x] Recovery scenario documented
- [x] Replay scenario documented
- [x] Traceability IDs included
- [x] MCP consumer boundary validated
- [x] No retrieval optimization introduced

## Known Limitations

- Vector database implementation is not part of Wave 5 scope.
- Retrieval ranking/search optimization remains deferred.
- Consumer proof validates context boundary, not retrieval quality scoring.
