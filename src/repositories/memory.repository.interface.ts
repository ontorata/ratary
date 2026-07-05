import type { Memory } from '../types/memory.js';
import type { MemoryLevel } from '../types/memory-level.js';
import type {
  InsertMemoryData,
  ListFilters,
  SearchFilters,
  UpdateMemoryData,
} from '../types/memory-persistence.js';

export interface RetrievalFilters {
  ownerId: string;
  workspaceId?: string;
  projectId?: string;
  tags?: string[];
  levels?: MemoryLevel[];
  query?: string;
  importanceMin?: number;
  archived?: boolean;
  maxCandidates: number;
}

/** Read-only memory persistence operations. */
export interface IMemoryReader {
  slugExists(ownerId: string, slug: string, excludeSlug?: string): Promise<boolean>;
  findById(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null>;
  findByIds(ids: string[], ownerId: string, workspaceId?: string): Promise<Memory[]>;
  /** Full row including content — for context hydration when bodies are requested. */
  findByIdsWithContent(ids: string[], ownerId: string, workspaceId?: string): Promise<Memory[]>;
  findByCodename(ownerId: string, codename: string, workspaceId?: string): Promise<Memory | null>;
  findBySlug(ownerId: string, slug: string, workspaceId?: string): Promise<Memory | null>;
  findBySourcePath(ownerId: string, sourcePath: string, workspaceId?: string): Promise<Memory | null>;
  findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }>;
  findSearchCandidates(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }>;
  search(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }>;
  listDistinctCategories(ownerId: string, workspaceId?: string): Promise<string[]>;
  listProjects(ownerId: string, workspaceId?: string): Promise<string[]>;
  listTags(ownerId: string, workspaceId?: string): Promise<string[]>;
  findAllByOwner(ownerId: string, workspaceId?: string): Promise<Memory[]>;
  findWithoutCodename(ownerId: string, limit: number): Promise<Memory[]>;
  findWithoutEmbedding(ownerId: string, limit: number): Promise<Memory[]>;
  findRetrievalCandidates(filters: RetrievalFilters): Promise<Memory[]>;
  findDuplicatesBySemanticHash(filters: {
    ownerId: string;
    workspaceId?: string;
    projectId?: string;
    semanticHash: string;
  }): Promise<Memory[]>;
  findStaleCandidates(filters: {
    ownerId: string;
    workspaceId?: string;
    projectId?: string;
    minAccessCount: number;
    olderThanDays: number;
  }): Promise<Memory[]>;
  findUpdatedSince(filters: {
    ownerId: string;
    workspaceId?: string;
    since: string;
    limit: number;
  }): Promise<Memory[]>;
}

/** Write and maintenance memory persistence operations. */
export interface IMemoryWriter {
  allocateCodename(ownerId: string, prefix: string): Promise<string>;
  insert(data: InsertMemoryData): Promise<Memory>;
  update(
    id: string,
    ownerId: string,
    data: UpdateMemoryData,
    workspaceId?: string,
  ): Promise<Memory | null>;
  delete(id: string, ownerId: string, workspaceId?: string): Promise<boolean>;
  toggleFavorite(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null>;
  archive(
    id: string,
    ownerId: string,
    archived?: boolean,
    workspaceId?: string,
  ): Promise<Memory | null>;
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
  ): Promise<void>;
  deleteAllByOwner(ownerId: string, workspaceId?: string): Promise<void>;
  recordAccess(id: string, ownerId: string, workspaceId?: string): Promise<void>;
  recordAccessBatch(ids: string[], ownerId: string, workspaceId?: string): Promise<void>;
  bumpImportance(
    id: string,
    ownerId: string,
    importance: number,
    workspaceId?: string,
  ): Promise<Memory | null>;
  applyMemoryIntelligenceBackfill(
    id: string,
    ownerId: string,
    data: { projectId: string; level: MemoryLevel; semanticHash: string },
  ): Promise<void>;
  applyEmbeddingBackfill(id: string, ownerId: string, data: { embeddingId: string }): Promise<void>;
  applyCompressionMetadata(
    id: string,
    ownerId: string,
    metadata: Record<string, unknown>,
    version: number,
    workspaceId?: string,
  ): Promise<void>;
  setLifecycleState(
    id: string,
    ownerId: string,
    state: string,
    workspaceId?: string,
  ): Promise<Memory | null>;
}

/**
 * Portability contract for memory persistence.
 * Only D1 (later Postgres) implementations contain SQL.
 */
export interface IMemoryRepository extends IMemoryReader, IMemoryWriter {}
