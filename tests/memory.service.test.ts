import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { MemoryService } from '../src/services/memory.service.js';
import { MockD1Client } from './helpers/mock-d1.js';
import { NotFoundError } from '../src/types/errors.js';

describe('MemoryService', () => {
  let service: MemoryService;
  let mockDb: MockD1Client;

  beforeEach(() => {
    mockDb = new MockD1Client();
    const repository = new MemoryRepository(mockDb);
    service = new MemoryService(repository);
  });

  describe('createMemory', () => {
    it('should create a memory with all fields', async () => {
      const memory = await service.createMemory({
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
      expect(memory.createdAt).toBeDefined();
      expect(memory.updatedAt).toBeDefined();
    });
  });

  describe('getMemoryById', () => {
    it('should return memory by id', async () => {
      const created = await service.createMemory({
        title: 'Test',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      const found = await service.getMemoryById(created.id);
      expect(found.id).toBe(created.id);
    });

    it('should throw NotFoundError for missing id', async () => {
      await expect(
        service.getMemoryById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateMemory', () => {
    it('should update memory fields', async () => {
      const created = await service.createMemory({
        title: 'Original',
        content: 'Original content',
        project: 'proj',
        summary: '',
        tags: [],
        favorite: false,
      });

      const updated = await service.updateMemory(created.id, {
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
      const created = await service.createMemory({
        title: 'To Delete',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      await service.deleteMemory(created.id);

      await expect(service.getMemoryById(created.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('listMemories', () => {
    it('should list memories with pagination', async () => {
      for (let i = 0; i < 3; i++) {
        await service.createMemory({
          title: `Memory ${i}`,
          content: `Content ${i}`,
          project: 'test-project',
          summary: '',
          tags: [],
          favorite: false,
        });
      }

      const result = await service.listMemories({
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
      await service.createMemory({
        title: 'JWT Login',
        content: 'POST /login endpoint',
        project: 'auth',
        summary: 'Authentication',
        tags: ['auth'],
        favorite: false,
      });

      await service.createMemory({
        title: 'Database Setup',
        content: 'PostgreSQL config',
        project: 'infra',
        summary: '',
        tags: [],
        favorite: false,
      });

      const result = await service.searchMemory({
        q: 'JWT',
        limit: 50,
        offset: 0,
        archived: false,
      });

      expect(result.memories.length).toBe(1);
      expect(result.memories[0].title).toBe('JWT Login');
    });

    it('should search by tag', async () => {
      await service.createMemory({
        title: 'Memory 1',
        content: 'Content',
        project: '',
        summary: '',
        tags: ['typescript'],
        favorite: false,
      });

      const result = await service.searchMemory({
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
      const created = await service.createMemory({
        title: 'Test',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      const toggled = await service.toggleFavorite(created.id);
      expect(toggled.favorite).toBe(true);

      const toggledAgain = await service.toggleFavorite(created.id);
      expect(toggledAgain.favorite).toBe(false);
    });
  });

  describe('archiveMemory', () => {
    it('should archive memory', async () => {
      const created = await service.createMemory({
        title: 'Test',
        content: 'Content',
        project: '',
        summary: '',
        tags: [],
        favorite: false,
      });

      const archived = await service.archiveMemory(created.id);
      expect(archived.archived).toBe(true);
    });
  });

  describe('listProjects', () => {
    it('should list unique projects', async () => {
      await service.createMemory({
        title: 'M1',
        content: 'C1',
        project: 'project-a',
        summary: '',
        tags: [],
        favorite: false,
      });
      await service.createMemory({
        title: 'M2',
        content: 'C2',
        project: 'project-b',
        summary: '',
        tags: [],
        favorite: false,
      });

      const projects = await service.listProjects();
      expect(projects).toContain('project-a');
      expect(projects).toContain('project-b');
    });
  });

  describe('listTags', () => {
    it('should list unique tags', async () => {
      await service.createMemory({
        title: 'M1',
        content: 'C1',
        project: '',
        summary: '',
        tags: ['react', 'typescript'],
        favorite: false,
      });

      const tags = await service.listTags();
      expect(tags).toContain('react');
      expect(tags).toContain('typescript');
    });
  });

  describe('backup', () => {
    it('should export and import memories', async () => {
      await service.createMemory({
        title: 'Backup Test',
        content: 'Content for backup',
        project: 'backup-proj',
        summary: 'Summary',
        tags: ['backup'],
        favorite: true,
      });

      const exported = await service.exportBackup();
      expect(exported.memories.length).toBe(1);

      const result = await service.importBackup({
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

      const searchResult = await service.searchMemory({
        q: 'Imported',
        limit: 50,
        offset: 0,
        archived: false,
      });
      expect(searchResult.memories.some((m) => m.title === 'Imported')).toBe(true);
    });
  });
});
