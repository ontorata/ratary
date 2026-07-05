import { KnowledgeService } from '../../src/knowledge/knowledge.service.js';
import { SearchService } from '../../src/search/search.service.js';
import { MemoryService } from '../../src/services/memory.service.js';
import { MemoryRelationService } from '../../src/services/memory-relation.service.js';
import type { MockD1Client } from './mock-d1.js';
import { createTestMemoryRepository, createTestRelationRepository } from './sql-test-harness.js';

export function createTestMemoryStack(mockDb: MockD1Client) {
  const repository = createTestMemoryRepository(mockDb);
  const relationRepository = createTestRelationRepository(mockDb);
  const knowledge = new KnowledgeService(repository);
  const search = new SearchService(repository);
  const memoryService = new MemoryService(repository, knowledge, search);
  const relationService = new MemoryRelationService(relationRepository, repository);
  return { repository, relationRepository, knowledge, search, memoryService, relationService };
}
