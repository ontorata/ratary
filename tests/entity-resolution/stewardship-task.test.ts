/**
 * Phase 35 / ADR-068 D4 — T6 contract: stewardship stage honors flag-off
 * skip, dry-run non-mutation, execute idempotency (GraphRepairTask conventions).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { SqlEntityRegistry } from '../../src/infrastructure/entities/sql-entity-registry.js';
import { SqlEntityMentionStore } from '../../src/infrastructure/entities/sql-entity-mention-store.js';
import { EntityResolver } from '../../src/knowledge/entities/entity-resolver.js';
import { EntityResolutionTask } from '../../src/memory/stewardship/tasks/entity-resolution.task.js';
import { STEWARDSHIP_STAGE_ORDER } from '../../src/memory/stewardship/stewardship.types.js';

const OWNER = 'owner-stewardship';

describe('EntityResolutionTask (ADR-068 D4)', () => {
  let db: SqliteMemoryDatabase;
  let repo: MemoryRepository;
  let registry: SqlEntityRegistry;
  let mentions: SqlEntityMentionStore;
  let enabledTask: EntityResolutionTask;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);
    registry = new SqlEntityRegistry(db);
    mentions = new SqlEntityMentionStore(db);
    enabledTask = new EntityResolutionTask(repo, {
      enabled: true,
      registry,
      resolver: new EntityResolver(registry),
      mentionStore: mentions,
    });

    await repo.insert({
      title: 'ADR study memory',
      project: 'ratary',
      content: 'entity resolution design',
      summary: '',
      tags: ['governance'],
      keywords: ['symbol grounding'],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'en',
      notes: '',
      codename: 'Ratary-Core',
      slug: 'adr-study-memory',
      favorite: false,
      ownerId: OWNER,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  afterAll(() => {
    db?.close();
  });

  it('entity-resolution precedes provenance-candidates in the stage order', () => {
    expect(STEWARDSHIP_STAGE_ORDER).toContain('entity-resolution');
    expect(STEWARDSHIP_STAGE_ORDER[STEWARDSHIP_STAGE_ORDER.length - 1]).toBe(
      'provenance-candidates',
    );
    expect(STEWARDSHIP_STAGE_ORDER.indexOf('entity-resolution')).toBeLessThan(
      STEWARDSHIP_STAGE_ORDER.indexOf('provenance-candidates'),
    );
  });

  it('flag off ⇒ skipped with the conventional finding', async () => {
    const task = new EntityResolutionTask(repo, { enabled: false });
    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: false, now: new Date() });
    expect(result.status).toBe('skipped');
    expect(result.changed).toBe(0);
    expect(result.findings).toEqual(['ENTITY_RESOLUTION_ENABLED=false — entity resolution skipped']);
  });

  it('dry-run resolves but mutates nothing (changed 0, no entities, no mentions)', async () => {
    const result = await enabledTask.run({
      scope: { ownerId: OWNER },
      dryRun: true,
      now: new Date(),
    });
    expect(result.status).toBe('ok');
    expect(result.scanned).toBe(1);
    expect(result.changed).toBe(0);
    expect(result.findings[1]).toContain('would auto-create (codename/tag): 2');

    expect(await registry.listByOwner(OWNER)).toEqual([]);
    expect(await mentions.countByOwner(OWNER)).toBe(0);
  });

  it('execute creates entities per E2 and upserts mentions with evidence', async () => {
    const result = await enabledTask.run({
      scope: { ownerId: OWNER },
      dryRun: false,
      now: new Date(),
    });
    expect(result.status).toBe('ok');
    expect(result.changed).toBe(2); // codename + tag mentions; keyword stays unresolved

    const entities = await registry.listByOwner(OWNER);
    expect(entities.map((e) => e.normalizedName).sort()).toEqual(['governance', 'ratary core']);
    expect(await mentions.countByOwner(OWNER)).toBe(2);
  });

  it('re-run is idempotent: zero new changes', async () => {
    const rerun = await enabledTask.run({
      scope: { ownerId: OWNER },
      dryRun: false,
      now: new Date(),
    });
    expect(rerun.changed).toBe(0);
    expect(await mentions.countByOwner(OWNER)).toBe(2);
    expect((await registry.listByOwner(OWNER)).length).toBe(2);
  });
});
