import { describe, it, expect, beforeEach } from 'vitest';
import { createTestRelationRepository } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('MemoryRelationRepository', () => {
  let repository: MemoryRelationRepository;
  let mockDb: MockD1Client;
  const ownerId = 'rel-owner';

  beforeEach(() => {
    mockDb = new MockD1Client();
    repository = createTestRelationRepository(mockDb);
  });

  it('should insert and find relation scoped to owner', async () => {
    const relation = await repository.insert({
      sourceMemoryId: '00000000-0000-0000-0000-000000000001',
      targetMemoryId: '00000000-0000-0000-0000-000000000002',
      relation: 'related',
      ownerId,
    });

    expect(relation.id).toBeDefined();
    const found = await repository.findById(relation.id, ownerId);
    expect(found?.relation).toBe('related');

    const other = await repository.findById(relation.id, 'other-owner');
    expect(other).toBeNull();
  });

  it('should delete relation scoped to owner', async () => {
    const relation = await repository.insert({
      sourceMemoryId: '00000000-0000-0000-0000-000000000001',
      targetMemoryId: '00000000-0000-0000-0000-000000000002',
      relation: 'related',
      ownerId: 'rel-owner',
    });

    expect(await repository.delete(relation.id, 'rel-owner')).toBe(true);
    expect(await repository.findById(relation.id, 'rel-owner')).toBeNull();
  });

  it('should delete relation with empty owner id', async () => {
    const relation = await repository.insert({
      sourceMemoryId: '00000000-0000-0000-0000-000000000001',
      targetMemoryId: '00000000-0000-0000-0000-000000000002',
      relation: 'related',
      ownerId: '',
    });

    expect(await repository.delete(relation.id, '')).toBe(true);
  });
});
