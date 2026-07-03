import type { D1Client } from '../db/d1-client.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import { D1EmbeddingStore } from '../embedding/d1-embedding.store.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { SearchService } from '../search/search.service.js';
import { MemoryService } from './memory.service.js';
import { MemoryRelationService } from './memory-relation.service.js';

/**
 * Creates MemoryService with a shared repository instance.
 * Pass existing repository to ensure single instance throughout the composition root.
 */
export function createMemoryService(
  db: D1Client,
  repository?: IMemoryRepository,
): MemoryService {
  const memRepo = repository ?? new MemoryRepository(db);
  const knowledge = new KnowledgeService(memRepo);
  const search = new SearchService(memRepo);
  const embeddingStore = new D1EmbeddingStore(db);
  return new MemoryService(memRepo, knowledge, search, embeddingStore);
}

/**
 * Creates MemoryRelationService with shared repositories.
 * Pass existing repositories to ensure single instance throughout the composition root.
 */
export function createMemoryRelationService(
  db: D1Client,
  repository?: IMemoryRepository,
  relationRepository?: MemoryRelationRepository,
): MemoryRelationService {
  const memRepo = repository ?? new MemoryRepository(db);
  const relRepo = relationRepository ?? new MemoryRelationRepository(db);
  return new MemoryRelationService(relRepo, memRepo);
}
