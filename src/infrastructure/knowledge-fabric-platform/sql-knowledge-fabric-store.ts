import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IFabricExternalRefStore, FabricExternalRef } from '../../knowledge-fabric-platform/ports/ifabric-external-ref-store.port.js';
import type { IKnowledgeFabricIngestStore } from '../../knowledge-fabric-platform/ports/iknowledge-fabric-ingest-store.port.js';
import type { ConnectorId } from '../../knowledge-fabric-platform/types/connector.types.js';
import type {
  FabricConnectorState,
  FabricIngestRun,
} from '../../knowledge-fabric-platform/types/ingest.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

interface IngestRunRow {
  id: string;
  connector_id: string;
  mode: string;
  status: string;
  owner_id: string | null;
  workspace_id: string | null;
  stats_json: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

interface ExternalRefRow {
  id: string;
  connector_id: string;
  external_id: string;
  memory_id: string;
  owner_id: string;
  workspace_id: string | null;
  external_updated_at: string;
  updated_at: string;
}

interface ConnectorStateRow {
  connector_id: string;
  owner_id: string;
  workspace_id: string | null;
  last_cursor: string;
  last_run_id: string | null;
  updated_at: string;
}

function scopeKey(scope: MemoryScope): { ownerId: string; workspaceId: string | null } {
  return { ownerId: scope.ownerId, workspaceId: scope.workspaceId ?? null };
}

function mapIngestRun(row: IngestRunRow): FabricIngestRun {
  return {
    id: row.id,
    connectorId: row.connector_id as ConnectorId,
    mode: row.mode as FabricIngestRun['mode'],
    status: row.status as FabricIngestRun['status'],
    ownerId: row.owner_id ?? undefined,
    workspaceId: row.workspace_id ?? undefined,
    stats: JSON.parse(row.stats_json),
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    errorMessage: row.error_message ?? undefined,
  };
}

/** SQL-backed fabric ingest runs, cursors, and external refs (Phase 23). */
export class SqlKnowledgeFabricStore implements IFabricExternalRefStore, IKnowledgeFabricIngestStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async startRun(run: Omit<FabricIngestRun, 'finishedAt' | 'errorMessage'>): Promise<void> {
    await this.sql.execute(
      `INSERT INTO knowledge_fabric_ingest_runs
       (id, connector_id, mode, status, owner_id, workspace_id, stats_json, started_at, finished_at, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        run.id,
        run.connectorId,
        run.mode,
        run.status,
        run.ownerId ?? null,
        run.workspaceId ?? null,
        JSON.stringify(run.stats),
        run.startedAt,
      ],
    );
  }

  async completeRun(
    runId: string,
    update: Pick<FabricIngestRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void> {
    await this.sql.execute(
      `UPDATE knowledge_fabric_ingest_runs
       SET status = ?, stats_json = ?, finished_at = ?, error_message = ?
       WHERE id = ?`,
      [
        update.status,
        JSON.stringify(update.stats),
        update.finishedAt ?? nowISO(),
        update.errorMessage ?? null,
        runId,
      ],
    );
  }

  async listRuns(limit = 20): Promise<FabricIngestRun[]> {
    const rows = await this.sql.query<IngestRunRow>(
      `SELECT id, connector_id, mode, status, owner_id, workspace_id, stats_json, started_at, finished_at, error_message
       FROM knowledge_fabric_ingest_runs
       ORDER BY started_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(mapIngestRun);
  }

  async getLatestRun(connectorId: ConnectorId): Promise<FabricIngestRun | null> {
    const rows = await this.sql.query<IngestRunRow>(
      `SELECT id, connector_id, mode, status, owner_id, workspace_id, stats_json, started_at, finished_at, error_message
       FROM knowledge_fabric_ingest_runs
       WHERE connector_id = ?
       ORDER BY started_at DESC
       LIMIT 1`,
      [connectorId],
    );
    return rows[0] ? mapIngestRun(rows[0]) : null;
  }

