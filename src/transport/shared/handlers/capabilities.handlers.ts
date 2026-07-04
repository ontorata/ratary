import { CapabilityManifestBuilder } from '../../../capabilities/capability-manifest-builder.js';
import type { AICapabilityManifest } from '../../../capabilities/capability-manifest.types.js';
import type { Env } from '../../../config/env.js';
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
  return {
    getManifest: {
      handle: (_ctx, input) =>
        Promise.resolve(
          new CapabilityManifestBuilder(deps.env, { openApiUrl: input.openApiUrl }).build(),
        ),
    },
  };
}
