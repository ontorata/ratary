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
import type { AICapabilityManifest } from './capability-manifest.types.js';
import { MCP_TOOL_NAMES } from './mcp-tool-names.js';

export interface CapabilityManifestBuilderOptions {
  openApiUrl?: string;
  packageVersion?: string;
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
        },
        mcp: {
          enabled: true,
          transport: 'stdio',
          toolCount: MCP_TOOL_NAMES.length,
        },
        grpc: {
          enabled: this.env.GRPC_ENABLED,
          ...(this.env.GRPC_ENABLED
            ? {
                port: this.env.GRPC_PORT,
                protoVersion: 'v1',
                tls: Boolean(this.env.GRPC_TLS_CERT_PATH && this.env.GRPC_TLS_KEY_PATH),
              }
            : {}),
        },
        sdk: {
          packageName: '@ai-brain/client',
          status: 'planned',
        },
      },
      retrieval: {
        progressivePolicyVersion: this.env.RETRIEVAL_POLICY_VERSION,
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
