import type { Env } from '../../../config/env.js';
import type { ContextService } from '../../../memory/context.service.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { GraphService } from '../../../services/graph.service.js';
import type { MemoryRelationService } from '../../../services/memory-relation.service.js';
import type { MemoryService } from '../../../services/memory.service.js';

/** Shared dependencies for Phase 10.5B application handlers. */
export interface TransportHandlerDeps {
  memoryService: MemoryService;
  contextService: ContextService;
  graphService: GraphService;
  relationService: MemoryRelationService;
  scopeResolver: IScopeResolver;
  env: Env;
}
