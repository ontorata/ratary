/**
 * Phase 35 / ADR-068 D2 — T4 contract: SQL adapters are idempotent,
 * owner-isolated (ADR-012), and honor invariant I1 (id never re-keys).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { SqlEntityRegistry } from '../../src/infrastructure/entities/sql-entity-registry.js';
import { SqlEntityMentionStore } from '../../src/infrastructure/entities/sql-entity-mention-store.js';
import { RESOLVER_VERSION } from '../../src/types/entities.js';

const OWNER_A = 'owner-a';
const OWNER_B = 'owner-b';

describe('sql entity adapters (ADR-068 D2)', () => {
  let db: SqliteMemoryDatabase;
  let registry: SqlEntityRegistry;
  let mentions: SqlEntityMentionStore;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    registry = new SqlEntityRegistry(db);
    mentions = new SqlEntityMentionStore(db);
  });

  afterAll(() => {
    db?.close();
  });

  it('create is idempotent on (owner, normalized name, kind)', async () => {
    const first = await registry.create({
      ownerId: OWNER_A,
      canonicalName: 'AI-Brain',
      kind: 'project',
    });
    const second = await registry.create({
      ownerId: OWNER_A,
      canonicalName: 'ai_brain',
      kind: 'project',
    });
    expect(second.id).toBe(first.id);
    expect(first.normalizedName).toBe('ai brain');
  });

  it('alias resolves back to its entity and is idempotent per owner', async () => {
    const entity = await registry.create({
      ownerId: OWNER_A,
      canonicalName: 'Ratary',
      kind: 'project',
    });
    const alias1 = await registry.addAlias(OWNER_A, entity.id, 'The-Brain');
    const alias2 = await registry.addAlias(OWNER_A, entity.id, 'the brain');
    expect(alias2.id).toBe(alias1.id);

    const found = await registry.findByNormalizedAlias(OWNER_A, 'the brain');
    expect(found?.id).toBe(entity.id);
  });

  it('I1: updateMetadata renames without re-keying; mentions stay valid', async () => {
    const entity = await registry.create({
      ownerId: OWNER_A,
      canonicalName: 'Ontorata Studio',
      kind: 'component',
    });
    await mentions.upsert({
      ownerId: OWNER_A,
      memoryId: 'mem-1',
      entityId: entity.id,
      field: 'codename',
      confidence: 1,
      evidence: { resolverVersion: RESOLVER_VERSION, rule: 'canonical_exact', matched: 'Ontorata Studio' },
      sourceType: 'inferred',
    });

    const renamed = await registry.updateMetadata(OWNER_A, entity.id, {
      canonicalName: 'Studio',
      confidence: 0.9,
    });
    expect(renamed.id).toBe(entity.id);
    expect(renamed.canonicalName).toBe('Studio');
    expect(renamed.normalizedName).toBe('studio');
    expect(renamed.confidence).toBe(0.9);

    const stillLinked = await mentions.findByMemoryId(OWNER_A, 'mem-1');
    expect(stillLinked).toHaveLength(1);
    expect(stillLinked[0].entityId).toBe(entity.id);
  });

  it('owner isolation: owner B never sees owner A entities or aliases (ADR-012)', async () => {
    const entityA = await registry.create({
      ownerId: OWNER_A,
      canonicalName: 'Secret Project',
      kind: 'project',
    });
    await registry.addAlias(OWNER_A, entityA.id, 'skunkworks');

    expect(await registry.findById(OWNER_B, entityA.id)).toBeNull();
    expect(await registry.findByNormalizedName(OWNER_B, 'secret project', 'project')).toBeNull();
    expect(await registry.findByNormalizedAlias(OWNER_B, 'skunkworks')).toBeNull();
    expect(await registry.listByOwner(OWNER_B)).toEqual([]);
    expect(await mentions.findByEntityIds(OWNER_B, [entityA.id])).toEqual([]);
  });

  it('mention upsert is idempotent and reads are deterministically ordered', async () => {
    const e1 = await registry.create({ ownerId: OWNER_A, canonicalName: 'Alpha', kind: 'concept' });
    const evidence = {
      resolverVersion: RESOLVER_VERSION,
      rule: 'canonical_exact' as const,
      matched: 'Alpha',
    };

    const base = {
      ownerId: OWNER_A,
      entityId: e1.id,
      field: 'tag' as const,
      sourceType: 'inferred',
      evidence,
    };
    expect(await mentions.upsert({ ...base, memoryId: 'mem-z', confidence: 0.8 })).toBe(true);
    expect(await mentions.upsert({ ...base, memoryId: 'mem-z', confidence: 0.8 })).toBe(false);
    expect(await mentions.upsert({ ...base, memoryId: 'mem-a', confidence: 0.8 })).toBe(true);
    expect(await mentions.upsert({ ...base, memoryId: 'mem-m', confidence: 1 })).toBe(true);

    const ordered = await mentions.findByEntityIds(OWNER_A, [e1.id]);
    expect(ordered.map((m) => m.memoryId)).toEqual(['mem-m', 'mem-a', 'mem-z']);
    expect(ordered[0].evidence).toEqual(evidence);

    const again = await mentions.findByEntityIds(OWNER_A, [e1.id]);
    expect(again).toEqual(ordered);
  });
});
