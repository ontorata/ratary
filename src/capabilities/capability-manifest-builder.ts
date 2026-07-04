import type { Env } from '../config/env.js';
import { MAX_CONTEXT_MAX_CHARS } from '../memory/context.config.js';
import {
  MANIFEST_MAX_CONTEXT_TOKENS,
  MANIFEST_MAX_MEMORY_CONTENT_BYTES,
  MANIFEST_MAX_RELATIONS_PER_MEMORY,
  MANIFEST_MAX_RESULTS_PER_SEARCH,
  PROTOCOL_VERSION,
  STANDARD_ERROR_CODES,
  STANDARD_RATE_LIMITS,
} from './capability-manifest.constants.js';
import { AgentEcosystemManifestBuilder } from '../ecosystem/builders/agent-ecosystem-manifest-builder.js';
import type { AICapabilityManifest } from './capability-manifest.types.js';
import type { InfrastructurePlatformManifest } from '../infrastructure-platform/types/marketplace.types.js';
import type { SearchGraphPlatformManifest } from '../search-graph-platform/types/sync.types.js';
import type { ContentScalePlatformManifest } from '../content-scale-platform/types/sync.types.js';
import type { KnowledgeFabricPlatformManifest } from '../knowledge-fabric-platform/types/ingest.types.js';
import type { AiBrainPlatformManifest } from '../ai-brain-platform/types/platform.types.js';
import type { GlobalIntelligencePlatformManifest } from '../intelligence/sync/types/sync.types.js';
import { MCP_TOOL_NAMES } from './mcp-tool-names.js';

function parsePeerCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export interface CapabilityManifestBuilderOptions {
  openApiUrl?: string;
  packageVersion?: string;
  infrastructure?: InfrastructurePlatformManifest;
  searchGraph?: SearchGraphPlatformManifest;
  contentScale?: ContentScalePlatformManifest;
  knowledgeFabric?: KnowledgeFabricPlatformManifest;
  aiBrainPlatform?: AiBrainPlatformManifest;
  globalIntelligence?: GlobalIntelligencePlatformManifest;
}

