import type { AICapabilityManifest } from '../../../capabilities/capability-manifest.types.js';
import type { Env } from '../../../config/env.js';
import type { InfrastructurePlatformPorts } from '../../../composition/create-infrastructure-platform-ports.js';
import type { SearchGraphPorts } from '../../../composition/create-search-graph-ports.js';
import type { ContentScalePorts } from '../../../composition/create-content-scale-ports.js';
import type { KnowledgeFabricPorts } from '../../../composition/create-knowledge-fabric-ports.js';
import type { AiBrainPlatformPorts } from '../../../composition/create-ai-brain-platform-ports.js';
import type { GlobalIntelligencePorts } from '../../../composition/create-global-intelligence-ports.js';
import { createRuntimeCompatibilityPorts } from '../../../composition/create-runtime-compatibility-ports.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';

export interface CapabilitiesHandlerDeps {
  env: Env;
  infrastructurePorts?: InfrastructurePlatformPorts;
  searchGraphPorts?: SearchGraphPorts;
  contentScalePorts?: ContentScalePorts;
  knowledgeFabricPorts?: KnowledgeFabricPorts;
  aiBrainPlatformPorts?: AiBrainPlatformPorts;
  globalIntelligencePorts?: GlobalIntelligencePorts;
}

export interface GetCapabilitiesInput {
  openApiUrl?: string;
}

export interface CapabilitiesHandlers {
  getManifest: IApplicationHandler<GetCapabilitiesInput, AICapabilityManifest>;
}

export function createCapabilitiesHandlers(deps: CapabilitiesHandlerDeps): CapabilitiesHandlers {
  const compatibility = createRuntimeCompatibilityPorts(deps.env);

  return {
    getManifest: {
      handle: async (_ctx, input) => {
        const infrastructure = deps.infrastructurePorts?.enabled
          ? await deps.infrastructurePorts.manifestBuilder.build()
          : undefined;
        const searchGraph = deps.searchGraphPorts?.enabled
          ? await deps.searchGraphPorts.manifestBuilder.build()
          : undefined;
        const contentScale = deps.contentScalePorts?.enabled
          ? await deps.contentScalePorts.manifestBuilder.build()
          : undefined;
        const knowledgeFabric = deps.knowledgeFabricPorts?.enabled
          ? await deps.knowledgeFabricPorts.manifestBuilder.build()
          : undefined;
        const aiBrainPlatform = deps.aiBrainPlatformPorts?.enabled
          ? await deps.aiBrainPlatformPorts.manifestBuilder.build()
          : undefined;
        const globalIntelligence = deps.globalIntelligencePorts?.enabled
          ? await deps.globalIntelligencePorts.manifestBuilder.build()
          : undefined;
        return compatibility.buildManifest({
          openApiUrl: input.openApiUrl,
          infrastructure,
          searchGraph,
          contentScale,
          knowledgeFabric,
          aiBrainPlatform,
          globalIntelligence,
        });
      },
    },
  };
}
