/**
 * SQL-backed provenance query — loads owner-scoped provenance edges, then
 * delegates to pure chain walks (ADR-069 D3/D5).
 */
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IProvenanceQuery } from '../../ports/provenance/iprovenance-query.port.js';
import {
  walkEffectChain,
  walkWhyChain,
  type ChainWalkOptions,
  type ProvenanceChainStep,
  type ProvenanceWalkEdge,
} from '../../knowledge/provenance/chain-walk.js';
import { PROVENANCE_RELATION_TYPES } from '../../types/provenance.js';

interface RelationRow {
  id: string;
  source_memory_id: string;
  target_memory_id: string;
  relation: string;
  metadata: string;
}

function rowToWalkEdge(row: RelationRow): ProvenanceWalkEdge {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    metadata = {};
  }
  return {
    id: row.id,
    sourceMemoryId: row.source_memory_id,
    targetMemoryId: row.target_memory_id,
    relation: row.relation,
    metadata,
  };
}

export class SqlProvenanceQuery implements IProvenanceQuery {
  constructor(private readonly db: ISqlDatabase) {}

  async whyChain(
    ownerId: string,
    memoryId: string,
    options?: ChainWalkOptions,
  ): Promise<ProvenanceChainStep[]> {
    const edges = await this.loadOwnerProvenanceEdges(ownerId);
    return walkWhyChain(edges, memoryId, options);
  }

  async effectChain(
    ownerId: string,
    memoryId: string,
    options?: ChainWalkOptions,
  ): Promise<ProvenanceChainStep[]> {
    const edges = await this.loadOwnerProvenanceEdges(ownerId);
    return walkEffectChain(edges, memoryId, options);
  }

  private async loadOwnerProvenanceEdges(ownerId: string): Promise<ProvenanceWalkEdge[]> {
    const placeholders = PROVENANCE_RELATION_TYPES.map(() => '?').join(', ');
    const rows = await this.db.query<RelationRow>(
      `SELECT id, source_memory_id, target_memory_id, relation, metadata
       FROM memory_relations
       WHERE owner_id = ? AND relation IN (${placeholders})`,
      [ownerId, ...PROVENANCE_RELATION_TYPES],
    );
    return rows.map(rowToWalkEdge);
  }
}
