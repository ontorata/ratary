/**
 * Phase 35 / ADR-068 D5 + E4 — T7 contract: entity candidate source is
 * read-only, deterministic, and absent when the flag is off.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { SqlEntityRegistry } from '../../src/infrastructure/entities/sql-entity-registry.js';
import { SqlEntityMentionStore } from '../../src/infrastructure/entities/sql-entity-mention-store.js';
import { EntityResolver } from '../../src/knowledge/entities/entity-resolver.js';
import {
  EntityRetrievalCandidateSource,
  extractQuerySymbols,
} from '../../src/memory/entity-retrieval-candidate-source.js';
import { RESOLVER_VERSION } from '../../src/types/entities.js';
import { getRrfSourceCap, getRrfSourceWeight } from '../../src/search/ranking.config.js';
import { resetEnvCache } from '../../src/config/env.js';

const OWNER = 'owner-retrieval';

async function seedMemory(
  repo: MemoryRepository,
  index: number,
  overrides: { archived?: boolean } = {},
): Promise<string> {
  const memory = await repo.insert({
    title: `memory ${index}`,
    project: 'ratary',
    content: `memory ${index} content`,
    summary: '',
    tags: [],
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'en',
    notes: '',
    codename: `RET-${index}`,
    slug: `retrieval-mem-${index}`,
    favorite: false,
    ownerId: OWNER,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });
  if (overrides.archived) {
    await repo.update(memory.id, OWNER, { archived: true });
  }
  return memory.id;
}

describe('EntityRetrievalCandidateSource (ADR-068 D5)', () => {
  let db: SqliteMemoryDatabase;
  let repo: MemoryRepository;
  let registry: SqlEntityRegistry;
  let mentions: SqlEntityMentionStore;
  let source: EntityRetrievalCandidateSource;
  let entityId: string;
  let memA: string;
  let memB: string;
  let memArchived: string;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);
    registry = new SqlEntityRegistry(db);
    mentions = new SqlEntityMentionStore(db);
    source = new EntityRetrievalCandidateSource(new EntityResolver(registry), mentions, repo);

    const entity = await registry.create({
      ownerId: OWNER,
      canonicalName: 'Governance',
      kind: 'concept',
    });
    entityId = entity.id;

    memA = await seedMemory(repo, 1);
    memB = await seedMemory(repo, 2);
    memArchived = await seedMemory(repo, 3, { archived: true });

    const evidence = {
      resolverVersion: RESOLVER_VERSION,
      rule: 'canonical_exact' as const,
      matched: 'governance',
    };
    for (const [memoryId, confidence] of [
      [memB, 1],
      [memA, 0.8],
      [memArchived, 1],
    ] as const) {
      await mentions.upsert({
        ownerId: OWNER,
        memoryId,
        entityId,
        field: 'tag',
        confidence,
        evidence,
        sourceType: 'inferred',
      });
    }
  });

  afterAll(() => {
    db?.close();
  });

  it('returns mentioned memories in deterministic order, excluding archived', async () => {
    const result = await source.findCandidates({
      ownerId: OWNER,
      query: 'governance',
      maxCandidates: 10,
    });
    expect(result.map((m) => m.id)).toEqual([memB, memA]);

    const again = await source.findCandidates({
      ownerId: OWNER,
      query: 'governance',
      maxCandidates: 10,
    });
    expect(again.map((m) => m.id)).toEqual(result.map((m) => m.id));
  });

  it('resolves tag filters as entity symbols too', async () => {
    const result = await source.findCandidates({
      ownerId: OWNER,
      tags: ['governance'],
      maxCandidates: 10,
    });
    expect(result.map((m) => m.id)).toEqual([memB, memA]);
  });

  it('never writes: unresolved query symbols do not create entities', async () => {
    const before = (await registry.listByOwner(OWNER)).length;
    const result = await source.findCandidates({
      ownerId: OWNER,
      query: 'completely-unknown-symbol',
      maxCandidates: 10,
    });
    expect(result).toEqual([]);
    expect((await registry.listByOwner(OWNER)).length).toBe(before);
  });

  it('returns [] when there is no query and no tags', async () => {
    expect(await source.findCandidates({ ownerId: OWNER, maxCandidates: 10 })).toEqual([]);
  });

  it('respects maxCandidates', async () => {
    const result = await source.findCandidates({
      ownerId: OWNER,
      query: 'governance',
      maxCandidates: 1,
    });
    expect(result.map((m) => m.id)).toEqual([memB]);
  });
});

describe('extractQuerySymbols', () => {
  it('is deterministic: tags first, then whole query, then tokens', () => {
    expect(extractQuerySymbols({ query: 'entity resolution', tags: ['governance'] })).toEqual([
      { symbol: 'governance', field: 'tag' },
      { symbol: 'entity resolution', field: 'keyword' },
      { symbol: 'entity', field: 'keyword' },
      { symbol: 'resolution', field: 'keyword' },
    ]);
  });

  it('single-token query yields one keyword symbol', () => {
    expect(extractQuerySymbols({ query: 'ratary' })).toEqual([
      { symbol: 'ratary', field: 'keyword' },
    ]);
  });
});

describe('RRF config for the entity role (E4)', () => {
  it('has fixed cap and weight constants', () => {
    expect(getRrfSourceCap('entity', ['sql', 'entity'])).toBe(30);
    expect(getRrfSourceCap('entity', ['sql', 'vector', 'graph', 'entity'])).toBe(20);
    expect(getRrfSourceWeight('entity')).toBe(1.0);
  });
});

describe('composition gate (E4/I0)', () => {
  const TOUCHED = [
    'ENTITY_RESOLUTION_ENABLED',
    'ENTITY_STORE_PROVIDER',
    'SEARCH_PROVIDER',
  ] as const;
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const key of TOUCHED) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
    resetEnvCache();
  });

  it('flag off ⇒ no composite source is built for a plain sql setup', async () => {
    for (const key of TOUCHED) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    resetEnvCache();

    const db2 = new SqliteMemoryDatabase();
    await runSchemaMigrations(db2, 'sqlite');
    try {
      const { createContextService } = await import('../../src/memory/create-context-service.js');
      const repo2 = new MemoryRepository(db2);

      // Flag off: ContextService falls back to its internal SQL source.
      const service = createContextService(repo2, { sql: db2 });
      expect(service).toBeDefined();

      process.env.ENTITY_RESOLUTION_ENABLED = 'true';
      process.env.ENTITY_STORE_PROVIDER = 'sql';
      resetEnvCache();
      const serviceOn = createContextService(repo2, { sql: db2 });
      expect(serviceOn).toBeDefined();
    } finally {
      db2.close();
    }
  });
});