export class CapabilityManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly options: CapabilityManifestBuilderOptions = {},
  ) {}

  build(): AICapabilityManifest {
    const embeddingActive = this.env.EMBEDDING_PROVIDER !== 'noop';
    const hybridActive = this.env.HYBRID_RETRIEVAL && embeddingActive;
    const graphTraversalActive = this.env.GRAPH_RETRIEVAL || this.env.GRAPH_PROVIDER === 'neo4j';

    return {
      protocolVersion: PROTOCOL_VERSION,
      version: this.options.packageVersion ?? '1.0.0',
      capabilities: {
        supportsMemoryCRUD: true,
        supportsMemoryBackup: true,
        supportsMemoryImport: true,
        supportsKnowledge: true,
        supportsCodename: true,
        supportsSlug: true,
        supportsKeywords: true,
        supportsCategories: true,
        supportsContextBuilder: true,
        supportsPromptBuilder: true,
        supportsRetrieval: true,
        supportsHybridRetrieval: hybridActive,
        supportsRelations: true,
        supportsEmbedding: embeddingActive,
        supportsSemanticSearch: hybridActive,
        supportsKnowledgeGraph: graphTraversalActive,
        supportsWorkspace: true,
        supportsOrganization: this.env.ENTERPRISE_RBAC,
        supportsOwnerScope: true,
        supportsWorkspaceScope: true,
        supportsAgentAttribution: true,
        supportsSemanticCompression: this.env.COMPRESSION_ENABLED,
        supportsQualitySignals: this.env.SIGNAL_INGEST_ENABLED,
        supportsEventSubscription: this.env.EVENT_BUS_PROVIDER !== 'none',
        supportsProgressiveRetrieval: true,
        supportsSelfManagement: Boolean(this.env.MEMORY_STEWARDSHIP_ENABLED),
        supportsLearningEngine: this.env.LEARNING_ENGINE_ENABLED,
        supportsInspectionLedger: this.env.INSPECTION_LEDGER_ENABLED,
        supportsRelationInference: this.env.RELATION_INFERENCE_ENABLED,
        supportsMemoryEvolution: this.env.MEMORY_EVOLUTION_ENABLED,
        supportsMultiClientSync: this.env.MULTI_CLIENT_SYNC_ENABLED,
        supportsEventConsumers: this.env.EVENT_CONSUMERS_ENABLED,
        supportsRemoteMcp: this.env.REMOTE_MCP_ENABLED,
        supportsContextStream: this.env.SSE_ENABLED || this.env.GRPC_ENABLED || this.env.WEBSOCKET_ENABLED,
        supportsFederation: this.env.FEDERATION_ENABLED,
        supportsAgentEcosystem: true,
        supportsDeveloperPlatform: true,
        supportsEnterpriseSecurityV2: this.env.ENTERPRISE_SECURITY_V2,
        supportsCloudPlatform: this.env.CONTROL_PLANE_ENABLED,
        supportsObservabilityPlatform: this.env.OBSERVABILITY_PLATFORM,
        supportsPluginMarketplace: this.env.PLUGIN_MARKETPLACE_ENABLED,
        supportsSearchGraphPlatform: this.env.SEARCH_GRAPH_PLATFORM_ENABLED,
        supportsContentScalePlatform: this.env.CONTENT_SCALE_PLATFORM_ENABLED,
        supportsKnowledgeFabric: this.env.KNOWLEDGE_FABRIC_ENABLED,
        supportsAiBrainPlatform: this.env.AI_BRAIN_PLATFORM_ENABLED,
        supportsGlobalIntelligencePlatform: this.env.GLOBAL_INTELLIGENCE_PLATFORM_ENABLED,
      },
      limits: {
        maxContextTokens: Math.floor(MAX_CONTEXT_MAX_CHARS / 4) || MANIFEST_MAX_CONTEXT_TOKENS,
        maxMemoryContentBytes: MANIFEST_MAX_MEMORY_CONTENT_BYTES,
        maxResultsPerSearch: MANIFEST_MAX_RESULTS_PER_SEARCH,
        maxRelationsPerMemory: MANIFEST_MAX_RELATIONS_PER_MEMORY,
      },
      errorCodes: STANDARD_ERROR_CODES,
      rateLimits: STANDARD_RATE_LIMITS,
      mcp: {
        toolNames: [...MCP_TOOL_NAMES],
        toolCount: MCP_TOOL_NAMES.length,
        transport: 'stdio',
      },
      rest: {
        version: 'v1',
        openApiUrl: this.options.openApiUrl ?? '/docs/json',
      },
      transport: {
        rest: {
          enabled: true,
          version: 'v1',
          baseUrl: '/api/v1',
          streaming: this.env.SSE_ENABLED,
        },
        mcp: {
          enabled: true,
          transport: 'stdio',
          toolCount: MCP_TOOL_NAMES.length,
          remote: {
            enabled: this.env.REMOTE_MCP_ENABLED,
            ...(this.env.REMOTE_MCP_ENABLED
              ? {
                  path: this.env.REMOTE_MCP_PATH,
                  ...(this.env.REMOTE_MCP_PUBLIC_URL
                    ? { publicUrl: this.env.REMOTE_MCP_PUBLIC_URL }
                    : {}),
                  oauthEnabled:
                    this.env.REMOTE_MCP_OAUTH_ENABLED && Boolean(this.env.OIDC_ISSUER_URL),
                }
              : {}),
          },
        },
        grpc: {
          enabled: this.env.GRPC_ENABLED,
          streaming: this.env.GRPC_ENABLED,
          ...(this.env.GRPC_ENABLED
            ? {
                port: this.env.GRPC_PORT,
                protoVersion: 'v1',
                tls: Boolean(this.env.GRPC_TLS_CERT_PATH && this.env.GRPC_TLS_KEY_PATH),
              }
            : {}),
        },
        ...(this.env.WEBSOCKET_ENABLED
          ? { websocket: { enabled: true, path: this.env.WEBSOCKET_PATH } }
          : {}),
        ...(this.env.SSE_ENABLED
          ? { sse: { enabled: true, path: '/api/v1/context/stream' } }
          : {}),
        sdk: {
          packageName: '@ai-brain/sdk',
          status: 'published',
          languages: ['typescript', 'go', 'python', 'java', 'rust', 'csharp', 'php'],
          cliPackage: '@ai-brain/cli',
          mcpServerPackage: '@ai-brain/mcp-server',
          openApiSpec: 'packages/openapi/ai-brain-v1.openapi.json',
        },
        benchmark: {
          cliCommand: 'npm run benchmark:protocols',
        },
      },
      ...(this.env.FEDERATION_ENABLED
        ? {
            federation: {
              enabled: true,
              nodeId: this.env.FEDERATION_NODE_ID,
              ...(this.env.FEDERATION_NODE_REGION
                ? { region: this.env.FEDERATION_NODE_REGION }
                : {}),
              ...(this.env.FEDERATION_NODE_CLOUD ? { cloud: this.env.FEDERATION_NODE_CLOUD } : {}),
              peerCount: parsePeerCount(this.env.FEDERATION_PEERS_JSON),
              transportProvider: this.env.FEDERATION_TRANSPORT_PROVIDER,
              supportsPull: true,
              supportsPush: true,
              supportsSubscribe: false,
            },
          }
        : {}),
      ...(this.env.ENTERPRISE_SECURITY_V2
        ? {
            security: {
              enabled: true,
              policyEngine: this.env.POLICY_ENGINE,
              ssoEnabled: this.env.SSO_ENABLED,
              quotaEnforcer: this.env.QUOTA_ENFORCER,
              hierarchyEnabled: true,
              supportedIdpProviders: ['azure-ad', 'okta', 'keycloak', 'google-workspace'],
            },
          }
        : {}),
      ...(this.env.CONTROL_PLANE_ENABLED
        ? {
            cloud: {
              enabled: true,
              usageMeterEnabled: this.env.USAGE_METER_ENABLED,
              drEnabled: this.env.DR_PLATFORM_ENABLED,
              defaultRegion: this.env.CLOUD_DEFAULT_REGION,
              cloudProvisioner: this.env.CLOUD_PROVISIONER,
              usageMeterStore: this.env.USAGE_METER_STORE,
            },
          }
        : {}),
      ...(this.env.OBSERVABILITY_PLATFORM
        ? {
            observability: {
              enabled: true,
              metricsPath: this.env.OBS_METRICS_PATH,
              logShipper: this.env.OBS_LOG_SHIPPER,
              otelEnabled: this.env.OTEL_ENABLED,
              dashboardPacks: ['overview', 'memory', 'embedding', 'graph', 'federation', 'cost'],
            },
          }
        : {}),
      ...(this.options.infrastructure
        ? { infrastructure: this.options.infrastructure }
        : {}),
      ...(this.options.searchGraph ? { searchGraph: this.options.searchGraph } : {}),
      ...(this.options.contentScale ? { contentScale: this.options.contentScale } : {}),
      ...(this.options.knowledgeFabric ? { knowledgeFabric: this.options.knowledgeFabric } : {}),
      ...(this.options.aiBrainPlatform ? { aiBrainPlatform: this.options.aiBrainPlatform } : {}),
      ...(this.options.globalIntelligence ? { globalIntelligence: this.options.globalIntelligence } : {}),
      ecosystem: new AgentEcosystemManifestBuilder(this.env).buildSync(),
      retrieval: {
        progressivePolicyVersion: this.env.RETRIEVAL_POLICY_VERSION,
        retrievalPolicy: this.env.RETRIEVAL_POLICY,
        defaultContentMode: 'summary',
      },
      deployment: {
        sqlProvider: this.env.SQL_PROVIDER,
        vectorProvider: this.env.VECTOR_PROVIDER,
        graphProvider: this.env.GRAPH_PROVIDER,
        searchProvider: this.env.SEARCH_PROVIDER,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
