import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundError } from '../src/types/errors.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { KnowledgeService } from '../src/knowledge/knowledge.service.js';
import { SearchService } from '../src/search/search.service.js';
import { MemoryService } from '../src/services/memory.service.js';
import { D1EmbeddingStore } from '../src/embedding/d1-embedding.store.js';
import { NOOP_EMBEDDING_MODEL_ID } from '../src/embedding/noop-embedding.provider.js';
import { MockD1Client } from './helpers/mock-d1.js';
import { createTestMemoryStack } from './helpers/test-stack.js';

describe('MemoryService', () => {
  let service: ReturnType<typeof createTestMemoryStack>['memoryService'];
  let mockDb: MockD1Client;
  const scope = { ownerId: 'test-owner' };

  beforeEach(() => {
    mockDb = new MockD1Client();
    ({ memoryService: service } = createTestMemoryStack(mockDb));
  });

  describe('createMemory', () => {
    it('should create a memory with all fields', async () => {
      const memory = await service.createMemory(scope, {
        title: 'Login JWT',
        project: 'auth-service',
        content: '# Login JWT\n\nMenggunakan JWT HS256',
        summary: 'JWT authentication setup',
        tags: ['auth', 'jwt'],
        favorite: true,
      });

      expect(memory.id).toBeDefined();
      expect(memory.title).toBe('Login JWT');
      expect(memory.project).toBe('auth-service');
      expect(memory.content).toContain('JWT HS256');
      expect(memory.tags).toEqual(['auth', 'jwt']);
      expect(memory.favorite).toBe(true);
      expect(memory.archived).toBe(false);
      expect(memory.codename).toMatch(/^[A-Z]+-\d{4}$/);
      expect(memory.slug).toBeTruthy();
      expect(memory.createdAt).toBeDefined();
      expect(memory.updatedAt).toBeDefined();
    });
  });

  describe('getMemoryById', () => {
    it('should return memory by id', async () => {
      const created = await service.createMemory(scope, {
        title: 'Test',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      const found = await service.getMemoryById(scope, created.id);
      expect(found.id).toBe(created.id);
    });

    it('should throw NotFoundError for missing id', async () => {
      await expect(
        service.getMemoryById(scope, '00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateMemory', () => {
    it('should update memory fields', async () => {
      const created = await service.createMemory(scope, {
        title: 'Original',
        content: 'Original content',
        project: 'proj',
        summary: '',
        tags: [],
        favorite: false,
      });

      const updated = await service.updateMemory(scope, created.id, {
        title: 'Updated',
        content: 'Updated content',
      });

      expect(updated.title).toBe('Updated');
      expect(updated.content).toBe('Updated content');
      expect(updated.project).toBe('proj');
    });
  });

  describe('deleteMemory', () => {
    it('should delete memory', async () => {
      const created = await service.createMemory(scope, {
        title: 'To Delete',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      await service.deleteMemory(scope, created.id);

      await expect(service.getMemoryById(scope, created.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteMemory with embedding store', () => {
    let embeddingService: MemoryService;
    let embeddingStore: D1EmbeddingStore;
    const modelId = NOOP_EMBEDDING_MODEL_ID;

    beforeEach(() => {
      const repository = new MemoryRepository(mockDb);
      const knowledge = new KnowledgeService(repository);
      const search = new SearchService(repository);
      embeddingStore = new D1EmbeddingStore(mockDb);
      embeddingService = new MemoryService(repository, knowledge, search, embeddingStore);
    });

    it('should delete embedding when memory is deleted', async () => {
      const created = await embeddingService.createMemory(scope, {
        title: 'With Embedding',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      await embeddingStore.upsert({
        memoryId: created.id,
        ownerId: scope.ownerId,
        modelId,
        dimensions: 3,
        vector: [1, 0, 0],
        contentHash: 'hash-1',
      });

      await embeddingService.deleteMemory(scope, created.id);

      expect(await embeddingStore.findByMemoryId(created.id, scope.ownerId, modelId)).toBeNull();
    });

    it('should delete all embeddings on replace backup', async () => {
      const created = await embeddingService.createMemory(scope, {
        title: 'Backup Row',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      await embeddingStore.upsert({
        memoryId: created.id,
        ownerId: scope.ownerId,
        modelId,
        dimensions: 2,
        vector: [1, 0],
        contentHash: 'hash-2',
      });

      await embeddingService.replaceBackup(scope, {
        memories: [
          {
            title: 'Replaced',
            content: 'New content',
            project: '',
            summary: '',
            tags: [],
            favorite: false,
            archived: false,
          },
        ],
      });

      expect(await embeddingStore.findByMemoryId(created.id, scope.ownerId, modelId)).toBeNull();
    });
  });

  describe('listMemories', () => {
    it('should list memories with pagination', async () => {
      for (let i = 0; i < 3; i++) {
        await service.createMemory(scope, {
          title: `Memory ${i}`,
          content: `Content ${i}`,
          project: 'test-project',
          summary: '',
          tags: [],
          favorite: false,
        });
      }

      const result = await service.listMemories(scope, {
        project: 'test-project',
        limit: 2,
        offset: 0,
      });

      expect(result.memories.length).toBeLessThanOrEqual(2);
      expect(result.total).toBe(3);
    });
  });

  describe('searchMemory', () => {
    it('should search by keyword', async () => {
      await service.createMemory(scope, {
        title: 'JWT Login',
        content: 'POST /login endpoint',
        project: 'auth',
        summary: 'Authentication',
        tags: ['auth'],
        favorite: false,
      });

      await service.createMemory(scope, {
        title: 'Database Setup',
        content: 'PostgreSQL config',
        project: 'infra',
        summary: '',
        tags: [],
        favorite: false,
      });

      const result = await service.searchMemory(scope, {
        q: 'JWT',
        limit: 50,
        offset: 0,
        archived: false,
      });

      expect(result.memories.length).toBe(1);
      expect(result.memories[0].title).toBe('JWT Login');
    });

    it('should search by tag', async () => {
      await service.createMemory(scope, {
        title: 'Memory 1',
        content: 'Content',
        project: '',
        summary: '',
        tags: ['typescript'],
        favorite: false,
      });

      const result = await service.searchMemory(scope, {
        tag: 'typescript',
        limit: 50,
        offset: 0,
        archived: false,
      });

      expect(result.memories.length).toBe(1);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const created = await service.createMemory(scope, {
        title: 'Test',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      const toggled = await service.toggleFavorite(scope, created.id);
      expect(toggled.favorite).toBe(true);

      const toggledAgain = await service.toggleFavorite(scope, created.id);
      expect(toggledAgain.favorite).toBe(false);
    });
  });

  describe('archiveMemory', () => {
    it('should archive memory', async () => {
      const created = await service.createMemory(scope, {
        title: 'Test',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      const archived = await service.archiveMemory(scope, created.id);
      expect(archived.archived).toBe(true);
    });
  });

  describe('listProjects', () => {
    it('should list unique projects', async () => {
      await service.createMemory(scope, {
        title: 'M1',
        content: 'C1',
        project: 'project-a',
        summary: '',
        tags: [],
        favorite: false,
      });
      await service.createMemory(scope, {
        title: 'M2',
        content: 'C2',
        project: 'project-b',
        summary: '',
        tags: [],
        favorite: false,
      });

      const projects = await service.listProjects(scope);
      expect(projects).toContain('project-a');
      expect(projects).toContain('project-b');
    });
  });

  describe('listTags', () => {
    it('should list unique tags', async () => {
      await service.createMemory(scope, {
        title: 'M1',
        content: 'C1',
        project: '',
        summary: '',
        tags: ['react', 'typescript'],
        favorite: false,
      });

      const tags = await service.listTags(scope);
      expect(tags).toContain('react');
      expect(tags).toContain('typescript');
    });
  });

  describe('backup', () => {
    it('should export and import memories', async () => {
      await service.createMemory(scope, {
        title: 'Backup Test',
        content: 'Content for backup',
        project: 'backup-proj',
        summary: 'Summary',
        tags: ['backup'],
        favorite: true,
      });

      const exported = await service.exportBackup(scope);
      expect(exported.memories.length).toBe(1);

      const result = await service.importBackup(scope, {
        memories: [
          {
            title: 'Imported',
            content: 'Imported content',
            project: 'imported-proj',
            summary: '',
            tags: ['imported'],
            favorite: false,
            archived: false,
          },
        ],
      });

      expect(result.imported).toBe(1);

      const searchResult = await service.searchMemory(scope, {
        q: 'Imported',
        limit: 50,
        offset: 0,
        archived: false,
      });
      expect(searchResult.memories.some((m) => m.title === 'Imported')).toBe(true);
    });
  });
});
