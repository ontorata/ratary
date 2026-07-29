/**
 * Phase 38 / ADR-070 — I0: CODE_MEMORY_ENABLED=false must not change memory retrieval.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { Ranker } from '../../src/memory/ranker.js';
import {
  SqlCodeEdgeStore,
  SqlCodeNodeStore,
} from '../../src/knowledge/code-memory/sql-code-memory-store.js';
import { CODE_INDEXER_VERSION } from '../../src/types/code-memory.js';
import { stableCodeId } from '../../src/knowledge/code-memory/stable-code-id.js';
import { createCodeMemoryService } from '../../src/services/code-memory.service.js';

const OWNER = 'owner-code-memory-i0';

interface RetrievalSnapshot {
  searchIds: string[];
  listIds: string[];
  retrievalCandidateIds: string[];
  rankedIds: string[];
  rankedScores: number[];
}

async function captureRetrieval(repo: MemoryRepository): Promise<RetrievalSnapshot> {
  const search = await repo.search({ ownerId: OWNER, query: 'pipeline', limit: 20, offset: 0 });
  const list = await repo.findAll({ ownerId: OWNER, limit: 20, offset: 0 });
  const retrieval = await repo.findRetrievalCandidates({ ownerId: OWNER, maxCandidates: 20 });
  const all = await repo.findAllByOwner(OWNER);
  const ranked = new Ranker().rank(all, { q: 'pipeline' }, 20);
  return {
    searchIds: search.memories.map((m) => m.id),
    listIds: list.memories.map((m) => m.id),
    retrievalCandidateIds: retrieval.map((m) => m.id),
    rankedIds: ranked.map((m) => m.id),
    rankedScores: ranked.map((m) => m.relevanceScore),
  };
}

describe('code memory flag-off retrieval contract (I0)', () => {
  let repo: MemoryRepository;
  let db: SqliteMemoryDatabase;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);

    await repo.insert({
      title: 'ingestion pipeline ADR',
      project: 'ratary',
      content: 'pipeline body',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'en',
      notes: '',
      codename: 'CM-I0',
      slug: 'code-memory-i0',
      favorite: false,
      ownerId: OWNER,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    });
  });

  it('retrieval is identical after code_* rows exist while service flag is off', async () => {
    const baseline = await captureRetrieval(repo);

    const nodes = new SqlCodeNodeStore(db);
    const edges = new SqlCodeEdgeStore(db);
    const now = new Date().toISOString();
    const repoKey = 'repo:fixture/demo';
    const fileKey = 'file:fixture/demo:src/a.ts';
    const repoId = stableCodeId(OWNER, repoKey);
    const fileId = stableCodeId(OWNER, fileKey);
    await nodes.upsertNode({
      id: repoId,
      ownerId: OWNER,
      kind: 'repository',
      repoId: null,
      stableKey: repoKey,
      displayName: 'fixture/demo',
      language: null,
      sourceRange: null,
      contentHash: null,
      indexerVersion: CODE_INDEXER_VERSION,
      indexedAt: now,
    });
    await nodes.upsertNode({
      id: fileId,
      ownerId: OWNER,
      kind: 'file',
      repoId,
      stableKey: fileKey,
      displayName: 'src/a.ts',
      language: 'typescript',
      sourceRange: { path: 'src/a.ts', startLine: 1, endLine: 10 },
      contentHash: 'abc',
      indexerVersion: CODE_INDEXER_VERSION,
      indexedAt: now,
    });
    await edges.upsertEdge({
      id: stableCodeId(OWNER, `edge:DECLARES:${repoId}:${fileId}`),
      ownerId: OWNER,
      type: 'DECLARES',
      fromId: repoId,
      toId: fileId,
      evidence: { indexerVersion: CODE_INDEXER_VERSION, rule: 'test', repoCommit: null },
      createdAt: now,
    });

    const disabled = createCodeMemoryService({ enabled: false });
    const traverse = await disabled.traverse(OWNER, { stableKey: repoKey, depth: 2 });
    expect(traverse.enabled).toBe(false);
    expect(traverse.nodeIds).toEqual([]);

    const after = await captureRetrieval(repo);
    expect(after).toEqual(baseline);
  });
});
