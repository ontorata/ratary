import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('MemoryRepository', () => {
  let repository: MemoryRepository;
  let mockDb: MockD1Client;
  const ownerId = 'owner-repo-test';

  beforeEach(() => {
    mockDb = new MockD1Client();
    repository = new MemoryRepository(mockDb);
  });

  it('should insert and find by id scoped to owner', async () => {
    const memory = await repository.insert({
      title: 'Test',
      project: 'p1',
      content: 'body',
      summary: '',
      tags: ['a'],
      keywords: ['a'],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0001',
      slug: 'test',
      favorite: false,
      ownerId,
    });

    expect(memory.id).toBeDefined();
    expect(memory.ownerId).toBe(ownerId);

    const found = await repository.findById(memory.id, ownerId);
    expect(found?.title).toBe('Test');

    const otherOwner = await repository.findById(memory.id, 'other-owner');
    expect(otherOwner).toBeNull();
  });

  it('should list only memories for owner', async () => {
    await repository.insert({
      title: 'A',
      project: 'p',
      content: 'c',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0001',
      slug: 'a',
      favorite: false,
      ownerId,
    });
    await repository.insert({
      title: 'B',
      project: 'p',
      content: 'c',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0002',
      slug: 'b',
      favorite: false,
      ownerId: 'other',
    });

    const result = await repository.findAll({
      ownerId,
      limit: 10,
      offset: 0,
    });

    expect(result.total).toBe(1);
    expect(result.memories[0].title).toBe('A');
  });

  it('should insert intelligence fields with defaults', async () => {
    const memory = await repository.insert({
      title: 'Intel',
      project: 'Mangrove Apps',
      content: 'body',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0100',
      slug: 'intel',
      favorite: false,
      ownerId,
    });

    expect(memory.projectId).toBe('mangrove-apps');
    expect(memory.level).toBe('note');
    expect(memory.accessCount).toBe(0);
    expect(memory.lastAccessed).toBeNull();
    expect(memory.semanticHash).toBeNull();
  });

  it('should record access for owner-scoped memory', async () => {
    const memory = await repository.insert({
      title: 'Access',
      project: 'p1',
      content: 'body',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0200',
      slug: 'access',
      favorite: false,
      ownerId,
    });

    await repository.recordAccess(memory.id, ownerId);
    const updated = await repository.findById(memory.id, ownerId);

    expect(updated?.accessCount).toBe(1);
    expect(updated?.lastAccessed).toBeTruthy();
    expect(updated?.updatedAt).toBe(memory.updatedAt);
  });

  it('should delete only when owner matches', async () => {
    const memory = await repository.insert({
      title: 'Del',
      project: 'p',
      content: 'c',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0099',
      slug: 'del',
      favorite: false,
      ownerId,
    });

    expect(await repository.delete(memory.id, 'wrong')).toBe(false);
    expect(await repository.delete(memory.id, ownerId)).toBe(true);
    expect(await repository.findById(memory.id, ownerId)).toBeNull();
  });
});
