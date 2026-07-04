import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MultiAiPorts } from '../composition/create-multi-ai-ports.js';
import { D1EmbeddingStore } from '../embedding/d1-embedding.store.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { SearchService } from '../search/search.service.js';
import { MemoryService } from './memory.service.js';
import { MemoryRelationService } from './memory-relation.service.js';
import type { IMemoryEvolutionCoordinator } from '../evolution/memory-evolution-coordinator.js';

/**
 * Creates MemoryService with a shared repository instance.
 * Pass existing repository to ensure single instance throughout the composition root.
 */
export function createMemoryService(
  db: ISqlDatabase,
  repository?: IMemoryRepository,
  multiAi?: Pick<MultiAiPorts, 'syncManager' | 'agentIdentity'>,
  evolution?: IMemoryEvolutionCoordinator,
): MemoryService {
  const memRepo = repository ?? new MemoryRepository(db);
  const knowledge = new KnowledgeService(memRepo);
  const search = new SearchService(memRepo);
  const embeddingStore = new D1EmbeddingStore(db);
  return new MemoryService(
    memRepo,
    knowledge,
    search,
    embeddingStore,
    multiAi?.syncManager,
    multiAi?.agentIdentity,
    evolution,
  );
}

/**
 * Creates MemoryRelationService with shared repositories.
 * Pass existing repositories to ensure single instance throughout the composition root.
 */
export function createMemoryRelationService(
  db: ISqlDatabase,
  repository?: IMemoryRepository,
  relationRepository?: MemoryRelationRepository,
): MemoryRelationService {
  const memRepo = repository ?? new MemoryRepository(db);
  const relRepo = relationRepository ?? new MemoryRelationRepository(db);
  return new MemoryRelationService(relRepo, memRepo);
}
