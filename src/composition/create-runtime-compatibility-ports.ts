import type { Env } from '../config/env.js';
import {
  CapabilityManifestBuilder,
  type CapabilityManifestBuilderOptions,
} from '../capabilities/capability-manifest-builder.js';
import type { AICapabilityManifest } from '../capabilities/capability-manifest.types.js';

export interface RuntimeCompatibilityPorts {
  buildManifest(options?: CapabilityManifestBuilderOptions): AICapabilityManifest;
}

/**
 * Composition root for Phase 7.5 runtime compatibility (ADR-025).
 * Single builder path shared by REST GET /capabilities and MCP get_capabilities.
 */
export function createRuntimeCompatibilityPorts(env: Env): RuntimeCompatibilityPorts {
  return {
    buildManifest(options = {}) {
      return new CapabilityManifestBuilder(env, options).build();
    },
  };
}
