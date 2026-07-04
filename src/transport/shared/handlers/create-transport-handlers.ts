import type { CapabilitiesHandlers } from './capabilities.handlers.js';
import { createCapabilitiesHandlers } from './capabilities.handlers.js';
import type { ContextHandlers } from './context.handlers.js';
import { createContextHandlers } from './context.handlers.js';
import type { TransportHandlerDeps } from './handler-deps.types.js';
import type { GraphHandlers } from './graph.handlers.js';
import { createGraphHandlers } from './graph.handlers.js';
import type { MemoryHandlers } from './memory.handlers.js';
import { createMemoryHandlers } from './memory.handlers.js';
import type { RelationHandlers } from './relation.handlers.js';
import { createRelationHandlers } from './relation.handlers.js';

export type { TransportHandlerDeps } from './handler-deps.types.js';
export type { MemoryHandlers } from './memory.handlers.js';
export type { ContextHandlers } from './context.handlers.js';
export type { CapabilitiesHandlers } from './capabilities.handlers.js';
export type { GraphHandlers } from './graph.handlers.js';
export type { RelationHandlers } from './relation.handlers.js';

export { createMemoryHandlers } from './memory.handlers.js';
export { createContextHandlers } from './context.handlers.js';
export { createCapabilitiesHandlers } from './capabilities.handlers.js';
export { createGraphHandlers } from './graph.handlers.js';
export { createRelationHandlers } from './relation.handlers.js';

export interface TransportHandlers {
  memory: MemoryHandlers;
  context: ContextHandlers;
  capabilities: CapabilitiesHandlers;
  graph: GraphHandlers;
  relations: RelationHandlers;
}

export function createTransportHandlers(deps: TransportHandlerDeps): TransportHandlers {
  const { memoryService, contextService, graphService, relationService, scopeResolver, env, infrastructurePorts, searchGraphPorts, contentScalePorts, knowledgeFabricPorts, aiBrainPlatformPorts, globalIntelligencePorts } = deps;

  return {
    memory: createMemoryHandlers({ memoryService, scopeResolver }),
    context: createContextHandlers({ contextService, scopeResolver }),
    capabilities: createCapabilitiesHandlers({ env, infrastructurePorts, searchGraphPorts, contentScalePorts, knowledgeFabricPorts, aiBrainPlatformPorts, globalIntelligencePorts }),
    graph: createGraphHandlers({ graphService, scopeResolver }),
    relations: createRelationHandlers({ relationService, scopeResolver }),
  };
}
