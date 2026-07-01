import type { MemoryRepository } from '../repositories/memory.repository.js';
import type {
  Memory,
  CreateMemoryInput,
  UpdateMemoryInput,
  ListMemoriesQuery,
  SearchQuery,
  BackupImportInput,
  MemoryScope,
} from '../types/memory.js';
import { NotFoundError } from '../types/errors.js';

export class MemoryService {
  constructor(private readonly repository: MemoryRepository) {}

  async createMemory(scope: MemoryScope, input: CreateMemoryInput): Promise<Memory> {
    return this.repository.insert({
      title: input.title,
      project: input.project,
      content: input.content,
      summary: input.summary,
      tags: input.tags,
      favorite: input.favorite,
      archived: false,
      ownerId: scope.ownerId,
    });
  }

  async updateMemory(scope: MemoryScope, id: string, input: UpdateMemoryInput): Promise<Memory> {
    const updated = await this.repository.update(id, scope.ownerId, input);
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

  async searchMemory(
    scope: MemoryScope,
    query: SearchQuery,
  ): Promise<{ memories: Memory[]; total: number }> {
    return this.repository.search({
      ownerId: scope.ownerId,
      query: query.q,
      tag: query.tag,
      project: query.project,
      favorite: query.favorite,
      archived: query.archived,
      limit: query.limit,
      offset: query.offset,
    });
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

  async exportBackup(scope: MemoryScope): Promise<{ memories: Memory[] }> {
    const memories = await this.repository.findAllByOwner(scope.ownerId);
    return { memories };
  }

  async importBackup(scope: MemoryScope, input: BackupImportInput): Promise<{ imported: number }> {
    let imported = 0;

    for (const item of input.memories) {
      await this.repository.insert({
        id: item.id,
        title: item.title,
        project: item.project,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        favorite: item.favorite,
        archived: item.archived,
        ownerId: scope.ownerId,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
      imported++;
    }

    return { imported };
  }

  async replaceBackup(scope: MemoryScope, input: BackupImportInput): Promise<{ imported: number }> {
    await this.repository.deleteAllByOwner(scope.ownerId);

    let imported = 0;
    for (const item of input.memories) {
      await this.repository.insert({
        id: item.id,
        title: item.title,
        project: item.project,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        favorite: item.favorite,
        archived: item.archived,
        ownerId: scope.ownerId,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
      imported++;
    }

    return { imported };
  }
}