  async findByExternalRef(
    connectorId: ConnectorId,
    externalId: string,
    scope: MemoryScope,
  ): Promise<FabricExternalRef | null> {
    const { ownerId, workspaceId } = scopeKey(scope);
    const rows = await this.sql.query<ExternalRefRow>(
      `SELECT id, connector_id, external_id, memory_id, owner_id, workspace_id, external_updated_at, updated_at
       FROM knowledge_fabric_external_refs
       WHERE connector_id = ? AND external_id = ? AND owner_id = ? AND workspace_id IS ?
       LIMIT 1`,
      [connectorId, externalId, ownerId, workspaceId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      connectorId: row.connector_id as ConnectorId,
      externalId: row.external_id,
      memoryId: row.memory_id,
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      externalUpdatedAt: row.external_updated_at,
      updatedAt: row.updated_at,
    };
  }

  async upsert(ref: FabricExternalRef): Promise<void> {
    const id = generateId();
    const updatedAt = nowISO();
    await this.sql.execute(
      `INSERT INTO knowledge_fabric_external_refs
       (id, connector_id, external_id, memory_id, owner_id, workspace_id, external_updated_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(connector_id, external_id, owner_id, workspace_id) DO UPDATE SET
         memory_id = excluded.memory_id,
         external_updated_at = excluded.external_updated_at,
         updated_at = excluded.updated_at`,
      [
        id,
        ref.connectorId,
        ref.externalId,
        ref.memoryId,
        ref.ownerId,
        ref.workspaceId ?? null,
        ref.externalUpdatedAt,
        updatedAt,
      ],
    );
  }

  async getCursor(connectorId: ConnectorId, scope: MemoryScope): Promise<string | null> {
    const state = await this.getConnectorState(connectorId, scope);
    return state?.lastCursor ?? null;
  }

  async setCursor(
    connectorId: ConnectorId,
    scope: MemoryScope,
    cursor: string,
    runId?: string,
  ): Promise<void> {
    const { ownerId, workspaceId } = scopeKey(scope);
    const updatedAt = nowISO();
    await this.sql.execute(
      `INSERT INTO knowledge_fabric_connector_state
       (connector_id, owner_id, workspace_id, last_cursor, last_run_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(connector_id, owner_id, workspace_id) DO UPDATE SET
         last_cursor = excluded.last_cursor,
         last_run_id = excluded.last_run_id,
         updated_at = excluded.updated_at`,
      [connectorId, ownerId, workspaceId, cursor, runId ?? null, updatedAt],
    );
  }

  async getConnectorState(
    connectorId: ConnectorId,
    scope: MemoryScope,
  ): Promise<FabricConnectorState | null> {
    const { ownerId, workspaceId } = scopeKey(scope);
    const rows = await this.sql.query<ConnectorStateRow>(
      `SELECT connector_id, owner_id, workspace_id, last_cursor, last_run_id, updated_at
       FROM knowledge_fabric_connector_state
       WHERE connector_id = ? AND owner_id = ? AND workspace_id IS ?`,
      [connectorId, ownerId, workspaceId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      connectorId: row.connector_id as ConnectorId,
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      lastCursor: row.last_cursor,
      lastRunId: row.last_run_id ?? undefined,
      updatedAt: row.updated_at,
    };
  }
}

export class InMemoryKnowledgeFabricStore implements IFabricExternalRefStore, IKnowledgeFabricIngestStore {
  private readonly runs = new Map<string, FabricIngestRun>();
  private readonly refs = new Map<string, FabricExternalRef>();
  private readonly states = new Map<string, FabricConnectorState>();

  private refKey(connectorId: ConnectorId, externalId: string, scope: MemoryScope): string {
    const { ownerId, workspaceId } = scopeKey(scope);
    return `${connectorId}:${externalId}:${ownerId}:${workspaceId ?? ''}`;
  }

  private stateKey(connectorId: ConnectorId, scope: MemoryScope): string {
    const { ownerId, workspaceId } = scopeKey(scope);
    return `${connectorId}:${ownerId}:${workspaceId ?? ''}`;
  }

  async startRun(run: Omit<FabricIngestRun, 'finishedAt' | 'errorMessage'>): Promise<void> {
    this.runs.set(run.id, { ...run });
  }

  async completeRun(
    runId: string,
    update: Pick<FabricIngestRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) return;
    Object.assign(run, update);
    this.runs.set(runId, run);
  }

  async listRuns(limit = 20): Promise<FabricIngestRun[]> {
    return [...this.runs.values()]
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  }

  async getLatestRun(connectorId: ConnectorId): Promise<FabricIngestRun | null> {
    return (
      [...this.runs.values()]
        .filter((r) => r.connectorId === connectorId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null
    );
  }

  async findByExternalRef(
    connectorId: ConnectorId,
    externalId: string,
    scope: MemoryScope,
  ): Promise<FabricExternalRef | null> {
    return this.refs.get(this.refKey(connectorId, externalId, scope)) ?? null;
  }

  async upsert(ref: FabricExternalRef): Promise<void> {
    this.refs.set(this.refKey(ref.connectorId, ref.externalId, {
      ownerId: ref.ownerId,
      workspaceId: ref.workspaceId,
    }), ref);
  }

  async getCursor(connectorId: ConnectorId, scope: MemoryScope): Promise<string | null> {
    return this.states.get(this.stateKey(connectorId, scope))?.lastCursor ?? null;
  }

  async setCursor(
    connectorId: ConnectorId,
    scope: MemoryScope,
    cursor: string,
    runId?: string,
  ): Promise<void> {
    this.states.set(this.stateKey(connectorId, scope), {
      connectorId,
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      lastCursor: cursor,
      lastRunId: runId,
      updatedAt: nowISO(),
    });
  }

  async getConnectorState(connectorId: ConnectorId, scope: MemoryScope) {
    return this.states.get(this.stateKey(connectorId, scope)) ?? null;
  }
}

export class NoOpKnowledgeFabricStore implements IFabricExternalRefStore, IKnowledgeFabricIngestStore {
  async startRun(): Promise<void> {
    // intentionally empty
  }

  async completeRun(): Promise<void> {
    // intentionally empty
  }

  async listRuns(): Promise<FabricIngestRun[]> {
    return [];
  }

  async getLatestRun(): Promise<FabricIngestRun | null> {
    return null;
  }

  async findByExternalRef(): Promise<FabricExternalRef | null> {
    return null;
  }

  async upsert(): Promise<void> {
    // intentionally empty
  }

  async getCursor(): Promise<string | null> {
    return null;
  }

  async setCursor(): Promise<void> {
    // intentionally empty
  }

  async getConnectorState(): Promise<FabricConnectorState | null> {
    return null;
  }
}

export function newFabricIngestRunId(): string {
  return generateId();
}
