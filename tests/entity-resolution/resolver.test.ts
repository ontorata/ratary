/**
 * Phase 35 / ADR-068 D3 + E2 — T5 contract: resolver is deterministic,
 * auto-creates from codename/tag only, and stamps I2 evidence everywhere.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { SqlEntityRegistry } from '../../src/infrastructure/entities/sql-entity-registry.js';
import { EntityResolver } from '../../src/knowledge/entities/entity-resolver.js';
import { extractSymbols } from '../../src/knowledge/entities/extract-symbols.js';
import { RESOLVER_VERSION } from '../../src/types/entities.js';
import { createEntityResolutionPorts } from '../../src/composition/create-entity-resolution-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/env.js';

const OWNER = 'owner-resolver';

describe('EntityResolver (ADR-068 D3/E2)', () => {
  let db: SqliteMemoryDatabase;
  let registry: SqlEntityRegistry;
  let resolver: EntityResolver;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    registry = new SqlEntityRegistry(db);
    resolver = new EntityResolver(registry);
  });

  afterAll(() => {
    db?.close();
  });

  it('resolve() never creates entities, for any field', async () => {
    const results = await resolver.resolve(OWNER, [
      { symbol: 'brand-new-codename', field: 'codename' },
      { symbol: 'brand-new-tag', field: 'tag' },
      { symbol: 'brand-new-keyword', field: 'keyword' },
    ]);
    expect(results.every((r) => !r.resolved)).toBe(true);
    expect(await registry.listByOwner(OWNER)).toEqual([]);
  });

  it('resolveWithAutoCreate creates from codename + tag only (E2); keyword never creates', async () => {
    const results = await resolver.resolveWithAutoCreate(OWNER, [
      { symbol: 'Ratary-Core', field: 'codename' },
      { symbol: 'governance', field: 'tag' },
      { symbol: 'entity-resolution', field: 'keyword' },
    ]);

    const [codename, tag, keyword] = results;
    expect(codename.resolved).toBe(true);
    expect(tag.resolved).toBe(true);
    expect(keyword.resolved).toBe(false);

    const entities = await registry.listByOwner(OWNER);
    expect(entities).toHaveLength(2);
    const byName = Object.fromEntries(entities.map((e) => [e.normalizedName, e]));
    expect(byName['ratary core'].kind).toBe('project');
    expect(byName['ratary core'].sourceType).toBe('inferred');
    expect(byName['governance'].kind).toBe('concept');
  });

  it('stamps I2 evidence (resolverVersion, rule, matched) on every resolved symbol', async () => {
    const [result] = await resolver.resolve(OWNER, [{ symbol: 'ratary_core', field: 'keyword' }]);
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.evidence).toEqual({
        resolverVersion: RESOLVER_VERSION,
        rule: 'canonical_exact',
        matched: 'ratary_core',
      });
    }
  });

  it('resolves via alias with alias_exact evidence', async () => {
    const entity = await registry.findByNormalizedName(OWNER, 'ratary core', 'project');
    expect(entity).not.toBeNull();
    await registry.addAlias(OWNER, entity!.id, 'The Core');

    const [result] = await resolver.resolve(OWNER, [{ symbol: 'the-core', field: 'tag' }]);
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.entity.id).toBe(entity!.id);
      expect(result.evidence.rule).toBe('alias_exact');
    }
  });

  it('re-running resolveWithAutoCreate is idempotent (no duplicate entities)', async () => {
    const symbols = [
      { symbol: 'Ratary-Core', field: 'codename' as const },
      { symbol: 'governance', field: 'tag' as const },
    ];
    const first = await resolver.resolveWithAutoCreate(OWNER, symbols);
    const countAfterFirst = (await registry.listByOwner(OWNER)).length;
    const second = await resolver.resolveWithAutoCreate(OWNER, symbols);
    expect((await registry.listByOwner(OWNER)).length).toBe(countAfterFirst);
    expect(second).toEqual(first);
  });
});

describe('extractSymbols (E6 — structured fields only)', () => {
  it('extracts codename, tags, keywords in deterministic order with dedupe', () => {
    const symbols = extractSymbols({
      codename: 'Ratary-Core',
      tags: ['governance', 'ratary-core', 'governance'],
      keywords: ['Governance', 'entity resolution', '  '],
    });
    expect(symbols).toEqual([
      { symbol: 'Ratary-Core', field: 'codename' },
      { symbol: 'governance', field: 'tag' },
      { symbol: 'ratary-core', field: 'tag' },
      { symbol: 'Governance', field: 'keyword' },
      { symbol: 'entity resolution', field: 'keyword' },
    ]);
  });

  it('handles null codename and empty arrays', () => {
    expect(extractSymbols({ codename: null, tags: [], keywords: [] })).toEqual([]);
  });
});

describe('createEntityResolutionPorts (flag gate)', () => {
  const TOUCHED = ['ENTITY_RESOLUTION_ENABLED', 'ENTITY_STORE_PROVIDER'] as const;
  const saved: Record<string, string | undefined> = {};

  it('returns disabled when flag off, enabled ports when on + sql', async () => {
    for (const key of TOUCHED) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    resetEnvCache();

    const db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    try {
      expect(createEntityResolutionPorts(db, getEnv()).enabled).toBe(false);

      process.env.ENTITY_RESOLUTION_ENABLED = 'true';
      process.env.ENTITY_STORE_PROVIDER = 'sql';
      resetEnvCache();
      const ports = createEntityResolutionPorts(db, getEnv());
      expect(ports.enabled).toBe(true);
      if (ports.enabled) {
        expect(ports.resolver).toBeInstanceOf(EntityResolver);
      }
    } finally {
      db.close();
      for (const key of TOUCHED) {
        if (saved[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = saved[key];
        }
      }
      resetEnvCache();
    }
  });
});
