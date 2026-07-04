import type { AICapabilityManifest, CapabilityLimits } from './capability-manifest.types.js';
import { MCP_CAPABILITIES_META_KEY } from './capability-manifest.constants.js';

export type CondensedMcpTransport = AICapabilityManifest['mcp']['transport'] | 'streamable-http';

/** High-signal capability flags included in the condensed initialize snapshot. */
export const CONDENSED_CAPABILITY_FLAG_KEYS = [
  'supportsHybridRetrieval',
  'supportsKnowledgeGraph',
  'supportsSemanticCompression',
  'supportsQualitySignals',
  'supportsEventSubscription',
  'supportsRemoteMcp',
  'supportsFederation',
  'supportsSelfManagement',
  'supportsLearningEngine',
] as const satisfies ReadonlyArray<keyof AICapabilityManifest['capabilities']>;

export interface CondensedMcpCapabilitySnapshot {
  protocolVersion: string;
  version: string;
  mcp: {
    toolCount: number;
    transport: CondensedMcpTransport;
  };
  capabilitiesUrl: string;
  enabledCapabilities: string[];
  limits: CapabilityLimits;
  retrieval: Pick<AICapabilityManifest['retrieval'], 'retrievalPolicy' | 'defaultContentMode'>;
}

export interface BuildCondensedCapabilityManifestOptions {
  mcpTransport?: CondensedMcpTransport;
  capabilitiesUrl?: string;
}

export function buildCondensedCapabilityManifest(
  manifest: AICapabilityManifest,
  options: BuildCondensedCapabilityManifestOptions = {},
): CondensedMcpCapabilitySnapshot {
  const enabledCapabilities = CONDENSED_CAPABILITY_FLAG_KEYS.filter(
    (key) => manifest.capabilities[key],
  );

  return {
    protocolVersion: manifest.protocolVersion,
    version: manifest.version,
    mcp: {
      toolCount: manifest.mcp.toolCount,
      transport: options.mcpTransport ?? manifest.mcp.transport,
    },
    capabilitiesUrl: options.capabilitiesUrl ?? '/api/v1/capabilities',
    enabledCapabilities,
    limits: { ...manifest.limits },
    retrieval: {
      retrievalPolicy: manifest.retrieval.retrievalPolicy,
      defaultContentMode: manifest.retrieval.defaultContentMode,
    },
  };
}
