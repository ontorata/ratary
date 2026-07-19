/**
 * Phase 35 / ADR-068 — owner invariants I1 and I2 (locked 2026-07-20):
 *
 *   I1 — Entity identity immutability: `canonical_entities.id` is permanent;
 *        corrections change metadata only and never re-key mentions.
 *   I2 — Versioned resolution evidence: every persisted mention's evidence
 *        carries `resolverVersion`, `rule`, and `matched`.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { SqlEntityRegistry } from '../../src/infrastructure/entities/sql-entity-registry.js';
import { SqlEntityMentionStore } from '../../src/infrastructure/entities/sql-entity-mention-store.js';
import { EntityResolver } from '../../src/knowledge/entities/entity-resolver.js';
import { EntityResolutionTask } from '../../src/memory/stewardship/tasks/entity-resolution.task.js';
import {
  ENTITY_RESOLUTION_RULES,
  RESOLVER_VERSION,
  entityResolutionEvidenceSchema,
} from '../../src/types/entities.js';

const OWNER = 'owner-invariants';

describe('ADR-068 invariants I1 + I2', () => {
  let db: SqliteMemoryDatabase;
  let repo: MemoryRepository;
  let registry: SqlEntityRegistry;
  let mentions: SqlEntityMentionStore;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);
    registry = new SqlEntityRegistry(db);
    mentions = new SqlEntityMentionStore(db);

    await repo.insert({
      title: 'invariant seed memory',
      project: 'ratary',
      content: 'seed content',
      summary: '',
      tags: ['symbol-grounding'],
      keywords: ['canonical entity'],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'en',
      notes: '',
      codename: 'INV-0001',
      slug: 'invariant-seed',
      favorite: false,
      ownerId: OWNER,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const task = new EntityResolutionTask(repo, {
      enabled: true,
      registry,
      resolver: new EntityResolver(registry),
      mentionStore: mentions,
    });
    await task.run({ scope: { ownerId: OWNER }, dryRun: false, now: new Date() });
  });

  afterAll(() => {
    db?.close();
  });

  it('I1: metadata corrections (rename, confidence, alias) never change the entity id', async () => {
    const entity = await registry.findByNormalizedName(OWNER, 'inv 0001', 'project');
    expect(entity).not.toBeNull();
    const originalId = entity!.id;
    const mentionsBefore = await mentions.findByEntityIds(OWNER, [originalId]);
    expect(mentionsBefore.length).toBeGreaterThan(0);

    const renamed = await registry.updateMetadata(OWNER, originalId, {
      canonicalName: 'Invariant Project One',
      confidence: 0.75,
    });
    await registry.addAlias(OWNER, originalId, 'INV-0001');

    expect(renamed.id).toBe(originalId);
    expect(renamed.canonicalName).toBe('Invariant Project One');
    expect(renamed.confidence).toBe(0.75);

    // Every mention still points at the same permanent id.
    const mentionsAfter = await mentions.findByEntityIds(OWNER, [originalId]);
    expect(mentionsAfter.map((m) => m.id).sort()).toEqual(
      mentionsBefore.map((m) => m.id).sort(),
    );

    // The old surface form still resolves — now via the alias path.
    const resolver = new EntityResolver(registry);
    const [resolution] = await resolver.resolve(OWNER, [
      { symbol: 'INV-0001', field: 'codename' },
    ]);
    expect(resolution.resolved).toBe(true);
    if (resolution.resolved) {
      expect(resolution.entity.id).toBe(originalId);
    }
  });

  it('I2: every persisted mention carries resolverVersion + rule + matched in evidence', async () => {
    const all = await mentions.findByMemoryId(
      OWNER,
      (await repo.findAllByOwner(OWNER))[0].id,
    );
    expect(all.length).toBeGreaterThan(0);

    for (const mention of all) {
      const parsed = entityResolutionEvidenceSchema.safeParse(mention.evidence);
      expect(parsed.success).toBe(true);
      expect(mention.evidence.resolverVersion).toBe(RESOLVER_VERSION);
      expect(ENTITY_RESOLUTION_RULES).toContain(mention.evidence.rule);
      expect(mention.evidence.matched.length).toBeGreaterThan(0);
    }
  });
});
