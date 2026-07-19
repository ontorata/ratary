/**
 * PI-C (ADR-067) — SqlWriteIntentStore unit contract.
 *
 * The (owner_id, request_id) PRIMARY KEY is the synchronization point:
 * claim() must be a bare INSERT whose key violation resolves to the
 * previously stored mapping (owner decision C7 — no exists() pre-check).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { SqlWriteIntentStore } from '../../src/infrastructure/write-intents/sql-write-intent-store.js';

const OWNER = 'owner-intents';

describe('SqlWriteIntentStore', () => {
  let store: SqlWriteIntentStore;

  beforeEach(async () => {
    const db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    store = new SqlWriteIntentStore(db);
  });

  it('first claim wins and stores the canonical resource id', async () => {
    const result = await store.claim({
      ownerId: OWNER,
      requestId: 'req-1',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-abc',
    });
    expect(result).toEqual({ claimed: true });

    const stored = await store.getByRequestId(OWNER, 'req-1');
    expect(stored?.resourceId).toBe('mem-abc');
    expect(stored?.status).toBe('claimed');
  });

  it('second claim with the same key returns the ORIGINAL mapping, never a new one', async () => {
    await store.claim({
      ownerId: OWNER,
      requestId: 'req-1',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-original',
    });

    const second = await store.claim({
      ownerId: OWNER,
      requestId: 'req-1',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-would-be-new',
    });

    expect(second.claimed).toBe(false);
    if (!second.claimed) {
      expect(second.existing.resourceId).toBe('mem-original');
    }
  });

  it('same request id under a different owner is an independent claim', async () => {
    await store.claim({
      ownerId: OWNER,
      requestId: 'req-1',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-a',
    });
    const other = await store.claim({
      ownerId: 'other-owner',
      requestId: 'req-1',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-b',
    });
    expect(other).toEqual({ claimed: true });
  });

  it('markCompleted flips status without touching the mapping', async () => {
    await store.claim({
      ownerId: OWNER,
      requestId: 'req-1',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-abc',
    });
    await store.markCompleted(OWNER, 'req-1');

    const stored = await store.getByRequestId(OWNER, 'req-1');
    expect(stored?.status).toBe('completed');
    expect(stored?.resourceId).toBe('mem-abc');
  });

  it('deleteExpired removes only rows older than the cutoff', async () => {
    await store.claim({
      ownerId: OWNER,
      requestId: 'req-fresh',
      operation: 'create',
      resourceType: 'memory',
      resourceId: 'mem-1',
    });
    // Cutoff in the past keeps the fresh row.
    const removedNone = await store.deleteExpired(new Date(Date.now() - 60_000).toISOString());
    expect(removedNone).toBe(0);
    expect(await store.getByRequestId(OWNER, 'req-fresh')).not.toBeNull();

    // Cutoff in the future removes it.
    const removed = await store.deleteExpired(new Date(Date.now() + 60_000).toISOString());
    expect(removed).toBe(1);
    expect(await store.getByRequestId(OWNER, 'req-fresh')).toBeNull();
  });
});
