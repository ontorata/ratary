import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';

describe('MemoryRepository', () => {
  let repository: MemoryRepository;
  let mockDb: MockD1Client;
  const ownerId = 'owner-repo-test';

  beforeEach(() => {
    mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
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

  it('should find memories without embedding_id for owner only', async () => {
    const withoutEmbed = await repository.insert({
      title: 'No embed',
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
      codename: 'NOTE-0300',
      slug: 'no-embed',
      favorite: false,
      ownerId,
    });

    const withEmbed = await repository.insert({
      title: 'Has embed',
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
      codename: 'NOTE-0301',
      slug: 'has-embed',
      favorite: false,
      ownerId,
    });

    await repository.applyEmbeddingBackfill(withEmbed.id, ownerId, {
      embeddingId: 'emb-001',
    });

    await repository.insert({
      title: 'Other owner',
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
      codename: 'NOTE-0302',
      slug: 'other',
      favorite: false,
      ownerId: 'other-owner',
    });

    const pending = await repository.findWithoutEmbedding(ownerId, 10);

    expect(pending).toHaveLength(1);
    expect(pending[0]?.id).toBe(withoutEmbed.id);
    expect(pending[0]?.embeddingId).toBeNull();
  });

  it('should apply embedding backfill scoped to owner', async () => {
    const memory = await repository.insert({
      title: 'Backfill',
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
      codename: 'NOTE-0400',
      slug: 'backfill',
      favorite: false,
      ownerId,
    });

    await repository.applyEmbeddingBackfill(memory.id, 'wrong-owner', {
      embeddingId: 'emb-wrong',
    });

    let found = await repository.findById(memory.id, ownerId);
    expect(found?.embeddingId).toBeNull();

    await repository.applyEmbeddingBackfill(memory.id, ownerId, {
      embeddingId: 'emb-abc',
    });

    found = await repository.findById(memory.id, ownerId);
    expect(found?.embeddingId).toBe('emb-abc');
    expect(found?.updatedAt).toBe(memory.updatedAt);
  });

  it('should isolate memories by workspace when workspaceId is provided', async () => {
    const wsA = 'ws-a';
    const wsB = 'ws-b';

    const inA = await repository.insert({
      title: 'Workspace A',
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
      codename: 'NOTE-0600',
      slug: 'ws-a-memory',
      favorite: false,
      ownerId,
      workspaceId: wsA,
    });

    await repository.insert({
      title: 'Workspace B',
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
      codename: 'NOTE-0601',
      slug: 'ws-b-memory',
      favorite: false,
      ownerId,
      workspaceId: wsB,
    });

    expect(await repository.findById(inA.id, ownerId, wsA)).not.toBeNull();
    expect(await repository.findById(inA.id, ownerId, wsB)).toBeNull();

    const listA = await repository.findAll({ ownerId, workspaceId: wsA, limit: 10, offset: 0 });
    expect(listA.total).toBe(1);
    expect(listA.memories[0]?.title).toBe('Workspace A');
  });

  it('should exclude content body from retrieval candidate projection (O-04-2)', async () => {
    const secretBody = 'SECRET_FULL_BODY_SHOULD_NOT_APPEAR_IN_RETRIEVAL';
    const memory = await repository.insert({
      title: 'Retrieval projection',
      project: 'audit',
      content: secretBody,
      summary: 'summary',
      tags: [],
      keywords: ['audit'],
      category: '',
      memoryType: 'note',
      importance: 90,
      language: 'en',
      notes: '',
      codename: 'NOTE-0500',
      slug: 'retrieval-projection',
      favorite: false,
      ownerId,
    });

    const candidates = await repository.findRetrievalCandidates({
      ownerId,
      query: 'Retrieval',
      maxCandidates: 10,
    });
    const candidate = candidates.find((c) => c.id === memory.id);
    expect(candidate).toBeDefined();
    expect(candidate?.content).toBe('');

    const byIds = await repository.findByIds([memory.id], ownerId);
    expect(byIds[0]?.content).toBe(secretBody);

    const full = await repository.findById(memory.id, ownerId);
    expect(full?.content).toBe(secretBody);
  });
});
