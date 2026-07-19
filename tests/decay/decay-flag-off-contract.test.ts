/**
 * PI-A non-regression contract (owner requirement, 2026-07-19):
 *
 *   With DECAY_SCORING_ENABLED=false, retrieval results (ordering,
 *   filtering, scoring) are IDENTICAL to the pre-PI-A baseline —
 *   even when decay data is already present in the database.
 *
 * The test captures retrieval outputs on a real (in-memory SQLite) schema,
 * then populates every decay artifact PI-A can produce (decay_score,
 * decay_signals, decay_computed_at, lifecycle_state) and asserts every
 * retrieval surface returns byte-identical results. If anyone later wires
 * decay into search SQL, retrieval candidates, or the ranker without gating
 * it behind the feature flag, this contract fails immediately.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { Ranker } from '../../src/memory/ranker.js';
import type { Memory } from '../../src/types/memory.js';

const OWNER = 'owner-contract';

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

describe('decay flag-off retrieval contract (PI-A non-regression)', () => {
  let repo: MemoryRepository;
  let corpus: Memory[];

  beforeAll(async () => {
    const db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);

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
          codename: `NOTE-${1000 + index}`,
          slug: `contract-mem-${index}`,
          favorite: index === 4,
          ownerId: OWNER,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: seed.updatedAt,
        }),
      );
    }
  });

  it('retrieval is identical before and after decay data lands in the database', async () => {
    const baseline = await captureRetrieval(repo);

    // Simulate a full decay stewardship pass having run: every decay artifact
    // populated, including "worst case" lifecycle demotions.
    const lifecycleByIndex = ['active', 'dormant', 'fading', 'dormant', 'active'];
    for (const [index, memory] of corpus.entries()) {
      await repo.applyDecayResult(memory.id, OWNER, {
        score: 0.01 + index * 0.01,
        signalsJson: JSON.stringify({ relevance: 0.01 }),
        computedAt: '2026-07-19T00:00:00.000Z',
        lifecycleState: lifecycleByIndex[index],
      });
    }

    const afterDecay = await captureRetrieval(repo);

    // The contract: ordering, filtering, and scoring are all unchanged.
    expect(afterDecay.searchIds).toEqual(baseline.searchIds);
    expect(afterDecay.listIds).toEqual(baseline.listIds);
    expect(afterDecay.retrievalCandidateIds).toEqual(baseline.retrievalCandidateIds);
    expect(afterDecay.rankedIds).toEqual(baseline.rankedIds);
    expect(afterDecay.rankedScores).toEqual(baseline.rankedScores);

    // Decay data must not flip archive flags or touch updated_at (which
    // would silently reshuffle recency-based ordering).
    expect(afterDecay.archivedFlags).toEqual(baseline.archivedFlags);
    expect(afterDecay.updatedAts).toEqual(baseline.updatedAts);
  });

  it('baseline is a meaningful corpus (guards against a vacuous contract)', async () => {
    const snapshot = await captureRetrieval(repo);
    expect(snapshot.searchIds.length).toBeGreaterThan(0);
    expect(snapshot.rankedIds.length).toBe(corpus.length);
    expect(snapshot.listIds.length).toBe(corpus.length);
  });
});
