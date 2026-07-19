import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { Memory } from '../types/memory.js';
import type { MemoryLevel } from '../types/memory-level.js';
import type {
  InsertMemoryData,
  ListFilters,
  SearchFilters,
  UpdateMemoryData,
} from '../types/memory-persistence.js';
import type { IMemoryRepository, RetrievalFilters } from './memory.repository.interface.js';
import { MemoryReaderSql } from './memory-reader.sql.js';
import { MemoryWriterSql } from './memory-writer.sql.js';

/** Facade over internal reader/writer SQL modules (Phase 11C — ADR-019). */
export class MemoryRepository implements IMemoryRepository {
  private readonly reader: MemoryReaderSql;
  private readonly writer: MemoryWriterSql;

  constructor(db: ISqlDatabase) {
    this.reader = new MemoryReaderSql(db);
    this.writer = new MemoryWriterSql(db, this.reader);
  }

  slugExists(ownerId: string, slug: string, excludeSlug?: string): Promise<boolean> {
    return this.reader.slugExists(ownerId, slug, excludeSlug);
  }

  findById(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null> {
    return this.reader.findById(id, ownerId, workspaceId);
  }

  findByIds(ids: string[], ownerId: string, workspaceId?: string): Promise<Memory[]> {
    return this.reader.findByIds(ids, ownerId, workspaceId);
  }

  findByIdsWithContent(ids: string[], ownerId: string, workspaceId?: string): Promise<Memory[]> {
    return this.reader.findByIdsWithContent(ids, ownerId, workspaceId);
  }

  findByCodename(ownerId: string, codename: string, workspaceId?: string): Promise<Memory | null> {
    return this.reader.findByCodename(ownerId, codename, workspaceId);
  }

  findBySlug(ownerId: string, slug: string, workspaceId?: string): Promise<Memory | null> {
    return this.reader.findBySlug(ownerId, slug, workspaceId);
  }

  findBySourcePath(
    ownerId: string,
    sourcePath: string,
    workspaceId?: string,
  ): Promise<Memory | null> {
    return this.reader.findBySourcePath(ownerId, sourcePath, workspaceId);
  }

  findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }> {
    return this.reader.findAll(filters);
  }

  findSearchCandidates(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }> {
    return this.reader.findSearchCandidates(filters);
  }

  search(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }> {
    return this.reader.search(filters);
  }

  listDistinctCategories(ownerId: string, workspaceId?: string): Promise<string[]> {
    return this.reader.listDistinctCategories(ownerId, workspaceId);
  }

  listProjects(ownerId: string, workspaceId?: string): Promise<string[]> {
    return this.reader.listProjects(ownerId, workspaceId);
  }

  listTags(ownerId: string, workspaceId?: string): Promise<string[]> {
    return this.reader.listTags(ownerId, workspaceId);
  }

  findAllByOwner(ownerId: string, workspaceId?: string): Promise<Memory[]> {
    return this.reader.findAllByOwner(ownerId, workspaceId);
  }

  findWithoutCodename(ownerId: string, limit: number): Promise<Memory[]> {
    return this.reader.findWithoutCodename(ownerId, limit);
  }

  findWithoutEmbedding(ownerId: string, limit: number): Promise<Memory[]> {
    return this.reader.findWithoutEmbedding(ownerId, limit);
  }

  findRetrievalCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    return this.reader.findRetrievalCandidates(filters);
  }

  findDuplicatesBySemanticHash(filters: {
    ownerId: string;
    workspaceId?: string;
    projectId?: string;
    semanticHash: string;
  }): Promise<Memory[]> {
    return this.reader.findDuplicatesBySemanticHash(filters);
  }

  findStaleCandidates(filters: {
    ownerId: string;
    workspaceId?: string;
    projectId?: string;
    minAccessCount: number;
    olderThanDays: number;
  }): Promise<Memory[]> {
    return this.reader.findStaleCandidates(filters);
  }

  findUpdatedSince(filters: {
    ownerId: string;
    workspaceId?: string;
    since: string;
    limit: number;
  }): Promise<Memory[]> {
    return this.reader.findUpdatedSince(filters);
  }

  allocateCodename(ownerId: string, prefix: string): Promise<string> {
    return this.writer.allocateCodename(ownerId, prefix);
  }

  insert(data: InsertMemoryData): Promise<Memory> {
    return this.writer.insert(data);
  }

  update(
    id: string,
    ownerId: string,
    data: UpdateMemoryData,
    workspaceId?: string,
  ): Promise<Memory | null> {
    return this.writer.update(id, ownerId, data, workspaceId);
  }

  delete(id: string, ownerId: string, workspaceId?: string): Promise<boolean> {
    return this.writer.delete(id, ownerId, workspaceId);
  }

  toggleFavorite(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null> {
    return this.writer.toggleFavorite(id, ownerId, workspaceId);
  }

  archive(
    id: string,
    ownerId: string,
    archived?: boolean,
    workspaceId?: string,
  ): Promise<Memory | null> {
    return this.writer.archive(id, ownerId, archived, workspaceId);
  }

  applyKnowledgeBackfill(
    id: string,
    ownerId: string,
    data: {
      codename: string;
      slug: string;
      summary: string;
      keywords: string[];
      category: string;
      memoryType: string;
      importance: number;
      language: string;
      notes: string;
    },
  ): Promise<void> {
    return this.writer.applyKnowledgeBackfill(id, ownerId, data);
  }

  deleteAllByOwner(ownerId: string, workspaceId?: string): Promise<void> {
    return this.writer.deleteAllByOwner(ownerId, workspaceId);
  }

  recordAccess(id: string, ownerId: string, workspaceId?: string): Promise<void> {
    return this.writer.recordAccess(id, ownerId, workspaceId);
  }

  recordAccessBatch(ids: string[], ownerId: string, workspaceId?: string): Promise<void> {
    return this.writer.recordAccessBatch(ids, ownerId, workspaceId);
  }

  bumpImportance(
    id: string,
    ownerId: string,
    importance: number,
    workspaceId?: string,
  ): Promise<Memory | null> {
    return this.writer.bumpImportance(id, ownerId, importance, workspaceId);
  }

  applyMemoryIntelligenceBackfill(
    id: string,
    ownerId: string,
    data: { projectId: string; level: MemoryLevel; semanticHash: string },
  ): Promise<void> {
    return this.writer.applyMemoryIntelligenceBackfill(id, ownerId, data);
  }

  applyEmbeddingBackfill(
    id: string,
    ownerId: string,
    data: { embeddingId: string },
  ): Promise<void> {
    return this.writer.applyEmbeddingBackfill(id, ownerId, data);
  }

  applyCompressionMetadata(
    id: string,
    ownerId: string,
    metadata: Record<string, unknown>,
    version: number,
    workspaceId?: string,
  ): Promise<void> {
    return this.writer.applyCompressionMetadata(id, ownerId, metadata, version, workspaceId);
  }

  setLifecycleState(
    id: string,
    ownerId: string,
    state: string,
    workspaceId?: string,
  ): Promise<Memory | null> {
    return this.writer.setLifecycleState(id, ownerId, state, workspaceId);
  }

  applyDecayResult(
    id: string,
    ownerId: string,
    data: { score: number; signalsJson: string; computedAt: string; lifecycleState: string },
    workspaceId?: string,
  ): Promise<void> {
    return this.writer.applyDecayResult(id, ownerId, data, workspaceId);
  }
}

export { RETRIEVAL_MEMORY_SELECT, MEMORY_SELECT } from './memory-sql.constants.js';
