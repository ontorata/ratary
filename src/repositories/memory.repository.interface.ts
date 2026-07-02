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
  findById(id: string, ownerId: string): Promise<Memory | null>;
  findByCodename(ownerId: string, codename: string): Promise<Memory | null>;
  findBySlug(ownerId: string, slug: string): Promise<Memory | null>;
  findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }>;
  findSearchCandidates(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }>;
  search(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }>;
  listDistinctCategories(ownerId: string): Promise<string[]>;
  listProjects(ownerId: string): Promise<string[]>;
  listTags(ownerId: string): Promise<string[]>;
  findAllByOwner(ownerId: string): Promise<Memory[]>;
  findWithoutCodename(ownerId: string, limit: number): Promise<Memory[]>;
  findWithoutEmbedding(ownerId: string, limit: number): Promise<Memory[]>;
  findRetrievalCandidates(filters: RetrievalFilters): Promise<Memory[]>;
  findDuplicatesBySemanticHash(filters: {
    ownerId: string;
    projectId?: string;
    semanticHash: string;
  }): Promise<Memory[]>;
  findStaleCandidates(filters: {
    ownerId: string;
    projectId?: string;
    minAccessCount: number;
    olderThanDays: number;
  }): Promise<Memory[]>;
}

/** Write and maintenance memory persistence operations. */
export interface IMemoryWriter {
  allocateCodename(ownerId: string, prefix: string): Promise<string>;
  insert(data: InsertMemoryData): Promise<Memory>;
  update(id: string, ownerId: string, data: UpdateMemoryData): Promise<Memory | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
  toggleFavorite(id: string, ownerId: string): Promise<Memory | null>;
  archive(id: string, ownerId: string, archived?: boolean): Promise<Memory | null>;
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
  deleteAllByOwner(ownerId: string): Promise<void>;
  recordAccess(id: string, ownerId: string): Promise<void>;
  bumpImportance(id: string, ownerId: string, importance: number): Promise<Memory | null>;
  applyMemoryIntelligenceBackfill(
    id: string,
    ownerId: string,
    data: { projectId: string; level: MemoryLevel; semanticHash: string },
  ): Promise<void>;
  applyEmbeddingBackfill(id: string, ownerId: string, data: { embeddingId: string }): Promise<void>;
}

/**
 * Portability contract for memory persistence.
 * Only D1 (later Postgres) implementations contain SQL.
 */
export interface IMemoryRepository extends IMemoryReader, IMemoryWriter {}
