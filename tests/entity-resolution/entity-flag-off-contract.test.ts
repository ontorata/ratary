/**
 * Phase 35 / ADR-068 D7 — invariant I0 (owner, 2026-07-20):
 *
 *   With ENTITY_RESOLUTION_ENABLED=false, retrieval output is byte-identical
 *   whether or not entity data exists in the database.
 *
 * Mirrors tests/decay/decay-flag-off-contract.test.ts: capture every
 * retrieval surface on a real (in-memory SQLite) schema, then populate all
 * three entity tables (entities, aliases, mentions) directly, and assert
 * byte-identical results. If anyone wires entity data into search SQL,
 * retrieval candidates, or the ranker without gating it behind the flag,
 * this contract fails immediately.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { Ranker } from '../../src/memory/ranker.js';
import { SqlEntityRegistry } from '../../src/infrastructure/entities/sql-entity-registry.js';
import { SqlEntityMentionStore } from '../../src/infrastructure/entities/sql-entity-mention-store.js';
import { RESOLVER_VERSION } from '../../src/types/entities.js';
import type { Memory } from '../../src/types/memory.js';

const OWNER = 'owner-entity-contract';

interface RetrievalSnapshot {
  searchIds: string[];
  listIds: string[];
  retrievalCandidateIds: string[];
  rankedIds: string[];
  rankedScores: number[];
  archivedFlags: Record<string, boolean>;
  updatedAts: Record<string, string>;
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
    archivedFlags: Object.fromEntries(all.map((m) => [m.id, m.archived])),
    updatedAts: Object.fromEntries(all.map((m) => [m.id, m.updatedAt])),
  };
}

describe('entity flag-off retrieval contract (I0 non-regression)', () => {
  let repo: MemoryRepository;
  let registry: SqlEntityRegistry;
  let mentions: SqlEntityMentionStore;
  let corpus: Memory[];

  beforeAll(async () => {
    const db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);
    registry = new SqlEntityRegistry(db);
    mentions = new SqlEntityMentionStore(db);

    const seeds = [
      { title: 'ingestion pipeline ADR', importance: 90, updatedAt: '2026-07-01T00:00:00.000Z' },
      { title: 'pipeline retry policy note', importance: 40, updatedAt: '2026-06-01T00:00:00.000Z' },
      { title: 'old pipeline draft', importance: 10, updatedAt: '2025-06-01T00:00:00.000Z' },
      { title: 'unrelated meeting notes', importance: 50, updatedAt: '2026-07-10T00:00:00.000Z' },
      { title: 'favorite pipeline runbook', importance: 60, updatedAt: '2026-05-01T00:00:00.000Z' },
    ];

    corpus = [];
    for (const [index, seed] of seeds.entries()) {
      corpus.push(
        await repo.insert({
          title: seed.title,
          project: 'ratary',
          content: `${seed.title} body content`,
          summary: '',
          tags: index === 4 ? ['runbook'] : [],
          keywords: [],
          category: '',
          memoryType: 'note',
          importance: seed.importance,
          language: 'en',
          notes: '',
          codename: `ENT-${1000 + index}`,
          slug: `entity-contract-mem-${index}`,
          favorite: index === 4,
          ownerId: OWNER,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: seed.updatedAt,
        }),
      );
    }
  });

  it('retrieval is identical before and after entity data lands in the database', async () => {
    const baseline = await captureRetrieval(repo);

    // Simulate a full entity-resolution stewardship pass having run:
    // entities for every codename + tag, aliases, and mention edges.
    for (const memory of corpus) {
      const entity = await registry.create({
        ownerId: OWNER,
        canonicalName: memory.codename ?? memory.title,
        kind: 'project',
      });
      await registry.addAlias(OWNER, entity.id, `${memory.codename}-alias`);
      await mentions.upsert({
        ownerId: OWNER,
        memoryId: memory.id,
        entityId: entity.id,
        field: 'codename',
        confidence: 1,
        evidence: {
          resolverVersion: RESOLVER_VERSION,
          rule: 'canonical_exact',
          matched: memory.codename ?? memory.title,
        },
        sourceType: 'inferred',
      });
    }
    const tagEntity = await registry.create({
      ownerId: OWNER,
      canonicalName: 'runbook',
      kind: 'concept',
    });
    await mentions.upsert({
      ownerId: OWNER,
      memoryId: corpus[4].id,
      entityId: tagEntity.id,
      field: 'tag',
      confidence: 1,
      evidence: { resolverVersion: RESOLVER_VERSION, rule: 'canonical_exact', matched: 'runbook' },
      sourceType: 'inferred',
    });

    const afterEntities = await captureRetrieval(repo);

    // The contract: ordering, filtering, and scoring are all unchanged.
    expect(afterEntities.searchIds).toEqual(baseline.searchIds);
    expect(afterEntities.listIds).toEqual(baseline.listIds);
    expect(afterEntities.retrievalCandidateIds).toEqual(baseline.retrievalCandidateIds);
    expect(afterEntities.rankedIds).toEqual(baseline.rankedIds);
    expect(afterEntities.rankedScores).toEqual(baseline.rankedScores);

    // Entity data must not flip archive flags or touch updated_at.
    expect(afterEntities.archivedFlags).toEqual(baseline.archivedFlags);
    expect(afterEntities.updatedAts).toEqual(baseline.updatedAts);
  });

  it('baseline is a meaningful corpus (guards against a vacuous contract)', async () => {
    const snapshot = await captureRetrieval(repo);
    expect(snapshot.searchIds.length).toBeGreaterThan(0);
    expect(snapshot.rankedIds.length).toBe(corpus.length);
    expect(snapshot.listIds.length).toBe(corpus.length);

    // And the entity tables are genuinely populated (non-vacuous on the entity side too).
    expect((await registry.listByOwner(OWNER)).length).toBeGreaterThan(0);
    expect(await mentions.countByOwner(OWNER)).toBeGreaterThan(0);
  });
});
