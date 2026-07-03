import { describe, it, expect } from 'vitest';
import type {
  IMemoryRepository,
  IMemoryReader,
  IMemoryWriter,
} from '../../src/repositories/memory.repository.interface.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository, createTestRelationRepository } from '../helpers/sql-test-harness.js';
import { KnowledgeService } from '../../src/knowledge/knowledge.service.js';
import { SearchService } from '../../src/search/search.service.js';
import { MemoryService } from '../../src/services/memory.service.js';
import { MemoryRelationService } from '../../src/services/memory-relation.service.js';

describe('repository interface dependency inversion', () => {
  it('should accept MemoryRepository where IMemoryRepository is required', () => {
    const mockDb = new MockD1Client();
    const repository: IMemoryRepository = createTestMemoryRepository(mockDb);

    const knowledge = new KnowledgeService(repository);
    const search = new SearchService(repository);
    const memory = new MemoryService(repository, knowledge, search);
    const relations = new MemoryRelationService(createTestRelationRepository(mockDb), repository);

    expect(knowledge).toBeDefined();
    expect(search).toBeDefined();
    expect(memory).toBeDefined();
    expect(relations).toBeDefined();
  });

  it('should satisfy ISP reader and writer ports from one repository', () => {
    const mockDb = new MockD1Client();
    const repository: IMemoryRepository = createTestMemoryRepository(mockDb);
    const reader: IMemoryReader = repository;
    const writer: IMemoryWriter = repository;

    expect(new SearchService(reader)).toBeDefined();
    expect(new MemoryRelationService(createTestRelationRepository(mockDb), reader)).toBeDefined();
    expect(new KnowledgeService(repository)).toBeDefined();
    expect(writer.allocateCodename).toBeTypeOf('function');
  });
});
