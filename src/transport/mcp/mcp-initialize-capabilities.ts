import {
  InitializeRequestSchema,
  LATEST_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
} from '@modelcontextprotocol/sdk/types.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AICapabilityManifest } from '../../capabilities/capability-manifest.types.js';
import {
  MCP_CAPABILITIES_META_KEY,
  MCP_CAPABILITIES_NEGOTIATION_META_KEY,
  MCP_CAPABILITIES_REQUEST_META_KEY,
} from '../../capabilities/capability-manifest.constants.js';
import {
  buildCondensedCapabilityManifest,
  type CondensedMcpCapabilitySnapshot,
} from '../../capabilities/condensed-capability-manifest.js';
import {
  negotiateCapabilities,
  parseClientCapabilityRequest,
} from '../../capabilities/capability-negotiation.js';
import type { CapabilityNegotiationResult } from '../../capabilities/capability-negotiation.types.js';

/** MCP SDK Server keeps `_clientCapabilities` private — cast via unknown, do not intersect. */
type InitializeAwareServer = {
  setRequestHandler: McpServer['server']['setRequestHandler'];
  getCapabilities: () => Record<string, unknown>;
  _clientCapabilities: unknown;
  _clientVersion: unknown;
};

export interface McpInitializeSnapshotOptions {
  mcpTransport?: CondensedMcpCapabilitySnapshot['mcp']['transport'];
  capabilitiesUrl?: string;
  negotiateUrl?: string;
}

export interface McpInitializeSnapshot {
  condensed: CondensedMcpCapabilitySnapshot;
  negotiation?: CapabilityNegotiationResult;
}

export function buildMcpInitializeInstructions(
  condensed: CondensedMcpCapabilitySnapshot,
  negotiation?: CapabilityNegotiationResult,
): string {
  const parts = [
    'Ratary memory cloud. Use search_memory with project name; save handoffs with save_memory.',
    `Full deployment manifest: call get_capabilities or GET ${condensed.capabilitiesUrl}.`,
    `Condensed snapshot: protocolVersion=${condensed.protocolVersion}, toolCount=${condensed.mcp.toolCount}.`,
  ];

  if (negotiation) {
    parts.push(
      `Negotiated protocolVersion=${negotiation.negotiatedProtocolVersion}; compatible=${negotiation.compatible}.`,
    );
    if (negotiation.missing.required.length > 0) {
      parts.push(`Missing required capabilities: ${negotiation.missing.required.join(', ')}.`);
    }
  }

  return parts.join(' ');
}

export function buildMcpServerInfoDescription(
  condensed: CondensedMcpCapabilitySnapshot,
  negotiation?: CapabilityNegotiationResult,
): string {
  const compatibility = negotiation ? (negotiation.compatible ? 'compatible' : 'incompatible') : 'unknown';
  return `Ratary (${condensed.protocolVersion}): ${condensed.mcp.toolCount} tools; manifest at ${condensed.capabilitiesUrl}; negotiation=${compatibility}`;
}

function buildInitializeSnapshot(
  manifest: AICapabilityManifest,
  clientRequestRaw: unknown,
  options: McpInitializeSnapshotOptions = {},
): McpInitializeSnapshot {
  const capabilitiesUrl = options.capabilitiesUrl ?? '/api/v1/capabilities';
  const negotiateUrl = options.negotiateUrl ?? '/api/v1/capabilities/negotiate';
  const clientRequest = parseClientCapabilityRequest(clientRequestRaw);
  const hasClientRequest = Object.keys(clientRequest).length > 0;

  const condensed = buildCondensedCapabilityManifest(manifest, {
    mcpTransport: options.mcpTransport ?? 'stdio',
    capabilitiesUrl,
  });

  const negotiation = hasClientRequest
    ? negotiateCapabilities(manifest, clientRequest, { capabilitiesUrl, negotiateUrl })
    : undefined;

  return { condensed, negotiation };
}

export function wireMcpInitializeCapabilities(
  server: McpServer,
  resolveManifest: () => Promise<AICapabilityManifest> | AICapabilityManifest,
  options: McpInitializeSnapshotOptions = {},
): void {
  const inner = server.server as unknown as InitializeAwareServer;

  inner.setRequestHandler(InitializeRequestSchema, async (request: {
    params: {
      protocolVersion: string;
      capabilities: unknown;
      clientInfo: unknown;
      _meta?: Record<string, unknown>;
    };
  }) => {
    inner._clientCapabilities = request.params.capabilities;
    inner._clientVersion = request.params.clientInfo;

    const requestedVersion = request.params.protocolVersion;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion)
      ? requestedVersion
      : LATEST_PROTOCOL_VERSION;

    const manifest = await Promise.resolve(resolveManifest());
    const clientRequestRaw = request.params._meta?.[MCP_CAPABILITIES_REQUEST_META_KEY];
    const { condensed, negotiation } = buildInitializeSnapshot(
      manifest,
      clientRequestRaw,
      options,
    );

    return {
      protocolVersion,
      capabilities: inner.getCapabilities(),
      serverInfo: {
        name: 'ratary',
        version: condensed.version,
        title: 'Ratary',
        description: buildMcpServerInfoDescription(condensed, negotiation),
      },
      instructions: buildMcpInitializeInstructions(condensed, negotiation),
      _meta: {
        [MCP_CAPABILITIES_META_KEY]: condensed,
        ...(negotiation ? { [MCP_CAPABILITIES_NEGOTIATION_META_KEY]: negotiation } : {}),
      },
    };
  });
}
