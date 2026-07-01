import type { D1Client } from '../db/d1-client.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { SearchService } from '../search/search.service.js';
import { MemoryService } from './memory.service.js';
import { MemoryRelationService } from './memory-relation.service.js';

export function createMemoryService(db: D1Client): MemoryService {
  const repository = new MemoryRepository(db);
  const knowledge = new KnowledgeService(repository);
  const search = new SearchService(repository);
  return new MemoryService(repository, knowledge, search);
}

export function createMemoryRelationService(db: D1Client): MemoryRelationService {
  const repository = new MemoryRepository(db);
  const relationRepository = new MemoryRelationRepository(db);
  return new MemoryRelationService(relationRepository, repository);
}
