/**
 * PI-C (ADR-067) — WriteIntentCleanupTask contract (C5 + owner review, 2026-07-19).
 *
 * TTL cleanup removes only the scoped owner's expired COMPLETED intents;
 * expired CLAIMED intents are resolved individually — deleted only when their
 * canonical memory exists (lost status flip), KEPT when the memory is missing
 * (true orphan). Fresh intents are always kept; dry-run never deletes.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { SqlWriteIntentStore } from '../../src/infrastructure/write-intents/sql-write-intent-store.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { WriteIntentCleanupTask } from '../../src/memory/stewardship/tasks/write-intent-cleanup.task.js';

const OWNER = 'owner-cleanup';
const TTL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-07-19T00:00:00.000Z');
const EXPIRED_AT = new Date(NOW.getTime() - (TTL_DAYS + 1) * DAY_MS).toISOString();
const FRESH_AT = new Date(NOW.getTime() - 1 * DAY_MS).toISOString();

describe('WriteIntentCleanupTask', () => {
  let db: SqliteMemoryDatabase;
  let store: SqlWriteIntentStore;
  let repo: MemoryRepository;
  let task: WriteIntentCleanupTask;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    store = new SqlWriteIntentStore(db);
    repo = new MemoryRepository(db);
    task = new WriteIntentCleanupTask(store, repo, TTL_DAYS);
  });

  async function seedIntent(
    requestId: string,
    createdAt: string,
    opts: { owner?: string; status?: 'claimed' | 'completed'; resourceId?: string } = {},
  ): Promise<void> {
    await db.execute(
      `INSERT INTO memory_write_intents
        (owner_id, request_id, operation, resource_type, resource_id, status, created_at)
       VALUES (?, ?, 'create', 'memory', ?, ?, ?)`,
      [
        opts.owner ?? OWNER,
        requestId,
        opts.resourceId ?? `mem-${requestId}`,
        opts.status ?? 'completed',
        createdAt,
      ],
    );
  }

  it('removes expired COMPLETED intents, keeps fresh ones, scoped to the owner', async () => {
    await seedIntent('req-expired', EXPIRED_AT);
    await seedIntent('req-fresh', FRESH_AT);
    await seedIntent('req-other-owner', EXPIRED_AT, { owner: 'other-owner' });

    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: false, now: NOW });

    expect(result.status).toBe('ok');
    expect(result.changed).toBe(1);
    expect(await store.getByRequestId(OWNER, 'req-expired')).toBeNull();
    expect(await store.getByRequestId(OWNER, 'req-fresh')).not.toBeNull();
    expect(await store.getByRequestId('other-owner', 'req-other-owner')).not.toBeNull();
  });

  it('never deletes an expired CLAIMED intent whose memory is missing (true orphan — kept)', async () => {
    await seedIntent('req-orphan', EXPIRED_AT, { status: 'claimed' });

    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: false, now: NOW });

    expect(result.changed).toBe(0);
    expect(await store.getByRequestId(OWNER, 'req-orphan')).not.toBeNull();
    expect(result.findings.join(' ')).toContain('orphaned — kept: 1');
  });

  it('deletes an expired CLAIMED intent only when its canonical memory exists (lost status flip)', async () => {
    const memory = await repo.insert({
      title: 'resolved claim',
      project: 'pi-c',
      content: 'body',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 10,
      language: 'en',
      notes: '',
      codename: 'NOTE-9100',
      slug: 'resolved-claim',
      favorite: false,
      ownerId: OWNER,
    });
    await seedIntent('req-resolved', EXPIRED_AT, { status: 'claimed', resourceId: memory.id });

    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: false, now: NOW });

    expect(result.changed).toBe(1);
    expect(await store.getByRequestId(OWNER, 'req-resolved')).toBeNull();
  });

  it('dry-run reports expired intents without deleting them', async () => {
    await seedIntent('req-expired', EXPIRED_AT);
    await seedIntent('req-claimed', EXPIRED_AT, { status: 'claimed' });

    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: true, now: NOW });

    expect(result.scanned).toBe(2);
    expect(result.changed).toBe(0);
    expect(await store.getByRequestId(OWNER, 'req-expired')).not.toBeNull();
    expect(await store.getByRequestId(OWNER, 'req-claimed')).not.toBeNull();
  });
});
