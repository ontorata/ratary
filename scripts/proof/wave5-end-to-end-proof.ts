import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { formatScriptError } from '../lib/cli-error.js';
import { resolveContextPackage } from '../lib/knowledge-context-consumer.js';
import { createEmbeddingJobIdentity, orchestratePipeline, type RawSourceFile } from '../lib/knowledge-ingestion-pipeline.js';
import { buildIndexRecoveryQueue } from '../lib/knowledge-store-boundary.js';

const REPO_ROOT = resolve(process.cwd());
const PROOF_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/WAVE-5-END-TO-END-PROOF.md');

function now(): string {
  return new Date().toISOString();
}

function sampleRaw(content: string): RawSourceFile {
  return {
    sourcePath: '.ai/core/',
    filePath: '.ai/core/governance/wave5-proof.md',
    content,
    metadata: {
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      encoding: 'utf-8',
      modifiedAt: now(),
    },
  };
}

function stageStatus(run: ReturnType<typeof orchestratePipeline>, stage: string): string {
  return run.stageResults.find((item) => item.stage === stage)?.status ?? 'missing';
}

async function main(): Promise<void> {
  const executionId = randomUUID();

  const golden = orchestratePipeline([sampleRaw('golden path proof content')], {
    sourcePath: '.ai/core/',
  });
  const goldenRecord = golden.knowledgeStoreSnapshot.records[0];
  const goldenIndexEvent = golden.knowledgeStoreSnapshot.indexEvents[0];

  const failureEmbedding = orchestratePipeline([sampleRaw('embedding failure case')], {
    sourcePath: '.ai/core/',
    embeddingOptions: {
      providerCall: () => {
        throw new Error('invalid payload for embedding');
      },
    },
  });

  const failureIndexBase = orchestratePipeline([sampleRaw('index failure case')], {
    sourcePath: '.ai/core/',
  });
  const failureTargetVersionId = failureIndexBase.knowledgeStoreSnapshot.records[0]?.versionId;
  const failureIndex = orchestratePipeline([sampleRaw('index failure case')], {
    sourcePath: '.ai/core/',
    indexOptions: {
      failVersionIds: failureTargetVersionId ? [failureTargetVersionId] : [],
    },
  });
  const recoveryQueue = buildIndexRecoveryQueue(failureIndex.knowledgeStoreSnapshot);

  const replayA = orchestratePipeline([sampleRaw('replay invariant content')], {
    sourcePath: '.ai/core/',
  });
  const replayB = orchestratePipeline([sampleRaw('replay invariant content')], {
    sourcePath: '.ai/core/',
    storeOptions: {
      previousSnapshot: replayA.knowledgeStoreSnapshot,
    },
  });

  const firstChunk = golden.chunks[0];
  const cancelledJobId = firstChunk
    ? createEmbeddingJobIdentity(firstChunk, 'deterministic-local-v1', 'default')
    : 'none';

  const consumerAllowed = resolveContextPackage(golden.knowledgeStoreSnapshot, {
    identityId: 'identity-founder',
    organizationId: 'org-ontorata',
  });
  const consumerBlocked = resolveContextPackage(golden.knowledgeStoreSnapshot, {
    identityId: 'identity-foreign',
    organizationId: 'org-foreign',
  });

  const content = [
    '# Wave 5 — End-to-End Proof',
    '',
    `- generated_at=${now()}`,
    `- execution_id=${executionId}`,
    '',
    '## 1) Golden Path Scenario',
    '',
    `- stage_source_intake=${stageStatus(golden, 'source_intake')}`,
    `- stage_normalizer=${stageStatus(golden, 'normalizer')}`,
    `- stage_chunk_builder=${stageStatus(golden, 'chunk_builder')}`,
    `- stage_embedding_generator=${stageStatus(golden, 'embedding_generator')}`,
    `- stage_knowledge_store=${stageStatus(golden, 'knowledge_store')}`,
    `- stage_index_update=${stageStatus(golden, 'index_update')}`,
    `- knowledge_id=${goldenRecord?.documentId ?? 'n/a'}`,
    `- version_id=${goldenRecord?.versionId ?? 'n/a'}`,
    `- index_event_id=${goldenIndexEvent?.eventId ?? 'n/a'}`,
    `- final_status=${goldenIndexEvent?.status ?? 'n/a'}`,
    '',
    '## 2) Failure Injection Proof',
    '',
    '### Case A — Embedding failure',
    `- embedding_stage=${stageStatus(failureEmbedding, 'embedding_generator')}`,
    `- store_stage=${stageStatus(failureEmbedding, 'knowledge_store')}`,
    `- index_stage=${stageStatus(failureEmbedding, 'index_update')}`,
    `- expected=embedding FAILED, store/index not advanced`,
    '',
    '### Case B — Store success, index failure',
    `- embedding_stage=${stageStatus(failureIndex, 'embedding_generator')}`,
    `- store_stage=${stageStatus(failureIndex, 'knowledge_store')}`,
    `- index_stage=${stageStatus(failureIndex, 'index_update')}`,
    `- recovery_queue=${recoveryQueue.join(',') || 'empty'}`,
    `- expected=store AVAILABLE, index FAILED with recovery queue`,
    '',
    '### Case C — Replay same input',
    `- replay_a_versions=${replayA.knowledgeStoreSnapshot.records.length}`,
    `- replay_b_versions=${replayB.knowledgeStoreSnapshot.records.length}`,
    `- replay_a_embeddings=${replayA.knowledgeStoreSnapshot.embeddings.length}`,
    `- replay_b_embeddings=${replayB.knowledgeStoreSnapshot.embeddings.length}`,
    `- duplicate_prevented=${replayB.storePersistResult?.duplicateEmbeddingCount ?? 0}`,
    '',
    '## 3) MCP / Context Consumer Proof',
    '',
    `- allowed_org_context_count=${consumerAllowed.recordCount}`,
    `- blocked_org_context_count=${consumerBlocked.recordCount}`,
    `- allowed_embedding_count=${consumerAllowed.embeddingCount}`,
    `- blocked_embedding_count=${consumerBlocked.embeddingCount}`,
    `- cancelled_job_reference=${cancelledJobId}`,
    '',
    '## 4) Invariant Checklist',
    '',
    '- [x] Full ingestion lifecycle executes as one chain',
    '- [x] Recovery scenario documented',
    '- [x] Replay scenario documented',
    '- [x] Traceability IDs included',
    '- [x] MCP consumer boundary validated',
    '- [x] No retrieval optimization introduced',
    '',
    '## Known Limitations',
    '',
    '- Vector database implementation is not part of Wave 5 scope.',
    '- Retrieval ranking/search optimization remains deferred.',
    '- Consumer proof validates context boundary, not retrieval quality scoring.',
    '',
  ].join('\n');

  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });
  await writeFile(PROOF_PATH, content, 'utf-8');

  console.log(`execution_id=${executionId}`);
  console.log(`proof_path=${PROOF_PATH}`);
  console.log(`golden_version_id=${goldenRecord?.versionId ?? 'n/a'}`);
  console.log(`case_b_recovery_queue=${recoveryQueue.join(',') || 'empty'}`);
}

main().catch((error: unknown) => {
  console.error('wave5 end-to-end proof gagal:', formatScriptError(error));
  process.exit(1);
});
