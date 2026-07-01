import type { MemoryRepository } from '../repositories/memory.repository.js';
import type {
  Memory,
  CreateMemoryInput,
  UpdateMemoryInput,
  ListMemoriesQuery,
  SearchQuery,
  BackupImportInput,
} from '../types/memory.js';
import { NotFoundError } from '../types/errors.js';

export class MemoryService {
  constructor(private readonly repository: MemoryRepository) {}

  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    return this.repository.insert({
      title: input.title,
      project: input.project,
      content: input.content,
      summary: input.summary,
      tags: input.tags,
      favorite: input.favorite,
      archived: false,
    });
  }

  async updateMemory(id: string, input: UpdateMemoryInput): Promise<Memory> {
    const updated = await this.repository.update(id, input);
    if (!updated) {
      throw new NotFoundError('Memory', id);
    }
    return updated;
  }

  async deleteMemory(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Memory', id);
    }
  }

  async getMemoryById(id: string): Promise<Memory> {
    const memory = await this.repository.findById(id);
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async listMemories(query: ListMemoriesQuery): Promise<{ memories: Memory[]; total: number }> {
    return this.repository.findAll({
      project: query.project,
      favorite: query.favorite,
      archived: query.archived,
      limit: query.limit,
      offset: query.offset,
    });
  }

  async searchMemory(query: SearchQuery): Promise<{ memories: Memory[]; total: number }> {
    return this.repository.search({
      query: query.q,
      tag: query.tag,
      project: query.project,
      favorite: query.favorite,
      archived: query.archived,
      limit: query.limit,
      offset: query.offset,
    });
  }

  async toggleFavorite(id: string): Promise<Memory> {
    const memory = await this.repository.toggleFavorite(id);
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async archiveMemory(id: string, archived = true): Promise<Memory> {
    const memory = await this.repository.archive(id, archived);
    if (!memory) {
      throw new NotFoundError('Memory', id);
    }
    return memory;
  }

  async listProjects(): Promise<string[]> {
    return this.repository.listProjects();
  }

  async listTags(): Promise<string[]> {
    return this.repository.listTags();
  }

  async exportBackup(): Promise<{ memories: Memory[] }> {
    const memories = await this.repository.findAllRaw();
    return { memories };
  }

  async importBackup(input: BackupImportInput): Promise<{ imported: number }> {
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
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
      imported++;
    }

    return { imported };
  }

  async replaceBackup(input: BackupImportInput): Promise<{ imported: number }> {
    await this.repository.deleteAll();

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
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
      imported++;
    }

    return { imported };
  }
}
