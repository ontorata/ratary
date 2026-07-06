import { generateId } from '../../utils/memory-mapper.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IFabricProvenanceStore } from '../../knowledge-fabric-platform/ports/ifabric-provenance-store.port.js';
import type {
  FabricProvenanceRecord,
  FabricSourceKind,
} from '../../knowledge-fabric-platform/types/fabric-provenance.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

interface ProvenanceRow {
  id: string;
  source_kind: string;
  source_id: string;
  external_id: string;
  memory_id: string;
  owner_id: string;
  workspace_id: string | null;
  external_updated_at: string;
  metadata_json: string | null;
  updated_at: string;
}

function workspaceScopeSql(
  column: string,
  workspaceId: string | null,
): { clause: string; params: unknown[] } {
  if (workspaceId === null) {
    return { clause: `${column} IS NULL`, params: [] };
  }
  return { clause: `${column} = ?`, params: [workspaceId] };
}

function mapRow(row: ProvenanceRow): FabricProvenanceRecord {
  return {
    sourceKind: row.source_kind as FabricSourceKind,
    sourceId: row.source_id,
    externalId: row.external_id,
    memoryId: row.memory_id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id ?? undefined,
    externalUpdatedAt: row.external_updated_at,
    metadata: row.metadata_json ? (JSON.parse(row.metadata_json) as Record<string, unknown>) : undefined,
    updatedAt: row.updated_at,
  };
}

export class SqlFabricProvenanceStore implements IFabricProvenanceStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async upsert(record: FabricProvenanceRecord): Promise<void> {
    const ws = record.workspaceId ?? null;
    const wsFilter = workspaceScopeSql('workspace_id', ws);
    const existing = await this.sql.query<ProvenanceRow>(
      `SELECT id FROM knowledge_fabric_provenance
       WHERE source_kind = ? AND source_id = ? AND external_id = ? AND owner_id = ?
         AND ${wsFilter.clause}`,
      [record.sourceKind, record.sourceId, record.externalId, record.ownerId, ...wsFilter.params],
    );

    const metadataJson = record.metadata ? JSON.stringify(record.metadata) : null;
    if (existing.length > 0) {
      await this.sql.execute(
        `UPDATE knowledge_fabric_provenance
         SET memory_id = ?, external_updated_at = ?, metadata_json = ?, updated_at = ?
         WHERE id = ?`,
        [
          record.memoryId,
          record.externalUpdatedAt,
          metadataJson,
          record.updatedAt,
          existing[0].id,
        ],
      );
      return;
    }

    await this.sql.execute(
      `INSERT INTO knowledge_fabric_provenance
       (id, source_kind, source_id, external_id, memory_id, owner_id, workspace_id,
        external_updated_at, metadata_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        record.sourceKind,
        record.sourceId,
        record.externalId,
        record.memoryId,
        record.ownerId,
        ws,
        record.externalUpdatedAt,
        metadataJson,
        record.updatedAt,
      ],
    );
  }

  async findBySourceRef(
    sourceKind: FabricSourceKind,
    sourceId: string,
    externalId: string,
    scope: MemoryScope,
  ): Promise<FabricProvenanceRecord | null> {
    const ws = scope.workspaceId ?? null;
    const wsFilter = workspaceScopeSql('workspace_id', ws);
    const rows = await this.sql.query<ProvenanceRow>(
      `SELECT * FROM knowledge_fabric_provenance
       WHERE source_kind = ? AND source_id = ? AND external_id = ? AND owner_id = ?
         AND ${wsFilter.clause}
       LIMIT 1`,
      [sourceKind, sourceId, externalId, scope.ownerId, ...wsFilter.params],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listByScope(scope: MemoryScope, limit = 50): Promise<FabricProvenanceRecord[]> {
    const ws = scope.workspaceId ?? null;
    const wsFilter = workspaceScopeSql('workspace_id', ws);
    const rows = await this.sql.query<ProvenanceRow>(
      `SELECT * FROM knowledge_fabric_provenance
       WHERE owner_id = ? AND ${wsFilter.clause}
       ORDER BY updated_at DESC
       LIMIT ?`,
      [scope.ownerId, ...wsFilter.params, limit],
    );
    return rows.map(mapRow);
  }
}

export class NoOpFabricProvenanceStore implements IFabricProvenanceStore {
  async upsert(): Promise<void> {
    return;
  }
  async findBySourceRef(): Promise<FabricProvenanceRecord | null> {
    return null;
  }
  async listByScope(): Promise<FabricProvenanceRecord[]> {
    return [];
  }
}
