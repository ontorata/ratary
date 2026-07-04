import type { AgentEcosystemManifest } from '../ecosystem/types/agent-ecosystem-manifest.types.js';

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
  supportsSelfManagement: boolean;
  supportsLearningEngine: boolean;
  supportsInspectionLedger: boolean;
  supportsRelationInference: boolean;
  supportsMemoryEvolution: boolean;
  supportsMultiClientSync: boolean;
  supportsEventConsumers: boolean;
  supportsRemoteMcp: boolean;
  supportsContextStream: boolean;
  supportsFederation: boolean;
  supportsAgentEcosystem: boolean;
  supportsDeveloperPlatform: boolean;
  supportsEnterpriseSecurityV2: boolean;
  supportsCloudPlatform: boolean;
  supportsObservabilityPlatform: boolean;
  supportsPluginMarketplace: boolean;
  supportsSearchGraphPlatform: boolean;
  supportsContentScalePlatform: boolean;
  supportsKnowledgeFabric: boolean;
  supportsAiBrainPlatform: boolean;
  supportsGlobalIntelligencePlatform: boolean;
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
    streaming?: boolean;
  };
  mcp: {
    enabled: boolean;
    transport: 'stdio';
    toolCount: number;
    remote?: {
      enabled: boolean;
      path?: string;
      publicUrl?: string;
    };
  };
  grpc: {
    enabled: boolean;
    port?: number;
    protoVersion?: string;
    tls?: boolean;
    streaming?: boolean;
  };
  websocket?: {
    enabled: boolean;
    path?: string;
  };
  sse?: {
    enabled: boolean;
    path?: string;
  };
  sdk: {
    packageName: '@ai-brain/sdk';
    status: 'planned' | 'published' | 'preview';
    languages?: string[];
    cliPackage?: string;
    mcpServerPackage?: string;
    openApiSpec?: string;
  };
  benchmark?: {
    cliCommand: string;
  };
}

export interface FederationManifest {
  enabled: boolean;
  nodeId: string;
  region?: string;
  cloud?: string;
  peerCount: number;
  transportProvider: string;
  supportsPull: boolean;
  supportsPush: boolean;
  supportsSubscribe: boolean;
}

export interface SecurityManifest {
  enabled: boolean;
  policyEngine: string;
  ssoEnabled: boolean;
  quotaEnforcer: string;
  hierarchyEnabled: boolean;
  supportedIdpProviders: string[];
}

export interface CloudManifest {
  enabled: boolean;
  usageMeterEnabled: boolean;
  drEnabled: boolean;
  defaultRegion: string;
  cloudProvisioner: string;
  usageMeterStore: string;
}

export interface ObservabilityManifest {
  enabled: boolean;
  metricsPath: string;
  logShipper: string;
  otelEnabled: boolean;
  dashboardPacks: string[];
}

export interface InfrastructureManifest {
  platform: string;
  protocols: string[];
  plugins: Record<string, { active: string; available: string[]; envFallback: string }>;
  marketplace: {
    catalogVersion: string;
    source: string;
    entryCount: number;
  };
  federation?: {
    catalogSync: boolean;
    catalogVersion?: string;
  };
}

export interface SearchGraphManifest {
  platform: string;
  searchProvider: string;
  graphProvider: string;
  meilisearchConfigured: boolean;
  neo4jConfigured: boolean;
  graphVectorSeedsEnabled: boolean;
  supportsIncrementalSync: boolean;
  lastRuns: Record<string, { id: string; status: string; finishedAt?: string }>;
}

export interface ContentScaleManifest {
  platform: string;
  objectStorageProvider: string;
  vectorProvider: string;
  embeddingProvider: string;
  contentOffloadConfigured: boolean;
  pgvectorConfigured: boolean;
  embeddingJobConfigured: boolean;
  contentOffloadMinBytes: number;
  supportsIncrementalSync: boolean;
  lastRuns: Record<string, { id: string; status: string; finishedAt?: string }>;
}

export interface KnowledgeFabricManifest {
  platform: string;
  enabled: boolean;
  connectors: Array<{ id: string; configured: boolean }>;
  supportsIncrementalIngest: boolean;
  lastRuns: Record<string, { id: string; status: string; finishedAt?: string; connectorId?: string }>;
}

export interface AiBrainPlatformManifest {
  platform: string;
  edition: string;
  planes: Array<{ id: string; label: string; enabled: boolean; availableInEdition: boolean }>;
  webhooksEnabled: boolean;
  activeWebhookCount: number;
  composedPhases: string[];
}

export interface GlobalIntelligenceManifest {
  platform: string;
  enabled: boolean;
  telemetryEnabled: boolean;
  analyticsEnabled: boolean;
  syncEnabled: boolean;
  composedPhases: string[];
  syncTiers: string[];
  telemetryEventCount: number;
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
  federation?: FederationManifest;
  security?: SecurityManifest;
  cloud?: CloudManifest;
  observability?: ObservabilityManifest;
  infrastructure?: InfrastructureManifest;
  searchGraph?: SearchGraphManifest;
  contentScale?: ContentScaleManifest;
  knowledgeFabric?: KnowledgeFabricManifest;
  aiBrainPlatform?: AiBrainPlatformManifest;
  globalIntelligence?: GlobalIntelligenceManifest;
  ecosystem: AgentEcosystemManifest;
  retrieval: {
    progressivePolicyVersion: string;
    retrievalPolicy: string;
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
