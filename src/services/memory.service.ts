import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { KnowledgeService } from '../knowledge/knowledge.service.js';
import type { SearchService } from '../search/search.service.js';
import type {
  Memory,
  CreateMemoryInput,
  UpdateMemoryInput,
  ListMemoriesQuery,
  SearchQuery,
  BackupImportInput,
  MemoryScope,
} from '../types/memory.js';
import type { MemoryType } from '../types/knowledge.js';
import { DEFAULT_MEMORY_LEVEL } from '../types/memory-level.js';
import { NotFoundError } from '../types/errors.js';

export class MemoryService {
  constructor(
    private readonly repository: IMemoryRepository,
    private readonly knowledge: KnowledgeService,
    private readonly search: SearchService,
  ) {}

  async createMemory(scope: MemoryScope, input: CreateMemoryInput): Promise<Memory> {
    const enriched = await this.knowledge.enrichForCreate(scope.ownerId, {
      title: input.title,
      project: input.project,
      content: input.content,
      summary: input.summary,
      tags: input.tags,
      keywords: input.keywords,
      category: input.category,
      memoryType: input.memoryType,
      importance: input.importance,
      language: input.language,
      notes: input.notes,
    });

    return this.repository.insert({
      title: input.title,
      project: input.project,
      content: input.content,
      summary: enriched.summary,
      tags: input.tags,
      keywords: enriched.keywords,
      category: enriched.category,
      memoryType: enriched.memoryType,
      importance: enriched.importance,
      language: enriched.language,
      notes: enriched.notes,
      codename: enriched.codename,
      slug: enriched.slug,
      favorite: input.favorite,
      archived: false,
      ownerId: scope.ownerId,
      level: input.level ?? DEFAULT_MEMORY_LEVEL,
    });
  }

  async updateMemory(scope: MemoryScope, id: string, input: UpdateMemoryInput): Promise<Memory> {
    const existing = await this.repository.findById(id, scope.ownerId);
    if (!existing) {
      throw new NotFoundError('Memory', id);
    }

    const enriched = await this.knowledge.enrichForUpdate(
      scope.ownerId,
      {
        ...existing,
        memoryType: existing.memoryType as MemoryType,
      },
      {
        title: input.title,
        project: input.project,
        content: input.content,
        summary: input.summary,
        tags: input.tags,
        keywords: input.keywords,
        category: input.category,
        memoryType: input.memoryType,
        importance: input.importance,
        language: input.language,
        notes: input.notes,
      },
    );

    const updated = await this.repository.update(id, scope.ownerId, {
      title: input.title,
      project: input.project,
      content: input.content,
      summary: enriched.summary,
      tags: input.tags,
      keywords: enriched.keywords,
      category: enriched.category,
      memoryType: enriched.memoryType,
      importance: enriched.importance,
      language: enriched.language,
      notes: enriched.notes,
      slug: enriched.slug,
      favorite: input.favorite,
    });

    if (!updated) {
      throw new NotFoundError('Memory', id);
    }
    return updated;
  }

  async deleteMemory(scope: MemoryScope, id: string): Promise<void> {
    const deleted = await this.repository.delete(id, scope.ownerId);
    if (!deleted) {
      throw new NotFoundError('Memory', id);
    }
  }

  async getMemoryById(scope: MemoryScope, id: string): Promise<Memory> {
    const memory = await this.repository.findById(id, scope.ownerId);
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async getMemoryByCodename(scope: MemoryScope, codename: string): Promise<Memory> {
    const memory = await this.repository.findByCodename(scope.ownerId, codename);
    if (!memory) {
      throw new NotFoundError('Memory', codename);
    }
    return memory;
  }

  async getMemoryBySlug(scope: MemoryScope, slug: string): Promise<Memory> {
    const memory = await this.repository.findBySlug(scope.ownerId, slug);
    if (!memory) {
      throw new NotFoundError('Memory', slug);
    }
    return memory;
  }

  async listMemories(
    scope: MemoryScope,
    query: ListMemoriesQuery,
  ): Promise<{ memories: Memory[]; total: number }> {
    return this.repository.findAll({
      ownerId: scope.ownerId,
      project: query.project,
      favorite: query.favorite,
      archived: query.archived,
      limit: query.limit,
      offset: query.offset,
    });
  }

  async searchMemory(scope: MemoryScope, query: SearchQuery) {
    return this.search.search(scope, query);
  }

  async toggleFavorite(scope: MemoryScope, id: string): Promise<Memory> {
    const memory = await this.repository.toggleFavorite(id, scope.ownerId);
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async archiveMemory(scope: MemoryScope, id: string, archived = true): Promise<Memory> {
    const memory = await this.repository.archive(id, scope.ownerId, archived);
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async listProjects(scope: MemoryScope): Promise<string[]> {
    return this.repository.listProjects(scope.ownerId);
  }

  async listTags(scope: MemoryScope): Promise<string[]> {
    return this.repository.listTags(scope.ownerId);
  }

  async listCategories(scope: MemoryScope): Promise<string[]> {
    return this.repository.listDistinctCategories(scope.ownerId);
  }

  async exportBackup(scope: MemoryScope): Promise<{ memories: Memory[] }> {
    const memories = await this.repository.findAllByOwner(scope.ownerId);
    return { memories };
  }

  async importBackup(scope: MemoryScope, input: BackupImportInput): Promise<{ imported: number }> {
    let imported = 0;

    for (const item of input.memories) {
      await this.createMemory(scope, {
        title: item.title,
        project: item.project,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        favorite: item.favorite,
        level: 'raw',
      });
      imported++;
    }

    return { imported };
  }

  async replaceBackup(scope: MemoryScope, input: BackupImportInput): Promise<{ imported: number }> {
    await this.repository.deleteAllByOwner(scope.ownerId);

    let imported = 0;
    for (const item of input.memories) {
      await this.createMemory(scope, {
        title: item.title,
        project: item.project,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        favorite: item.favorite,
        level: 'raw',
      });
      imported++;
    }

    return { imported };
  }
}
