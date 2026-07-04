import type { Env } from '../../../config/env.js';
import type { InfrastructurePlatformPorts } from '../../../composition/create-infrastructure-platform-ports.js';
import type { SearchGraphPorts } from '../../../composition/create-search-graph-ports.js';
import type { ContentScalePorts } from '../../../composition/create-content-scale-ports.js';
import type { KnowledgeFabricPorts } from '../../../composition/create-knowledge-fabric-ports.js';
import type { AiBrainPlatformPorts } from '../../../composition/create-ai-brain-platform-ports.js';
import type { GlobalIntelligencePorts } from '../../../composition/create-global-intelligence-ports.js';
import type { ContextService } from '../../../memory/context.service.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { GraphService } from '../../../services/graph.service.js';
import type { MemoryRelationService } from '../../../services/memory-relation.service.js';
import type { MemoryService } from '../../../services/memory.service.js';
import type { SignalIngestDeps } from '../../../ingest/process-signal-ingest.js';

/** Shared dependencies for Phase 10.5B application handlers. */
export interface TransportHandlerDeps {
  memoryService: MemoryService;
  contextService: ContextService;
  graphService: GraphService;
  relationService: MemoryRelationService;
  scopeResolver: IScopeResolver;
  env: Env;
  infrastructurePorts?: InfrastructurePlatformPorts;
  searchGraphPorts?: SearchGraphPorts;
  contentScalePorts?: ContentScalePorts;
  knowledgeFabricPorts?: KnowledgeFabricPorts;
  aiBrainPlatformPorts?: AiBrainPlatformPorts;
  globalIntelligencePorts?: GlobalIntelligencePorts;
  signalIngest?: SignalIngestDeps & { enabled: boolean };
}
