import { randomUUID } from 'node:crypto';
import type { MemoryScope } from '../../../types/memory-scope.js';
import type { IKnowledgeExchangeService } from '../../../federation/ports/iknowledge-exchange.port.js';
import type {
  GlobalSyncRequest,
  GlobalSyncResult,
  GlobalSyncStatus,
  SyncJournalEntry,
  SyncTier,
} from '../types/sync.types.js';
import type {
  IGlobalSyncOrchestrator,
  IIntelligenceStore,
  IOfflineJournal,
} from '../ports/iglobal-sync.port.js';

export class GlobalSyncOrchestrator implements IGlobalSyncOrchestrator {
  private exchange: IKnowledgeExchangeService | null;

  constructor(
    exchange: IKnowledgeExchangeService | null,
    private readonly store: IIntelligenceStore,
    private readonly nodeId: string,
  ) {
    this.exchange = exchange;
  }

  setExchange(exchange: IKnowledgeExchangeService | null): void {
    this.exchange = exchange;
  }

  async sync(request: GlobalSyncRequest, scope: MemoryScope): Promise<GlobalSyncResult> {
    if (request.dryRun) {
      return {
        tier: request.tier,
        direction: request.direction,
        accepted: 0,
        rejected: 0,
        dryRun: true,
      };
    }

    let accepted = 0;
    let rejected = 0;
    let cursor: string | undefined;

    const peerId = request.peerId ?? this.nodeId;
    const scopeRef = {
      nodeId: this.nodeId,
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
    };

    if (this.exchange && request.direction !== 'push') {
      const pull = await this.exchange.pullAndApply(
        peerId,
        {
          source: { ...scopeRef, nodeId: peerId },
          target: scopeRef,
          cursor: request.since ?? null,
        },
        scope,
      );
      accepted += pull.accepted;
      rejected += pull.rejected;
      cursor = pull.cursor ?? undefined;
    }

    if (this.exchange && request.direction !== 'pull') {
      const push = await this.exchange.pushToPeer(peerId, [], scope);
      accepted += push.accepted;
      rejected += push.rejected;
      cursor = push.cursor ?? cursor;
    }

    if (cursor) {
      await this.store.setSyncCursor(scope, request.tier, cursor);
    }

    return {
      tier: request.tier,
      direction: request.direction,
      accepted,
      rejected,
      cursor,
      dryRun: false,
    };
  }

  async status(scope: MemoryScope): Promise<GlobalSyncStatus> {
    return this.store.getSyncStatus(scope);
  }
}

export class NoOpGlobalSyncOrchestrator implements IGlobalSyncOrchestrator {
  async sync(request: GlobalSyncRequest): Promise<GlobalSyncResult> {
    return {
      tier: request.tier,
      direction: request.direction,
      accepted: 0,
      rejected: 0,
      dryRun: request.dryRun ?? false,
    };
  }

  async status(): Promise<GlobalSyncStatus> {
    return { tiers: {} };
  }
}

export class SqlOfflineJournal implements IOfflineJournal {
  constructor(
    private readonly sql: import('../../../ports/sql/isql-database.port.js').ISqlDatabase,
  ) {}

  async append(
    scope: MemoryScope,
    entry: Omit<SyncJournalEntry, 'id' | 'status' | 'createdAt'>,
  ): Promise<SyncJournalEntry> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await this.sql.execute(
      `INSERT INTO intelligence_offline_journal (id, owner_id, workspace_id, entry_json, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [
        id,
        scope.ownerId,
        scope.workspaceId ?? null,
        JSON.stringify({ action: entry.action, payload: entry.payload }),
        createdAt,
      ],
    );
    return {
      ...entry,
      id,
      status: 'pending',
      createdAt,
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
    };
  }

  async pending(scope: MemoryScope): Promise<SyncJournalEntry[]> {
    const rows = await this.sql.query<{
      id: string;
      owner_id: string;
      workspace_id: string | null;
      entry_json: string;
      status: string;
      created_at: string;
      applied_at: string | null;
    }>(
      `SELECT id, owner_id, workspace_id, entry_json, status, created_at, applied_at
       FROM intelligence_offline_journal
       WHERE owner_id = ? AND (workspace_id IS ? OR workspace_id = ?) AND status = 'pending'
       ORDER BY created_at ASC`,
      [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null],
    );

    return rows.map((row) => {
      const parsed = JSON.parse(row.entry_json) as {
        action: string;
        payload: Record<string, unknown>;
      };
      return {
        id: row.id,
        ownerId: row.owner_id,
        workspaceId: row.workspace_id ?? undefined,
        action: parsed.action,
        payload: parsed.payload,
        status: row.status as 'pending' | 'applied',
        createdAt: row.created_at,
        appliedAt: row.applied_at ?? undefined,
      };
    });
  }

  async markApplied(entryId: string): Promise<void> {
    await this.sql.execute(
      `UPDATE intelligence_offline_journal SET status = 'applied', applied_at = ? WHERE id = ?`,
      [new Date().toISOString(), entryId],
    );
  }
}

export class NoOpOfflineJournal implements IOfflineJournal {
  async append(
    scope: MemoryScope,
    entry: Omit<SyncJournalEntry, 'id' | 'status' | 'createdAt'>,
  ): Promise<SyncJournalEntry> {
    return {
      ...entry,
      id: randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
    };
  }

  async pending(): Promise<SyncJournalEntry[]> {
    return [];
  }

  async markApplied(): Promise<void> {
    return undefined;
  }
}

export function tierForScope(scope: MemoryScope): SyncTier {
  if (scope.workspaceId) return 'workspace';
  return 'organization';
}
