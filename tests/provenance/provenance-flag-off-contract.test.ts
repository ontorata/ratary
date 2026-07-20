/**
 * Phase 36 / ADR-069 — I0 flag-off byte-parity + I1/I2 invariant suite.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { Ranker } from '../../src/memory/ranker.js';
import { PROVENANCE_VERSION } from '../../src/types/provenance.js';
import type { Memory } from '../../src/types/memory.js';

const OWNER = 'owner-prov-contract';

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

describe('provenance flag-off retrieval contract (I0)', () => {
  let db: SqliteMemoryDatabase;
  let repo: MemoryRepository;
  let relations: MemoryRelationRepository;
  let corpus: Memory[];

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);
    relations = new MemoryRelationRepository(db);

    const seeds = [
      { title: 'ingestion pipeline ADR', importance: 90, updatedAt: '2026-07-01T00:00:00.000Z' },
      { title: 'pipeline retry policy note', importance: 40, updatedAt: '2026-06-01T00:00:00.000Z' },
      { title: 'old pipeline draft', importance: 10, updatedAt: '2025-06-01T00:00:00.000Z' },
    ];

    corpus = [];
    for (const [index, seed] of seeds.entries()) {
      corpus.push(
        await repo.insert({
          title: seed.title,
          project: 'ratary',
          content: `${seed.title} body content`,
          summary: '',
          tags: [],
          keywords: [],
          category: '',
          memoryType: 'note',
          importance: seed.importance,
          language: 'en',
          notes: '',
          codename: `PROV-${1000 + index}`,
          slug: `prov-contract-mem-${index}`,
          favorite: false,
          ownerId: OWNER,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: seed.updatedAt,
        }),
      );
    }
  });

  afterAll(() => {
    db?.close();
  });

  it('retrieval is identical before and after provenance-typed relations exist', async () => {
    const baseline = await captureRetrieval(repo);

    await relations.insert({
      sourceMemoryId: corpus[0]!.id,
      targetMemoryId: corpus[1]!.id,
      relation: 'caused_by',
      ownerId: OWNER,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });
    await relations.insert({
      sourceMemoryId: corpus[0]!.id,
      targetMemoryId: corpus[2]!.id,
      relation: 'supersedes',
      ownerId: OWNER,
      metadata: {
        provenanceVersion: PROVENANCE_VERSION,
        rule: 'authored',
        conflictKind: 'temporal',
      },
    });

    const after = await captureRetrieval(repo);
    expect(after).toEqual(baseline);
  });
});

describe('provenance invariants I1/I2', () => {
  let db: SqliteMemoryDatabase;
  let memories: MemoryRepository;
  let relations: MemoryRelationRepository;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    memories = new MemoryRepository(db);
    relations = new MemoryRelationRepository(db);

    for (const id of ['d-old', 'd-new', 'constraint']) {
      await memories.insert({
        id,
        title: id,
        project: 'ratary',
        content: `${id} body`,
        summary: '',
        tags: [],
        keywords: [],
        category: '',
        memoryType: 'note',
        importance: 50,
        language: 'en',
        notes: '',
        codename: id,
        slug: `inv-${id}`,
        favorite: false,
        ownerId: OWNER,
      });
    }
  });

  afterAll(() => {
    db?.close();
  });

  it('I1: supersedes appends without removing prior edge', async () => {
    const prior = await relations.insert({
      sourceMemoryId: 'd-old',
      targetMemoryId: 'constraint',
      relation: 'motivated_by',
      ownerId: OWNER,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });
    const supersedes = await relations.insert({
      sourceMemoryId: 'd-new',
      targetMemoryId: 'd-old',
      relation: 'supersedes',
      ownerId: OWNER,
      metadata: {
        provenanceVersion: PROVENANCE_VERSION,
        rule: 'authored',
        conflictKind: 'mutually_exclusive',
      },
    });
    expect(await relations.findById(prior.id, OWNER)).not.toBeNull();
    expect(await relations.findById(supersedes.id, OWNER)).not.toBeNull();
  });

  it('I2: every provenance row carries provenanceVersion + rule (+ conflictKind on supersedes)', async () => {
    const rows = await db.query<{ relation: string; metadata: string }>(
      `SELECT relation, metadata FROM memory_relations
       WHERE owner_id = ? AND relation IN ('motivated_by','caused_by','resulted_in','supersedes')`,
      [OWNER],
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const meta = JSON.parse(row.metadata) as Record<string, unknown>;
      expect(typeof meta.provenanceVersion).toBe('string');
      expect(typeof meta.rule).toBe('string');
      if (row.relation === 'supersedes') {
        expect(typeof meta.conflictKind).toBe('string');
      }
    }
  });
});
