import type { AICapabilityManifest } from '../../../capabilities/capability-manifest.types.js';
import type { Env } from '../../../config/env.js';
import { createRuntimeCompatibilityPorts } from '../../../composition/create-runtime-compatibility-ports.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';

export interface CapabilitiesHandlerDeps {
  env: Env;
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
      handle: (_ctx, input) =>
        Promise.resolve(compatibility.buildManifest({ openApiUrl: input.openApiUrl })),
    },
  };
}
