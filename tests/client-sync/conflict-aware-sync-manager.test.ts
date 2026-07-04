import { describe, it, expect } from 'vitest';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import type { AuditLogInput } from '../../src/auth/audit.repository.js';
import { AuditRepository } from '../../src/auth/audit.repository.js';
import { SyncStaleDetector } from '../../src/sync/sync-stale-detector.js';
import { ConflictAwareSyncManager } from '../../src/client-sync/conflict-aware-sync-manager.js';
import {
  FieldMergeResolver,
  LastWriteWinsResolver,
  ManualQueueResolver,
} from '../../src/client-sync/conflict-resolvers.js';
import type { MemoryWriteEvent } from '../../src/sync/isync-manager.interface.js';
import type { ISyncConflictStore, SyncConflictInsert } from '../../src/client-sync/isync-conflict-store.port.js';
import type { SyncConflictRecord } from '../../src/client-sync/client-sync.types.js';

interface MemoryRow {
  id: string;
  owner_id: string;
  workspace_id: string;
  updated_at: string;
  archived: number;
}

class FakeSyncDb implements D1Client {
  readonly conflicts: SyncConflictInsert[] = [];

  constructor(public memories: MemoryRow[] = []) {}

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/SELECT updated_at FROM memories/i.test(sql)) {
      const [id, ownerId, workspaceId] = params as [string, string, string?];
      const hasWorkspaceFilter = /workspace_id = \?/i.test(sql);

      return this.memories
        .filter(
          (m) =>
            m.id === id &&
            m.owner_id === ownerId &&
            m.archived === 0 &&
            (!hasWorkspaceFilter || m.workspace_id === workspaceId),
        )
        .map((m) => ({ updated_at: m.updated_at })) as T[];
    }

    throw new Error(`Unexpected query: ${sql}`);
  }

  async execute(sql: string, _params: unknown[] = []): Promise<D1QueryResult> {
    if (/INSERT INTO audit_logs/i.test(sql)) {
      return { results: [], success: true, meta: { changes: 1 } };
    }
    if (/INSERT INTO sync_conflicts/i.test(sql)) {
      return { results: [], success: true, meta: { changes: 1 } };
    }
    throw new Error(`Unexpected execute: ${sql}`);
  }
}

class RecordingAuditRepository extends AuditRepository {
  readonly entries: AuditLogInput[] = [];

  constructor(db: D1Client) {
    super(asSqlDatabase(db));
  }

  override async append(input: AuditLogInput): Promise<void> {
    this.entries.push(input);
    await super.append(input);
  }
}

class RecordingConflictStore implements ISyncConflictStore {
  readonly records: SyncConflictInsert[] = [];

  async insert(record: SyncConflictInsert): Promise<SyncConflictRecord> {
    this.records.push(record);
    return {
      id: 'conflict-1',
      ownerId: record.ownerId,
      workspaceId: record.workspaceId,
      platformId: record.platformId,
      memoryId: record.memoryId,
      payload: record.payload,
      status: 'pending',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
  }

  async countPending(): Promise<number> {
    return this.records.length;
  }

  async listPending(): Promise<SyncConflictRecord[]> {
    return [];
  }

  async updateStatus(): Promise<void> {}
}

const baseEvent: MemoryWriteEvent = {
  scope: { ownerId: 'owner-a', workspaceId: 'ws-a', agentId: 'cursor' },
  memoryId: 'mem-1',
  operation: 'update',
  expectedUpdatedAt: '2026-01-01T00:00:00.000Z',
};

const staleMemory: MemoryRow = {
  id: 'mem-1',
  owner_id: 'owner-a',
  workspace_id: 'ws-a',
  updated_at: '2026-01-02T00:00:00.000Z',
  archived: 0,
};

describe('ConflictAwareSyncManager', () => {
  it('accepts non-stale writes with LWW resolver', async () => {
    const db = new FakeSyncDb([
      { ...staleMemory, updated_at: '2026-01-01T00:00:00.000Z' },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new ConflictAwareSyncManager(
      new SyncStaleDetector(asSqlDatabase(db), audit),
      new LastWriteWinsResolver(),
    );

    const result = await sync.reconcileWrite(baseEvent);

    expect(result).toBe('accept');
    expect(audit.entries).toHaveLength(0);
  });

  it('rejects stale writes with LWW resolver', async () => {
    const db = new FakeSyncDb([staleMemory]);
    const audit = new RecordingAuditRepository(db);
    const sync = new ConflictAwareSyncManager(
      new SyncStaleDetector(asSqlDatabase(db), audit),
      new LastWriteWinsResolver(),
    );

    const result = await sync.reconcileWrite(baseEvent);

    expect(result).toBe('reject');
    expect(audit.entries[0]?.event).toBe('sync.conflict');
  });

  it('accepts stale writes with field_merge resolver', async () => {
    const db = new FakeSyncDb([staleMemory]);
    const audit = new RecordingAuditRepository(db);
    const sync = new ConflictAwareSyncManager(
      new SyncStaleDetector(asSqlDatabase(db), audit),
      new FieldMergeResolver(),
    );

    const result = await sync.reconcileWrite(baseEvent);

    expect(result).toBe('accept');
    expect(audit.entries).toHaveLength(1);
  });

  it('rejects and queues stale writes with manual_queue resolver', async () => {
    const db = new FakeSyncDb([staleMemory]);
    const audit = new RecordingAuditRepository(db);
    const conflictStore = new RecordingConflictStore();
    const sync = new ConflictAwareSyncManager(
      new SyncStaleDetector(asSqlDatabase(db), audit),
      new ManualQueueResolver(),
      conflictStore,
    );

    const result = await sync.reconcileWrite(baseEvent);

    expect(result).toBe('reject');
    expect(conflictStore.records).toHaveLength(1);
    expect(conflictStore.records[0]?.memoryId).toBe('mem-1');
  });
});

describe('Conflict resolvers', () => {
  it('LastWriteWinsResolver rejects stale context', async () => {
    const resolver = new LastWriteWinsResolver();
    const result = await resolver.resolve({
      event: baseEvent,
      actualUpdatedAt: '2026-01-02T00:00:00.000Z',
      isStale: true,
    });
    expect(result.result).toBe('reject');
  });

  it('FieldMergeResolver always accepts', async () => {
    const resolver = new FieldMergeResolver();
    const result = await resolver.resolve({
      event: baseEvent,
      actualUpdatedAt: '2026-01-02T00:00:00.000Z',
      isStale: true,
    });
    expect(result.result).toBe('accept');
  });

  it('ManualQueueResolver queues stale writes', async () => {
    const resolver = new ManualQueueResolver();
    const result = await resolver.resolve({
      event: baseEvent,
      actualUpdatedAt: '2026-01-02T00:00:00.000Z',
      isStale: true,
    });
    expect(result.result).toBe('reject');
    expect(result.queue).toBe(true);
  });
});
