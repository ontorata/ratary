import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  CodeBridge,
  CodeBridgeType,
  CodeEdge,
  CodeEdgeType,
  CodeNode,
  CodeNodeKind,
  CodeSourceRange,
} from '../../types/code-memory.js';
import type { ICodeBridgeStore, ICodeEdgeStore, ICodeNodeStore } from './icode-memory-store.js';

function parseRange(raw: string | null): CodeSourceRange | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CodeSourceRange;
  } catch {
    return null;
  }
}

function rowToNode(row: Record<string, unknown>): CodeNode {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    kind: row.kind as CodeNodeKind,
    repoId: row.repo_id == null ? null : String(row.repo_id),
    stableKey: String(row.stable_key),
    displayName: String(row.display_name),
    language: row.language == null ? null : String(row.language),
    sourceRange: parseRange(row.source_range == null ? null : String(row.source_range)),
    contentHash: row.content_hash == null ? null : String(row.content_hash),
    indexerVersion: String(row.indexer_version),
    indexedAt: String(row.indexed_at),
  };
}

export class SqlCodeNodeStore implements ICodeNodeStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async upsertNode(node: CodeNode): Promise<void> {
    await this.sql.execute(
      `INSERT INTO code_nodes (
        id, owner_id, kind, repo_id, stable_key, display_name, language,
        source_range, content_hash, indexer_version, indexed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(owner_id, stable_key) DO UPDATE SET
        kind = excluded.kind,
        repo_id = excluded.repo_id,
        display_name = excluded.display_name,
        language = excluded.language,
        source_range = excluded.source_range,
        content_hash = excluded.content_hash,
        indexer_version = excluded.indexer_version,
        indexed_at = excluded.indexed_at`,
      [
        node.id,
        node.ownerId,
        node.kind,
        node.repoId,
        node.stableKey,
        node.displayName,
        node.language,
        node.sourceRange ? JSON.stringify(node.sourceRange) : null,
        node.contentHash,
        node.indexerVersion,
        node.indexedAt,
      ],
    );
  }

  async getById(ownerId: string, id: string): Promise<CodeNode | null> {
    const rows = await this.sql.query<Record<string, unknown>>(
      `SELECT * FROM code_nodes WHERE owner_id = ? AND id = ? LIMIT 1`,
      [ownerId, id],
    );
    return rows[0] ? rowToNode(rows[0]) : null;
  }

  async getByStableKey(ownerId: string, stableKey: string): Promise<CodeNode | null> {
    const rows = await this.sql.query<Record<string, unknown>>(
      `SELECT * FROM code_nodes WHERE owner_id = ? AND stable_key = ? LIMIT 1`,
      [ownerId, stableKey],
    );
    return rows[0] ? rowToNode(rows[0]) : null;
  }

  async listByRepo(ownerId: string, repoId: string, kinds?: CodeNodeKind[]): Promise<CodeNode[]> {
    if (kinds && kinds.length > 0) {
      const placeholders = kinds.map(() => '?').join(', ');
      const rows = await this.sql.query<Record<string, unknown>>(
        `SELECT * FROM code_nodes WHERE owner_id = ? AND (id = ? OR repo_id = ?) AND kind IN (${placeholders})`,
        [ownerId, repoId, repoId, ...kinds],
      );
      return rows.map(rowToNode);
    }
    const rows = await this.sql.query<Record<string, unknown>>(
      `SELECT * FROM code_nodes WHERE owner_id = ? AND (id = ? OR repo_id = ?)`,
      [ownerId, repoId, repoId],
    );
    return rows.map(rowToNode);
  }
}

export class SqlCodeEdgeStore implements ICodeEdgeStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async upsertEdge(edge: CodeEdge): Promise<void> {
    await this.sql.execute(
      `INSERT INTO code_edges (
        id, owner_id, type, from_id, to_id, evidence_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(owner_id, type, from_id, to_id) DO UPDATE SET
        evidence_json = excluded.evidence_json`,
      [
        edge.id,
        edge.ownerId,
        edge.type,
        edge.fromId,
        edge.toId,
        JSON.stringify(edge.evidence),
        edge.createdAt,
      ],
    );
  }

  async listNeighbors(
    ownerId: string,
    nodeId: string,
    options: {
      direction: 'outgoing' | 'incoming' | 'both';
      types?: CodeEdgeType[];
      limit: number;
    },
  ): Promise<CodeEdge[]> {
    const typeClause =
      options.types && options.types.length > 0
        ? `AND type IN (${options.types.map(() => '?').join(', ')})`
        : '';
    const typeParams = options.types ?? [];
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (options.direction === 'outgoing' || options.direction === 'both') {
      clauses.push(`(from_id = ? ${typeClause})`);
      params.push(nodeId, ...typeParams);
    }
    if (options.direction === 'incoming' || options.direction === 'both') {
      clauses.push(`(to_id = ? ${typeClause})`);
      params.push(nodeId, ...typeParams);
    }

    const rows = await this.sql.query<Record<string, unknown>>(
      `SELECT * FROM code_edges WHERE owner_id = ? AND (${clauses.join(' OR ')}) LIMIT ?`,
      [ownerId, ...params, options.limit],
    );

    return rows.map((row) => ({
      id: String(row.id),
      ownerId: String(row.owner_id),
      type: row.type as CodeEdgeType,
      fromId: String(row.from_id),
      toId: String(row.to_id),
      evidence: JSON.parse(String(row.evidence_json)) as CodeEdge['evidence'],
      createdAt: String(row.created_at),
    }));
  }
}

export class SqlCodeBridgeStore implements ICodeBridgeStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async upsertBridge(bridge: CodeBridge): Promise<void> {
    await this.sql.execute(
      `INSERT INTO code_bridges (
        id, owner_id, type, code_node_id, target_id, target_plane, evidence_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(owner_id, type, code_node_id, target_id) DO UPDATE SET
        evidence_json = excluded.evidence_json,
        target_plane = excluded.target_plane`,
      [
        bridge.id,
        bridge.ownerId,
        bridge.type,
        bridge.codeNodeId,
        bridge.targetId,
        bridge.targetPlane,
        JSON.stringify(bridge.evidence),
        bridge.createdAt,
      ],
    );
  }

  async listByCodeNode(
    ownerId: string,
    codeNodeId: string,
    types?: CodeBridgeType[],
  ): Promise<CodeBridge[]> {
    const typeClause =
      types && types.length > 0 ? `AND type IN (${types.map(() => '?').join(', ')})` : '';
    const rows = await this.sql.query<Record<string, unknown>>(
      `SELECT * FROM code_bridges WHERE owner_id = ? AND code_node_id = ? ${typeClause}`,
      [ownerId, codeNodeId, ...(types ?? [])],
    );
    return rows.map((row) => ({
      id: String(row.id),
      ownerId: String(row.owner_id),
      type: row.type as CodeBridgeType,
      codeNodeId: String(row.code_node_id),
      targetId: String(row.target_id),
      targetPlane: row.target_plane as 'memory' | 'entity',
      evidence: JSON.parse(String(row.evidence_json)) as Record<string, unknown>,
      createdAt: String(row.created_at),
    }));
  }
}

export function newCodeIds(): { id: string } {
  return { id: randomUUID() };
}
