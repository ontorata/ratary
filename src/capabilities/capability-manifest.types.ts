export interface ErrorCodeDescriptor {
  code: string;
  httpStatus: number;
  when: string;
}

export interface RateLimitDescriptor {
  capabilityGroup: string;
  limit: string;
  scope: string;
  notes?: string;
}

export interface CapabilityFlags {
  supportsMemoryCRUD: boolean;
  supportsMemoryBackup: boolean;
  supportsMemoryImport: boolean;
  supportsKnowledge: boolean;
  supportsCodename: boolean;
  supportsSlug: boolean;
  supportsKeywords: boolean;
  supportsCategories: boolean;
  supportsContextBuilder: boolean;
  supportsPromptBuilder: boolean;
  supportsRetrieval: boolean;
  supportsHybridRetrieval: boolean;
  supportsRelations: boolean;
  supportsEmbedding: boolean;
  supportsSemanticSearch: boolean;
  supportsKnowledgeGraph: boolean;
  supportsWorkspace: boolean;
  supportsOrganization: boolean;
  supportsOwnerScope: boolean;
  supportsWorkspaceScope: boolean;
  supportsAgentAttribution: boolean;
  supportsSemanticCompression: boolean;
  supportsQualitySignals: boolean;
  supportsEventSubscription: boolean;
  supportsProgressiveRetrieval: boolean;
}

export interface CapabilityLimits {
  maxContextTokens: number;
  maxMemoryContentBytes: number;
  maxResultsPerSearch: number;
  maxRelationsPerMemory: number;
}

export interface TransportManifest {
  rest: {
    enabled: boolean;
    version: 'v1';
    baseUrl: string;
  };
  mcp: {
    enabled: boolean;
    transport: 'stdio';
    toolCount: number;
  };
  grpc: {
    enabled: boolean;
    port?: number;
    protoVersion?: string;
    tls?: boolean;
  };
  sdk: {
    packageName: '@ai-brain/client';
    status: 'planned' | 'published';
  };
}

export interface AICapabilityManifest {
  protocolVersion: string;
  version: string;
  capabilities: CapabilityFlags;
  limits: CapabilityLimits;
  errorCodes: ErrorCodeDescriptor[];
  rateLimits: RateLimitDescriptor[];
  mcp: {
    toolNames: string[];
    toolCount: number;
    transport: 'stdio';
  };
  rest: {
    version: 'v1';
    openApiUrl: string;
  };
  transport: TransportManifest;
  retrieval: {
    progressivePolicyVersion: string;
    defaultContentMode: 'summary' | 'full';
  };
  deployment: {
    sqlProvider: string;
    vectorProvider: string;
    graphProvider: string;
    searchProvider: string;
  };
  timestamp: string;
}
