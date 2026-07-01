import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { KnowledgeService } from '../../src/knowledge/knowledge.service.js';
import { SearchService } from '../../src/search/search.service.js';
import { MemoryService } from '../../src/services/memory.service.js';
import { MemoryRelationService } from '../../src/services/memory-relation.service.js';
import type { MockD1Client } from './mock-d1.js';

export function createTestMemoryStack(mockDb: MockD1Client) {
  const repository = new MemoryRepository(mockDb);
  const relationRepository = new MemoryRelationRepository(mockDb);
  const knowledge = new KnowledgeService(repository);
  const search = new SearchService(repository);
  const memoryService = new MemoryService(repository, knowledge, search);
  const relationService = new MemoryRelationService(relationRepository, repository);
  return { repository, relationRepository, knowledge, search, memoryService, relationService };
}
