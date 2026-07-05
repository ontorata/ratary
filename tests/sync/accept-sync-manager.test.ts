import { describe, it, expect } from 'vitest';
import { describe, it, expect } from 'vitest';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import type { AuditLogInput } from '../../src/auth/audit.repository.js';
import { AuditRepository } from '../../src/auth/audit.repository.js';
import { AcceptSyncManager } from '../../src/sync/accept-sync-manager.js';
import type { MemoryWriteEvent } from '../../src/sync/isync-manager.interface.js';

interface MemoryRow {
  id: string;
  owner_id: string;
  workspace_id: string;
  updated_at: string;
  archived: number;
}

class FakeSyncDb implements D1Client {
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

const baseEvent: MemoryWriteEvent = {
  scope: { ownerId: 'owner-a', workspaceId: 'ws-a', agentId: 'agent-1' },
  memoryId: 'mem-1',
  operation: 'update',
  expectedUpdatedAt: '2026-01-01T00:00:00.000Z',
};

describe('AcceptSyncManager', () => {
  it('should always accept writes (last-write-wins MVP)', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-a',
        updated_at: '2026-01-02T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    const result = await sync.reconcileWrite(baseEvent);

    expect(result).toBe('accept');
  });

  it('should not audit when expectedUpdatedAt matches current memory', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-a',
        updated_at: '2026-01-01T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    await sync.reconcileWrite(baseEvent);

    expect(audit.entries).toHaveLength(0);
  });

  it('should audit sync.conflict when expectedUpdatedAt is stale', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-a',
        updated_at: '2026-01-02T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    await sync.reconcileWrite(baseEvent);

    expect(audit.entries).toHaveLength(1);
    expect(audit.entries[0]).toMatchObject({
      event: 'sync.conflict',
      ownerId: 'owner-a',
      resource: 'memory',
      resourceId: 'mem-1',
      metadata: {
        operation: 'update',
        expectedUpdatedAt: '2026-01-01T00:00:00.000Z',
        actualUpdatedAt: '2026-01-02T00:00:00.000Z',
        workspaceId: 'ws-a',
        agentId: 'agent-1',
      },
    });
  });

  it('should skip stale check for create operations', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-a',
        updated_at: '2026-01-02T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    await sync.reconcileWrite({ ...baseEvent, operation: 'create' });

    expect(audit.entries).toHaveLength(0);
  });

  it('should skip stale check when expectedUpdatedAt is omitted', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-a',
        updated_at: '2026-01-02T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    await sync.reconcileWrite({ ...baseEvent, expectedUpdatedAt: undefined });

    expect(audit.entries).toHaveLength(0);
  });

  it('should scope stale detection by workspace when workspaceId is set', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-other',
        updated_at: '2026-01-02T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    await sync.reconcileWrite(baseEvent);

    expect(audit.entries).toHaveLength(0);
  });

  it('should audit stale delete attempts', async () => {
    const db = new FakeSyncDb([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-a',
        updated_at: '2026-01-02T00:00:00.000Z',
        archived: 0,
      },
    ]);
    const audit = new RecordingAuditRepository(db);
    const sync = new AcceptSyncManager(asSqlDatabase(db), audit);

    const result = await sync.reconcileWrite({ ...baseEvent, operation: 'delete' });

    expect(result).toBe('accept');
    expect(audit.entries[0]?.event).toBe('sync.conflict');
    expect(audit.entries[0]?.metadata?.operation).toBe('delete');
  });
});
