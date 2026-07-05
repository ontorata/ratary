/** Fastify/OpenAPI JSON schemas for capability discovery (ADR-025, D7.5-03). */

export const clientCapabilityRequestOpenApiSchema = {
  type: 'object',
  properties: {
    protocolVersion: { type: 'string', description: 'Client Ratary protocol version' },
    clientInfo: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
      },
      required: ['name', 'version'],
    },
    requiredCapabilities: {
      type: 'array',
      items: { type: 'string' },
      description: 'Capability flag keys that must be enabled on the server',
    },
    preferredCapabilities: {
      type: 'array',
      items: { type: 'string' },
      description: 'Optional capability flag keys the client prefers',
    },
    transports: {
      type: 'array',
      items: { type: 'string', enum: ['rest', 'mcp', 'stdio', 'mcp-remote', 'streamable-http', 'grpc'] },
      description: 'Transports the client can use',
    },
  },
} as const;

export const capabilityMatchGroupsOpenApiSchema = {
  type: 'object',
  properties: {
    required: { type: 'array', items: { type: 'string' } },
    preferred: { type: 'array', items: { type: 'string' } },
    transports: { type: 'array', items: { type: 'string' } },
  },
  required: ['required', 'preferred', 'transports'],
} as const;

export const capabilityNegotiationResultOpenApiSchema = {
  type: 'object',
  properties: {
    compatible: { type: 'boolean' },
    negotiatedProtocolVersion: { type: 'string' },
    serverProtocolVersion: { type: 'string' },
    supportedProtocolVersions: { type: 'array', items: { type: 'string' } },
    matched: capabilityMatchGroupsOpenApiSchema,
    missing: capabilityMatchGroupsOpenApiSchema,
    serverEnabledCapabilities: { type: 'array', items: { type: 'string' } },
    capabilitiesUrl: { type: 'string' },
    negotiateUrl: { type: 'string' },
    clientInfo: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
  },
  required: [
    'compatible',
    'negotiatedProtocolVersion',
    'serverProtocolVersion',
    'supportedProtocolVersions',
    'matched',
    'missing',
    'serverEnabledCapabilities',
    'capabilitiesUrl',
    'negotiateUrl',
    'timestamp',
  ],
} as const;
