import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { ICompressionStatusReader } from '../../ports/compression/icompression-status-reader.port.js';
import type { IMemoryRepository } from '../../repositories/memory.repository.interface.js';
import type { MemoryRelationRepository } from '../../repositories/memory-relation.repository.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { ICompressionPolicy } from './compression-policy.interface.js';
import type {
  CompressionMetadata,
  CompressionOwnerStatus,
  CompressionStatusQuery,
} from './compression.types.js';
import { MemoryConsolidator } from '../consolidator.js';

interface CompressionMetaRow {
  compression_meta: string;
  project_id: string | null;
}

/** Read-only compression status for an owner scope (ADR-023 optional MCP track). */
export class CompressionStatusReader implements ICompressionStatusReader {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly repository: IMemoryRepository,
    private readonly relationRepository: MemoryRelationRepository,
    private readonly env: Pick<Env, 'COMPRESSION_ENABLED' | 'COMPRESSION_POLICY' | 'COMPRESSION_SCHEDULER'>,
    private readonly policy: ICompressionPolicy,
  ) {}

  async getStatus(
    scope: MemoryScope,
    query: CompressionStatusQuery = {},
  ): Promise<CompressionOwnerStatus> {
    const projectId = query.projectId ?? null;
    const memories = await this.repository.findAllByOwner(scope.ownerId);
    const scoped = projectId
      ? memories.filter((m) => m.projectId === projectId)
      : memories;

    const metaStats = await this.loadCompressionMetaStats(scope.ownerId, projectId);
    const pending = await this.loadPending(scope, query.projectId);

    return {
      ownerId: scope.ownerId,
      projectId,
      compressionEnabled: this.env.COMPRESSION_ENABLED,
      compressionPolicy: this.env.COMPRESSION_POLICY,
      compressionScheduler: this.env.COMPRESSION_SCHEDULER,
      counts: {
        activeNotesAndRaw: scoped.filter(
          (m) => !m.archived && (m.level === 'note' || m.level === 'raw'),
        ).length,
        summaryMemories: scoped.filter((m) => !m.archived && m.level === 'summary').length,
        canonicalMemories: scoped.filter((m) => !m.archived && m.level === 'canonical').length,
        withCompressionMeta: metaStats.withCompressionMeta,
        archivedMemories: scoped.filter((m) => m.archived).length,
      },
      pending,
      lastCompressedAt: metaStats.lastCompressedAt,
    };
  }

  private async loadCompressionMetaStats(
    ownerId: string,
    projectId: string | null,
  ): Promise<{ withCompressionMeta: number; lastCompressedAt: string | null }> {
    const rows = await this.sql.query<CompressionMetaRow>(
      `SELECT compression_meta, project_id FROM memories
       WHERE owner_id = ? AND compression_meta IS NOT NULL`,
      [ownerId],
    );

    const filtered = projectId ? rows.filter((r) => r.project_id === projectId) : rows;
    let lastCompressedAt: string | null = null;

    for (const row of filtered) {
      try {
        const meta = JSON.parse(row.compression_meta) as CompressionMetadata;
        if (meta.compressedAt && (!lastCompressedAt || meta.compressedAt > lastCompressedAt)) {
          lastCompressedAt = meta.compressedAt;
        }
      } catch {
        // skip malformed rows
      }
    }

    return { withCompressionMeta: filtered.length, lastCompressedAt };
  }

  private async loadPending(
    scope: MemoryScope,
    projectId?: string,
  ): Promise<CompressionOwnerStatus['pending']> {
    const consolidator = new MemoryConsolidator(this.repository, this.relationRepository, {
      compressionPolicy: this.policy,
      compressionEnabled: this.env.COMPRESSION_ENABLED,
    });

    const report = await consolidator.run(scope, {
      dryRun: true,
      projectId,
      generateSummary: this.env.COMPRESSION_ENABLED,
    });

    return {
      duplicateMemories: report.duplicatesFound,
      compressibleClusters: report.actions.filter((a) => a.type === 'create_summary').length,
    };
  }
}
