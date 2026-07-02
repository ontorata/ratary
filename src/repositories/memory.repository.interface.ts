import type { Memory } from '../types/memory.js';
import type { MemoryLevel } from '../types/memory-level.js';
import type {
  InsertMemoryData,
  UpdateMemoryData,
  ListFilters,
  SearchFilters,
} from './memory.repository.js';

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

/**
 * Portability contract for memory persistence.
 * Only D1 (later Postgres) implementations contain SQL.
 */
export interface IMemoryRepository {
  allocateCodename(ownerId: string, prefix: string): Promise<string>;
  slugExists(ownerId: string, slug: string, excludeSlug?: string): Promise<boolean>;
  insert(data: InsertMemoryData): Promise<Memory>;
  update(id: string, ownerId: string, data: UpdateMemoryData): Promise<Memory | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
  findById(id: string, ownerId: string): Promise<Memory | null>;
  findByCodename(ownerId: string, codename: string): Promise<Memory | null>;
  findBySlug(ownerId: string, slug: string): Promise<Memory | null>;
  findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }>;
  findSearchCandidates(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }>;
  search(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }>;
  listDistinctCategories(ownerId: string): Promise<string[]>;
  toggleFavorite(id: string, ownerId: string): Promise<Memory | null>;
  archive(id: string, ownerId: string, archived?: boolean): Promise<Memory | null>;
  listProjects(ownerId: string): Promise<string[]>;
  listTags(ownerId: string): Promise<string[]>;
  findAllByOwner(ownerId: string): Promise<Memory[]>;
  findWithoutCodename(ownerId: string, limit: number): Promise<Memory[]>;
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
  findRetrievalCandidates(filters: RetrievalFilters): Promise<Memory[]>;
  recordAccess(id: string, ownerId: string): Promise<void>;
}
