/**
 * PI-C (ADR-067) — WriteIntentCleanupTask contract (C5).
 *
 * TTL cleanup removes only the scoped owner's expired intents; fresh intents
 * are kept and dry-run never deletes.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { SqlWriteIntentStore } from '../../src/infrastructure/write-intents/sql-write-intent-store.js';
import { WriteIntentCleanupTask } from '../../src/memory/stewardship/tasks/write-intent-cleanup.task.js';

const OWNER = 'owner-cleanup';
const TTL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

describe('WriteIntentCleanupTask', () => {
  let db: SqliteMemoryDatabase;
  let store: SqlWriteIntentStore;
  let task: WriteIntentCleanupTask;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    store = new SqlWriteIntentStore(db);
    task = new WriteIntentCleanupTask(store, TTL_DAYS);
  });

  async function seedIntent(requestId: string, createdAt: string, owner = OWNER): Promise<void> {
    await db.execute(
      `INSERT INTO memory_write_intents
        (owner_id, request_id, operation, resource_type, resource_id, status, created_at)
       VALUES (?, ?, 'create', 'memory', ?, 'completed', ?)`,
      [owner, requestId, `mem-${requestId}`, createdAt],
    );
  }

  it('removes expired intents, keeps fresh ones, scoped to the owner', async () => {
    const now = new Date('2026-07-19T00:00:00.000Z');
    const expiredAt = new Date(now.getTime() - (TTL_DAYS + 1) * DAY_MS).toISOString();
    const freshAt = new Date(now.getTime() - 1 * DAY_MS).toISOString();

    await seedIntent('req-expired', expiredAt);
    await seedIntent('req-fresh', freshAt);
    await seedIntent('req-other-owner', expiredAt, 'other-owner');

    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: false, now });

    expect(result.status).toBe('ok');
    expect(result.changed).toBe(1);
    expect(await store.getByRequestId(OWNER, 'req-expired')).toBeNull();
    expect(await store.getByRequestId(OWNER, 'req-fresh')).not.toBeNull();
    expect(await store.getByRequestId('other-owner', 'req-other-owner')).not.toBeNull();
  });

  it('dry-run reports expired intents without deleting them', async () => {
    const now = new Date('2026-07-19T00:00:00.000Z');
    await seedIntent(
      'req-expired',
      new Date(now.getTime() - (TTL_DAYS + 5) * DAY_MS).toISOString(),
    );

    const result = await task.run({ scope: { ownerId: OWNER }, dryRun: true, now });

    expect(result.scanned).toBe(1);
    expect(result.changed).toBe(0);
    expect(await store.getByRequestId(OWNER, 'req-expired')).not.toBeNull();
  });
});
