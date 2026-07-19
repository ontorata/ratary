/**
 * PI-C (ADR-067) — sync_push create idempotency (C4).
 *
 * A re-pushed create batch (client retry after an ambiguous failure) must
 * replay the original creates instead of duplicating: exactly one memory per
 * client memoryId, all pushes reported as accepted.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { createMemoryService } from '../../src/services/create-memory-service.js';
import { ClientSyncService, DefaultClientPlatformRegistry } from '../../src/client-sync/index.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { SqlSyncCursorStore } from '../../src/infrastructure/client-sync/sql-sync-cursor-store.js';
import type { PushChangeItem } from '../../src/client-sync/client-sync.types.js';

const OWNER = 'owner-sync-replay';
const SCOPE = { ownerId: OWNER };
const PLATFORM = 'claude';

function createBatch(): PushChangeItem[] {
  return [
    {
      memoryId: 'client-mem-1',
      operation: 'create',
      data: { title: 'Sync memory one', content: 'Body one', project: 'pi-c' },
    },
    {
      memoryId: 'client-mem-2',
      operation: 'create',
      data: { title: 'Sync memory two', content: 'Body two', project: 'pi-c' },
    },
  ];
}

describe('sync_push create idempotency (PI-C)', () => {
  let db: SqliteMemoryDatabase;
  let sync: ClientSyncService;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    const memoryService = createMemoryService(db);
    sync = new ClientSyncService(
      new MemoryRepository(db),
      memoryService,
      new SqlSyncCursorStore(db),
      new DefaultClientPlatformRegistry(),
      'lww',
    );
  });

  async function countMemories(): Promise<number> {
    const rows = await db.query<{ n: number }>(
      'SELECT COUNT(*) as n FROM memories WHERE owner_id = ?',
      [OWNER],
    );
    return rows[0]?.n ?? 0;
  }

  it('the same create batch pushed twice creates each memory exactly once', async () => {
    const first = await sync.push(SCOPE, PLATFORM, createBatch());
    expect(first.accepted).toBe(2);
    expect(first.rejected).toBe(0);
    expect(await countMemories()).toBe(2);

    const second = await sync.push(SCOPE, PLATFORM, createBatch());
    // Replays are SUCCESS (C3): accepted, no conflicts, no new rows.
    expect(second.accepted).toBe(2);
    expect(second.rejected).toBe(0);
    expect(second.conflicts).toEqual([]);
    expect(await countMemories()).toBe(2);
  });

  it('distinct client memoryIds keep creating distinct memories', async () => {
    await sync.push(SCOPE, PLATFORM, createBatch());
    await sync.push(SCOPE, PLATFORM, [
      {
        memoryId: 'client-mem-3',
        operation: 'create',
        data: { title: 'Sync memory three', content: 'Body three', project: 'pi-c' },
      },
    ]);
    expect(await countMemories()).toBe(3);
  });
});
