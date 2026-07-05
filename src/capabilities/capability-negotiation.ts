import type { AICapabilityManifest } from './capability-manifest.types.js';
import {
  PROTOCOL_VERSION,
  SUPPORTED_AI_BRAIN_PROTOCOL_VERSIONS,
} from './capability-manifest.constants.js';
import type {
  BuildCapabilityNegotiationOptions,
  CapabilityNegotiationResult,
  ClientCapabilityRequest,
} from './capability-negotiation.types.js';

function parseProtocolVersion(version: string): { major: number; minor: number } {
  const [majorRaw, minorRaw = '0'] = version.split('.');
  return {
    major: Number.parseInt(majorRaw, 10) || 0,
    minor: Number.parseInt(minorRaw, 10) || 0,
  };
}

function isSameMajorProtocol(clientVersion: string, serverVersion: string): boolean {
  return parseProtocolVersion(clientVersion).major === parseProtocolVersion(serverVersion).major;
}

export function negotiateProtocolVersion(
  clientVersion: string | undefined,
  serverVersion: string = PROTOCOL_VERSION,
  supported: readonly string[] = SUPPORTED_AI_BRAIN_PROTOCOL_VERSIONS,
): { negotiatedProtocolVersion: string; compatible: boolean } {
  if (!clientVersion) {
    return { negotiatedProtocolVersion: serverVersion, compatible: true };
  }

  if (supported.includes(clientVersion)) {
    return { negotiatedProtocolVersion: clientVersion, compatible: true };
  }

  if (isSameMajorProtocol(clientVersion, serverVersion)) {
    return { negotiatedProtocolVersion: serverVersion, compatible: true };
  }

  return { negotiatedProtocolVersion: serverVersion, compatible: false };
}

function isCapabilityFlagKey(
  manifest: AICapabilityManifest,
  key: string,
): key is keyof AICapabilityManifest['capabilities'] {
  return Object.prototype.hasOwnProperty.call(manifest.capabilities, key);
}

function matchCapabilityKeys(
  manifest: AICapabilityManifest,
  keys: string[] | undefined,
): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const key of keys ?? []) {
    if (!isCapabilityFlagKey(manifest, key) || !manifest.capabilities[key]) {
      missing.push(key);
    } else {
      matched.push(key);
    }
  }

  return { matched, missing };
}

function isTransportAvailable(manifest: AICapabilityManifest, transport: string): boolean {
  switch (transport) {
    case 'rest':
      return manifest.transport.rest.enabled;
    case 'mcp':
    case 'stdio':
      return manifest.transport.mcp.enabled;
    case 'mcp-remote':
    case 'streamable-http':
      return Boolean(manifest.transport.mcp.remote?.enabled);
    case 'grpc':
      return manifest.transport.grpc.enabled;
    case 'sse':
      return Boolean(manifest.transport.sse?.enabled);
    case 'websocket':
      return Boolean(manifest.transport.websocket?.enabled);
    default:
      return false;
  }
}

function matchTransports(
  manifest: AICapabilityManifest,
  transports: string[] | undefined,
): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const transport of transports ?? []) {
    if (isTransportAvailable(manifest, transport)) {
      matched.push(transport);
    } else {
      missing.push(transport);
    }
  }

  return { matched, missing };
}

export function listEnabledCapabilityFlags(
  manifest: AICapabilityManifest,
): Array<keyof AICapabilityManifest['capabilities'] & string> {
  return Object.entries(manifest.capabilities)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof AICapabilityManifest['capabilities'] & string)
    .sort();
}

export function negotiateCapabilities(
  manifest: AICapabilityManifest,
  request: ClientCapabilityRequest = {},
  options: BuildCapabilityNegotiationOptions = {},
): CapabilityNegotiationResult {
  const protocol = negotiateProtocolVersion(request.protocolVersion, manifest.protocolVersion);
  const required = matchCapabilityKeys(manifest, request.requiredCapabilities);
  const preferred = matchCapabilityKeys(manifest, request.preferredCapabilities);
  const transports = matchTransports(manifest, request.transports);

  const compatible =
    protocol.compatible && required.missing.length === 0 && transports.missing.length === 0;

  return {
    compatible,
    negotiatedProtocolVersion: protocol.negotiatedProtocolVersion,
    serverProtocolVersion: manifest.protocolVersion,
    supportedProtocolVersions: SUPPORTED_AI_BRAIN_PROTOCOL_VERSIONS,
    matched: {
      required: required.matched,
      preferred: preferred.matched,
      transports: transports.matched,
    },
    missing: {
      required: required.missing,
      preferred: preferred.missing,
      transports: transports.missing,
    },
    serverEnabledCapabilities: listEnabledCapabilityFlags(manifest),
    capabilitiesUrl: options.capabilitiesUrl ?? '/api/v1/capabilities',
    negotiateUrl: options.negotiateUrl ?? '/api/v1/capabilities/negotiate',
    ...(request.clientInfo ? { clientInfo: request.clientInfo } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function parseClientCapabilityRequest(value: unknown): ClientCapabilityRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const clientInfo =
    record.clientInfo &&
    typeof record.clientInfo === 'object' &&
    !Array.isArray(record.clientInfo) &&
    typeof (record.clientInfo as Record<string, unknown>).name === 'string' &&
    typeof (record.clientInfo as Record<string, unknown>).version === 'string'
      ? {
          name: (record.clientInfo as Record<string, string>).name,
          version: (record.clientInfo as Record<string, string>).version,
        }
      : undefined;

  const readStringArray = (key: string): string[] | undefined => {
    const raw = record[key];
    if (!Array.isArray(raw)) return undefined;
    return raw.filter((item): item is string => typeof item === 'string');
  };

  return {
    ...(typeof record.protocolVersion === 'string'
      ? { protocolVersion: record.protocolVersion }
      : {}),
    ...(clientInfo ? { clientInfo } : {}),
    ...(readStringArray('requiredCapabilities')
      ? { requiredCapabilities: readStringArray('requiredCapabilities') }
      : {}),
    ...(readStringArray('preferredCapabilities')
      ? { preferredCapabilities: readStringArray('preferredCapabilities') }
      : {}),
    ...(readStringArray('transports') ? { transports: readStringArray('transports') } : {}),
  };
}
