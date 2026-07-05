import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundError, ValidationError } from '../../src/types/errors.js';
import { createTestMemoryStack } from '../helpers/test-stack.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('MemoryRelationService isolation', () => {
  let mockDb: MockD1Client;
  let stack: ReturnType<typeof createTestMemoryStack>;
  const ownerA = { ownerId: 'owner-a' };
  const ownerB = { ownerId: 'owner-b' };

  beforeEach(async () => {
    mockDb = new MockD1Client();
    stack = createTestMemoryStack(mockDb);
  });

  async function seedMemory(ownerId: string, title: string) {
    return stack.memoryService.createMemory(
      { ownerId },
      {
        title,
        content: `${title} content`,
        project: 'p',
        tags: [],
        summary: '',
        favorite: false,
      },
    );
  }

  it('should reject relation to cross-owner target', async () => {
    const a = await seedMemory(ownerA.ownerId, 'A');
    const b = await seedMemory(ownerB.ownerId, 'B');

    await expect(
      stack.relationService.createRelation(ownerA, a.id, {
        targetMemoryId: b.id,
        relation: 'related',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should reject list relations for cross-owner memory', async () => {
    const b = await seedMemory(ownerB.ownerId, 'B only');

    await expect(stack.relationService.listRelations(ownerA, b.id)).rejects.toThrow(NotFoundError);
  });

  it('should reject delete relation for cross-owner', async () => {
    const a1 = await seedMemory(ownerA.ownerId, 'A1');
    const a2 = await seedMemory(ownerA.ownerId, 'A2');
    const rel = await stack.relationService.createRelation(ownerA, a1.id, {
      targetMemoryId: a2.id,
      relation: 'related',
    });

    await expect(stack.relationService.deleteRelation(ownerB, a1.id, rel.id)).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should reject self-relation', async () => {
    const a = await seedMemory(ownerA.ownerId, 'Solo');

    await expect(
      stack.relationService.createRelation(ownerA, a.id, {
        targetMemoryId: a.id,
        relation: 'related',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('should not find codename across owners', async () => {
    const a = await seedMemory(ownerA.ownerId, 'Secret');
    expect(a.codename).toBeTruthy();

    await expect(stack.memoryService.getMemoryByCodename(ownerB, a.codename!)).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should list categories only for owner', async () => {
    await stack.memoryService.createMemory(ownerA, {
      title: 'Cat A',
      content: 'c',
      category: 'Development',
      tags: [],
      summary: '',
      favorite: false,
    });
    await stack.memoryService.createMemory(ownerB, {
      title: 'Cat B',
      content: 'c',
      category: 'Research',
      tags: [],
      summary: '',
      favorite: false,
    });

    const catsA = await stack.memoryService.listCategories(ownerA);
    expect(catsA).toContain('Development');
    expect(catsA).not.toContain('Research');
  });
});
