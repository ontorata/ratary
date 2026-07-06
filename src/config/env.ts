import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

/** Always load repo-root `.env` — MCP/Cursor may run with a different cwd. */
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: resolve(projectRoot, '.env'), quiet: true });

/** Legacy env aliases after Ratary rebrand (Ontorata). */
if (
  process.env.RATARY_PLATFORM_ENABLED === undefined &&
  process.env.AI_BRAIN_PLATFORM_ENABLED !== undefined
) {
  process.env.RATARY_PLATFORM_ENABLED = process.env.AI_BRAIN_PLATFORM_ENABLED;
}
if (
  process.env.RATARY_PLATFORM_EDITION === undefined &&
  process.env.AI_BRAIN_PLATFORM_EDITION !== undefined
) {
  process.env.RATARY_PLATFORM_EDITION = process.env.AI_BRAIN_PLATFORM_EDITION;
}

import { z } from 'zod';
import {
  DEFAULT_GRAPH_MAX_DEPTH,
  DEFAULT_GRAPH_MAX_DEPTH_MVP,
  DEFAULT_GRAPH_MAX_NEIGHBORS,
  DEFAULT_GRAPH_SEED_CAP,
} from '../graph/graph.config.js';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    // Cloudflare D1 credentials (required when SQL_PROVIDER=d1)
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
    D1_DATABASE_ID: z.string().min(1).optional(),
    D1_API_TOKEN: z.string().min(1).optional(),

    // PostgreSQL (required when SQL_PROVIDER=postgres) — ADR-009
    DATABASE_URL: z.string().url().optional(),

    // Identity layer — HMAC secret for hashing API keys (min 32 chars)
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters').optional(),

    // Embedding layer (Phase 5)
    EMBEDDING_PROVIDER: z.enum(['noop', 'openai', 'local']).default('noop'),
    EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
    EMBEDDING_API_KEY: z.string().optional(),
    EMBEDDING_BASE_URL: z.string().default('https://api.openai.com/v1'),
    EMBEDDING_BATCH_SIZE: z.coerce.number().int().positive().default(32),
    EMBEDDING_JOB_MAX_MEMORIES: z.coerce.number().int().positive().default(10_000),
    EMBEDDING_MAX_RETRIES: z.coerce.number().int().positive().default(3),

    // Hybrid retrieval (Phase 6)
    HYBRID_RETRIEVAL: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Graph retrieval (Phase 8) — ADR-006 Appendix C
    GRAPH_RETRIEVAL: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    GRAPH_MAX_DEPTH: z.coerce
      .number()
      .int()
      .min(1)
      .max(DEFAULT_GRAPH_MAX_DEPTH_MVP)
      .default(DEFAULT_GRAPH_MAX_DEPTH),
    GRAPH_SEED_CAP: z.coerce.number().int().positive().default(DEFAULT_GRAPH_SEED_CAP),
    GRAPH_MAX_NEIGHBORS: z.coerce.number().int().positive().default(DEFAULT_GRAPH_MAX_NEIGHBORS),

    // Platform infrastructure (Phase 10)
    SQL_PROVIDER: z
      .enum(['d1', 'postgres', 'mariadb', 'mysql', 'tidb', 'cockroachdb', 'supabase'])
      .default('postgres'),
    MARIADB_CONNECTION_STRING: z.string().min(1).optional(),
    VECTOR_PROVIDER: z.enum(['d1', 'pgvector']).default('d1'),
    PGVECTOR_DATABASE_URL: z.string().url().optional(),
    OBJECT_STORAGE_PROVIDER: z
      .enum(['inline', 'r2', 's3', 'minio', 'azure', 'gcs'])
      .default('inline'),
    R2_BUCKET_NAME: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    S3_BUCKET_NAME: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_FORCE_PATH_STYLE: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    MINIO_ENDPOINT: z.string().url().optional(),
    MINIO_BUCKET: z.string().min(1).optional(),
    MINIO_ACCESS_KEY_ID: z.string().min(1).optional(),
    MINIO_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    MINIO_REGION: z.string().min(1).default('us-east-1'),
    MINIO_USE_SSL: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    AZURE_STORAGE_CONNECTION_STRING: z.string().min(1).optional(),
    AZURE_CONTAINER_NAME: z.string().min(1).optional(),
    GCS_BUCKET_NAME: z.string().min(1).optional(),
    GCS_KEY_FILE: z.string().min(1).optional(),
    CACHE_PROVIDER: z.enum(['none', 'memory', 'redis']).default('none'),
    REDIS_URL: z.string().url().optional(),
    RATE_LIMIT_REDIS_URL: z.string().url().optional(),
    REDIS_KEY_PREFIX: z.string().default('ratary:cache:'),
    EVENT_BUS_PROVIDER: z.enum(['none', 'noop', 'redis']).default('none'),
    EVENT_CONSUMERS_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    REDIS_STREAM_PREFIX: z.string().default('ratary:events:'),
    REDIS_STREAM_CONSUMER_GROUP: z.string().default('ratary-consumers'),
    REDIS_STREAM_CONSUMER_NAME: z.string().default('ratary-worker'),
    ANALYTICS_PROVIDER: z.enum(['none', 'duckdb', 'clickhouse']).default('none'),
    DUCKDB_PATH: z.string().default(':memory:'),
    CLICKHOUSE_URL: z.string().url().optional(),
    CLICKHOUSE_DATABASE: z.string().min(1).default('ratary'),
    CLICKHOUSE_USERNAME: z.string().min(1).default('default'),
    CLICKHOUSE_PASSWORD: z.string().optional(),
    GRAPH_PROVIDER: z.enum(['d1', 'neo4j', 'neptune']).default('d1'),
    NEO4J_URI: z.string().url().optional(),
    NEO4J_USERNAME: z.string().min(1).optional(),
    NEO4J_PASSWORD: z.string().min(1).optional(),
    NEPTUNE_ENDPOINT: z.string().url().optional(),
    SEARCH_PROVIDER: z.enum(['sql', 'meilisearch', 'opensearch']).default('sql'),
    MEILISEARCH_HOST: z.string().url().optional(),
    MEILISEARCH_API_KEY: z.string().optional(),
    MEILISEARCH_INDEX: z.string().min(1).optional(),
    OPENSEARCH_NODE: z.string().url().optional(),
    OPENSEARCH_INDEX: z.string().min(1).optional(),
    OPENSEARCH_USERNAME: z.string().min(1).optional(),
    OPENSEARCH_PASSWORD: z.string().optional(),
    OTEL_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    OTEL_SERVICE_NAME: z.string().default('ratary'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default('http://127.0.0.1:4318/v1/traces'),
    ENTERPRISE_RBAC: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Enterprise security (Phase 17) — ADR-032; default off preserves Phase 10 behavior
    ENTERPRISE_SECURITY_V2: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    POLICY_ENGINE: z.enum(['none', 'allow-all', 'opa', 'rule-based']).default('none'),
    OPA_URL: z.string().url().optional(),
    SSO_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    OIDC_ISSUER_URL: z.string().url().optional(),
    OIDC_CLIENT_ID: z.string().min(1).optional(),
    OIDC_CLIENT_SECRET: z.string().optional(),
    QUOTA_ENFORCER: z.enum(['none', 'memory']).default('none'),
    QUOTA_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(1000),
    QUOTA_MAX_WRITES_PER_DAY: z.coerce.number().int().positive().default(10_000),

    MEMORY_ACCESS_AUDIT: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    RETRIEVAL_POLICY: z.enum(['default', 'legacy', 'adaptive']).default('default'),
    RETRIEVAL_POLICY_VERSION: z.string().default('1'),
    RETRIEVAL_RELATION_NEIGHBOR_CAP: z.coerce.number().int().min(0).max(30).default(5),

    COMPRESSION_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    COMPRESSION_POLICY: z.enum(['rule', 'llm']).default('rule'),
    COMPRESSION_SCHEDULER: z.enum(['none', 'local']).default('none'),
    SUMMARIZER_API_KEY: z.string().optional(),
    SUMMARIZER_MODEL: z.string().default('gpt-4o-mini'),
    SUMMARIZER_BASE_URL: z.string().url().optional(),

    SIGNAL_INGEST_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    SIGNAL_STORE_PROVIDER: z.enum(['none', 'sql']).default('none'),
    RANKING_ADAPTATION_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Learning intelligence engine (Phase 8.6) — ADR-057, async policy adaptation
    LEARNING_ENGINE_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    LEARNING_STORE_PROVIDER: z.enum(['none', 'sql']).default('none'),

    // Inspection pattern ledger (Phase 8.8) — ADR-059, batch pattern mining from inspection signals
    INSPECTION_LEDGER_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    INSPECTION_LEDGER_STORE_PROVIDER: z.enum(['none', 'sql']).default('none'),
    INSPECTION_CHARTER_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Precision search platform (Phase 6.6) — ADR-060
    PRECISION_SEARCH_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    SEARCH_IGNORE_PATTERNS: z.string().optional(),
    SEARCH_DEFAULT_MODE: z.enum(['hybrid', 'semantic', 'fulltext', 'title']).default('hybrid'),
    MULTI_QUERY_RRF_K: z.coerce.number().int().min(1).max(500).default(60),
    SEARCH_MAX_QUERIES: z.coerce.number().int().min(1).max(20).default(5),
    ALIAS_EXACT_BOOST: z.coerce.number().int().min(0).max(1000).default(500),
    TITLE_FUZZY_BOOST: z.coerce.number().int().min(1).max(10).default(3),
    SEARCH_ENRICH_LINK_CAP: z.coerce.number().int().min(0).max(100).default(20),
    SEARCH_RERANK_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    RERANK_MODEL_PATH: z.string().optional(),

    // Graph relation inference (Phase 8.7) — ADR-041, async inferred edges
    RELATION_INFERENCE_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    RELATION_INFERENCE_STORE_PROVIDER: z.enum(['none', 'sql']).default('none'),

    // Memory evolution & version control (Phase 09.7) — ADR-040
    MEMORY_EVOLUTION_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    MEMORY_EVOLUTION_STORE_PROVIDER: z.enum(['none', 'sql']).default('none'),

    // Multi-client memory sync (Phase 09.8) — ADR-042
    MULTI_CLIENT_SYNC_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    MULTI_CLIENT_SYNC_STORE_PROVIDER: z.enum(['none', 'sql']).default('none'),
    MULTI_CLIENT_SYNC_STRATEGY: z.enum(['lww', 'field_merge', 'manual_queue']).default('lww'),

    // Self-managing memory stewardship (Phase 04.7) — ADR-045, deterministic maintenance pipeline
    MEMORY_STEWARDSHIP_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER: z.enum(['memory', 'sql']).default('memory'),
    MEMORY_STEWARDSHIP_SCHEDULER: z.enum(['none', 'local']).default('none'),

    // Transport & connectivity (Phase 10.5E) — gRPC opt-in, ADR-027
    GRPC_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    // 0 = OS-assigned ephemeral port (useful for tests/dynamic binding)
    GRPC_PORT: z.coerce.number().int().min(0).max(65535).default(50051),
    GRPC_HOST: z.string().min(1).default('0.0.0.0'),
    GRPC_TLS_CERT_PATH: z.string().min(1).optional(),
    GRPC_TLS_KEY_PATH: z.string().min(1).optional(),

    // Protocol layer (Phase 13) — ADR-028; additive streaming adapters, default off
    SSE_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    WEBSOCKET_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    WEBSOCKET_PATH: z.string().min(1).default('/api/v1/ws'),
    SSE_MAX_CONCURRENT_PER_IP: z.coerce.number().int().min(1).max(1000).default(10),
    SSE_STREAM_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10_000).default(30),
    SSE_STREAM_RATE_LIMIT_WINDOW: z.string().min(1).default('1 minute'),

    // Remote MCP (Phase 13.1) — ADR-048; ChatGPT Server URL, default off
    REMOTE_MCP_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    REMOTE_MCP_PATH: z.string().min(1).default('/mcp'),
    REMOTE_MCP_CORS_ORIGINS: z.string().default('*'),
    REMOTE_MCP_PUBLIC_URL: z.string().url().optional(),
    REMOTE_MCP_OAUTH_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    /** Required in production — acknowledges in-memory MCP sessions need a persistent host (R-CFG-05). */
    REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    /** Maps validated OIDC access tokens to an existing owner scope for remote MCP OAuth. */
    OIDC_MCP_OWNER_ID: z.string().uuid().optional(),

    // Federation layer (Phase 14) — ADR-029; cross-node knowledge exchange, default off
    FEDERATION_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    FEDERATION_NODE_ID: z.string().uuid().default('00000000-0000-4000-8000-000000000001'),
    FEDERATION_NODE_DISPLAY_NAME: z.string().default('ratary'),
    FEDERATION_NODE_REGION: z.string().optional(),
    FEDERATION_NODE_CLOUD: z.string().optional(),
    FEDERATION_NODE_BASE_URL: z.string().url().optional(),
    FEDERATION_PEERS_JSON: z.string().default('[]'),
    FEDERATION_REGISTRY_PROVIDER: z.enum(['static']).default('static'),
    FEDERATION_TRANSPORT_PROVIDER: z.enum(['in-process', 'grpc', 'rest']).default('in-process'),
    FEDERATION_TRUST_PROVIDER: z.enum(['noop', 'registry', 'file']).default('noop'),
    FEDERATION_TRUST_FILE_PATH: z.string().min(1).optional(),
    FEDERATION_POLICY_PROVIDER: z.enum(['rule-based']).default('rule-based'),
    FEDERATION_METADATA_PROVIDER: z.enum(['none', 'sql']).default('none'),

    // Cloud platform (Phase 18) — ADR-033; control plane metadata orchestration, default off
    CONTROL_PLANE_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    USAGE_METER_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    DR_PLATFORM_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    CLOUD_DEFAULT_REGION: z.string().min(1).default('local'),
    CLOUD_PROVISIONER: z.enum(['none', 'manual']).default('manual'),
    USAGE_METER_STORE: z.enum(['memory', 'sql']).default('memory'),

    // Observability platform (Phase 19) — ADR-034; exporters + dashboard packs, default off
    OBSERVABILITY_PLATFORM: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    OBS_METRICS_PATH: z.string().min(1).default('/metrics'),
    OBS_LOG_SHIPPER: z.enum(['none', 'stdout', 'loki']).default('stdout'),
    OBS_LOKI_PUSH_URL: z.string().url().optional(),
    OBS_COST_METRICS_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    COST_EMBEDDING_USD_PER_REQUEST: z.coerce.number().min(0).default(0.00002),
    COST_ESTIMATED_BYTES_PER_MEMORY: z.coerce.number().int().min(0).default(4096),

    // AI infrastructure platform (Phase 20) — ADR-035; plugin marketplace, default off
    PLUGIN_MARKETPLACE_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    PLUGIN_SIGNATURE_REQUIRED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    PLUGIN_TRUSTED_PUBLIC_KEYS: z.string().optional(),
    PLUGIN_MARKETPLACE_SOURCE: z.enum(['local', 'remote']).default('local'),
    PLUGIN_FEDERATION_CATALOG_SYNC: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Search & graph production platform (Phase 21) — ADR-022; Meilisearch/Neo4j sync ops, default off
    SEARCH_GRAPH_PLATFORM_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    GRAPH_VECTOR_SEEDS_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Content & vector scale platform (Phase 22) — ADR-021; R2/pgvector/embedding ops, default off
    CONTENT_SCALE_PLATFORM_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    CONTENT_OFFLOAD_MIN_BYTES: z.coerce.number().int().min(0).default(8192),
    CONTENT_OFFLOAD_CLEAR_INLINE: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Enterprise knowledge fabric (Phase 23) — ADR-047; external connector ingest, default off
    KNOWLEDGE_FABRIC_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    KNOWLEDGE_FABRIC_CATALOG_JSON: z.string().default('{}'),
    SLACK_BOT_TOKEN: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    GITLAB_TOKEN: z.string().optional(),
    JIRA_API_TOKEN: z.string().optional(),
    CONFLUENCE_API_TOKEN: z.string().optional(),
    CONFLUENCE_BASE_URL: z.string().optional(),
    CONFLUENCE_EMAIL: z.string().optional(),
    GOOGLE_DRIVE_CREDENTIALS_JSON: z.string().optional(),
    GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
    SHAREPOINT_CLIENT_SECRET: z.string().optional(),
    FABRIC_EMAIL_IMAP_URL: z.string().optional(),
    TEAMS_WEBHOOK_URL: z.string().optional(),
    NOTION_API_TOKEN: z.string().optional(),
    NOTION_API_VERSION: z.string().default('2022-06-28'),
    CONNECTOR_SYNC_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    CONNECTOR_WEBHOOK_SECRET: z.string().optional(),
    CONNECTOR_SYNC_INTERVAL_MS: z.coerce.number().int().min(0).default(0),

    // Ratary platform umbrella (Phase 24) — ADR-044; edition + webhooks, default off
    RATARY_PLATFORM_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    RATARY_PLATFORM_EDITION: z.enum(['core', 'standard', 'enterprise']).default('core'),
    PLATFORM_WEBHOOKS_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Global AI intelligence capstone (Phase 25) — ADR-036; telemetry + analytics + sync, default off
    GLOBAL_INTELLIGENCE_PLATFORM_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    TELEMETRY_CONTENT_SAMPLING: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.AUTH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['AUTH_SECRET'],
        message: 'AUTH_SECRET is required in production',
      });
    }

    if (env.EMBEDDING_PROVIDER === 'openai' && !env.EMBEDDING_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['EMBEDDING_API_KEY'],
        message: 'EMBEDDING_API_KEY is required when EMBEDDING_PROVIDER=openai',
      });
    }

    if (env.SQL_PROVIDER === 'd1') {
      if (!env.CLOUDFLARE_ACCOUNT_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['CLOUDFLARE_ACCOUNT_ID'],
          message: 'CLOUDFLARE_ACCOUNT_ID is required when SQL_PROVIDER=d1',
        });
      }
      if (!env.D1_DATABASE_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['D1_DATABASE_ID'],
          message: 'D1_DATABASE_ID is required when SQL_PROVIDER=d1',
        });
      }
      if (!env.D1_API_TOKEN) {
        ctx.addIssue({
          code: 'custom',
          path: ['D1_API_TOKEN'],
          message: 'D1_API_TOKEN is required when SQL_PROVIDER=d1',
        });
      }
    }

    if (
      (env.SQL_PROVIDER === 'postgres' ||
        env.SQL_PROVIDER === 'tidb' ||
        env.SQL_PROVIDER === 'cockroachdb' ||
        env.SQL_PROVIDER === 'supabase') &&
      !env.DATABASE_URL
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message:
          'DATABASE_URL is required when SQL_PROVIDER=postgres, tidb, cockroachdb, or supabase',
      });
    }

    if (env.OBJECT_STORAGE_PROVIDER === 'r2') {
      const accountId = env.R2_ACCOUNT_ID ?? env.CLOUDFLARE_ACCOUNT_ID;
      if (!accountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_ACCOUNT_ID'],
          message:
            'R2_ACCOUNT_ID or CLOUDFLARE_ACCOUNT_ID is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
      if (!env.R2_BUCKET_NAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_BUCKET_NAME'],
          message: 'R2_BUCKET_NAME is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
      if (!env.R2_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_ACCESS_KEY_ID'],
          message: 'R2_ACCESS_KEY_ID is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
      if (!env.R2_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_SECRET_ACCESS_KEY'],
          message: 'R2_SECRET_ACCESS_KEY is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
    }

    if (env.VECTOR_PROVIDER === 'pgvector' && !env.PGVECTOR_DATABASE_URL && !env.DATABASE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['PGVECTOR_DATABASE_URL'],
        message: 'PGVECTOR_DATABASE_URL or DATABASE_URL is required when VECTOR_PROVIDER=pgvector',
      });
    }

    if (env.CACHE_PROVIDER === 'redis' && !env.REDIS_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required when CACHE_PROVIDER=redis',
      });
    }

    if (env.EVENT_BUS_PROVIDER === 'redis' && !env.REDIS_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required when EVENT_BUS_PROVIDER=redis',
      });
    }

    if (env.EVENT_CONSUMERS_ENABLED && env.EVENT_BUS_PROVIDER !== 'redis') {
      ctx.addIssue({
        code: 'custom',
        path: ['EVENT_BUS_PROVIDER'],
        message: 'EVENT_BUS_PROVIDER=redis is required when EVENT_CONSUMERS_ENABLED=true',
      });
    }

    if (env.OBJECT_STORAGE_PROVIDER === 's3') {
      if (!env.S3_BUCKET_NAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_BUCKET_NAME'],
          message: 'S3_BUCKET_NAME is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
      if (!env.S3_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_ACCESS_KEY_ID'],
          message: 'S3_ACCESS_KEY_ID is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
      if (!env.S3_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_SECRET_ACCESS_KEY'],
          message: 'S3_SECRET_ACCESS_KEY is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
      if (!env.S3_REGION) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_REGION'],
          message: 'S3_REGION is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
    }

    if (env.OBJECT_STORAGE_PROVIDER === 'minio') {
      if (!env.MINIO_ENDPOINT) {
        ctx.addIssue({
          code: 'custom',
          path: ['MINIO_ENDPOINT'],
          message: 'MINIO_ENDPOINT is required when OBJECT_STORAGE_PROVIDER=minio',
        });
      }
      if (!env.MINIO_BUCKET) {
        ctx.addIssue({
          code: 'custom',
          path: ['MINIO_BUCKET'],
          message: 'MINIO_BUCKET is required when OBJECT_STORAGE_PROVIDER=minio',
        });
      }
      if (!env.MINIO_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['MINIO_ACCESS_KEY_ID'],
          message: 'MINIO_ACCESS_KEY_ID is required when OBJECT_STORAGE_PROVIDER=minio',
        });
      }
      if (!env.MINIO_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['MINIO_SECRET_ACCESS_KEY'],
          message: 'MINIO_SECRET_ACCESS_KEY is required when OBJECT_STORAGE_PROVIDER=minio',
        });
      }
    }

    if (env.OBJECT_STORAGE_PROVIDER === 'azure') {
      if (!env.AZURE_STORAGE_CONNECTION_STRING) {
        ctx.addIssue({
          code: 'custom',
          path: ['AZURE_STORAGE_CONNECTION_STRING'],
          message: 'AZURE_STORAGE_CONNECTION_STRING is required when OBJECT_STORAGE_PROVIDER=azure',
        });
      }
      if (!env.AZURE_CONTAINER_NAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['AZURE_CONTAINER_NAME'],
          message: 'AZURE_CONTAINER_NAME is required when OBJECT_STORAGE_PROVIDER=azure',
        });
      }
    }

    if (env.OBJECT_STORAGE_PROVIDER === 'gcs') {
      if (!env.GCS_BUCKET_NAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['GCS_BUCKET_NAME'],
          message: 'GCS_BUCKET_NAME is required when OBJECT_STORAGE_PROVIDER=gcs',
        });
      }
    }

    if (env.ANALYTICS_PROVIDER === 'clickhouse' && !env.CLICKHOUSE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['CLICKHOUSE_URL'],
        message: 'CLICKHOUSE_URL is required when ANALYTICS_PROVIDER=clickhouse',
      });
    }

    if (
      (env.SQL_PROVIDER === 'mariadb' || env.SQL_PROVIDER === 'mysql') &&
      !env.MARIADB_CONNECTION_STRING
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['MARIADB_CONNECTION_STRING'],
        message:
          'MARIADB_CONNECTION_STRING is required when SQL_PROVIDER=mariadb or SQL_PROVIDER=mysql',
      });
    }

    if (env.GRAPH_PROVIDER === 'neo4j') {
      if (!env.NEO4J_URI) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEO4J_URI'],
          message: 'NEO4J_URI is required when GRAPH_PROVIDER=neo4j',
        });
      }
      if (!env.NEO4J_USERNAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEO4J_USERNAME'],
          message: 'NEO4J_USERNAME is required when GRAPH_PROVIDER=neo4j',
        });
      }
      if (!env.NEO4J_PASSWORD) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEO4J_PASSWORD'],
          message: 'NEO4J_PASSWORD is required when GRAPH_PROVIDER=neo4j',
        });
      }
    }

    if (env.GRAPH_PROVIDER === 'neptune' && !env.NEPTUNE_ENDPOINT) {
      ctx.addIssue({
        code: 'custom',
        path: ['NEPTUNE_ENDPOINT'],
        message: 'NEPTUNE_ENDPOINT is required when GRAPH_PROVIDER=neptune',
      });
    }

    if (env.GRPC_ENABLED) {
      const hasCert = Boolean(env.GRPC_TLS_CERT_PATH);
      const hasKey = Boolean(env.GRPC_TLS_KEY_PATH);
      if (hasCert !== hasKey) {
        ctx.addIssue({
          code: 'custom',
          path: [hasCert ? 'GRPC_TLS_KEY_PATH' : 'GRPC_TLS_CERT_PATH'],
          message: 'GRPC_TLS_CERT_PATH and GRPC_TLS_KEY_PATH must be set together for mTLS',
        });
      }
    }

    if (env.SEARCH_PROVIDER === 'meilisearch') {
      if (!env.MEILISEARCH_HOST) {
        ctx.addIssue({
          code: 'custom',
          path: ['MEILISEARCH_HOST'],
          message: 'MEILISEARCH_HOST is required when SEARCH_PROVIDER=meilisearch',
        });
      }
      if (!env.MEILISEARCH_INDEX) {
        ctx.addIssue({
          code: 'custom',
          path: ['MEILISEARCH_INDEX'],
          message: 'MEILISEARCH_INDEX is required when SEARCH_PROVIDER=meilisearch',
        });
      }
    }

    if (env.SEARCH_PROVIDER === 'opensearch') {
      if (!env.OPENSEARCH_NODE) {
        ctx.addIssue({
          code: 'custom',
          path: ['OPENSEARCH_NODE'],
          message: 'OPENSEARCH_NODE is required when SEARCH_PROVIDER=opensearch',
        });
      }
      if (!env.OPENSEARCH_INDEX) {
        ctx.addIssue({
          code: 'custom',
          path: ['OPENSEARCH_INDEX'],
          message: 'OPENSEARCH_INDEX is required when SEARCH_PROVIDER=opensearch',
        });
      }
    }

    if (env.REMOTE_MCP_OAUTH_ENABLED) {
      if (!env.REMOTE_MCP_ENABLED) {
        ctx.addIssue({
          code: 'custom',
          path: ['REMOTE_MCP_OAUTH_ENABLED'],
          message: 'REMOTE_MCP_ENABLED must be true when REMOTE_MCP_OAUTH_ENABLED=true',
        });
      }
      if (!env.OIDC_ISSUER_URL) {
        ctx.addIssue({
          code: 'custom',
          path: ['OIDC_ISSUER_URL'],
          message: 'OIDC_ISSUER_URL is required when REMOTE_MCP_OAUTH_ENABLED=true',
        });
      }
      if (!env.OIDC_MCP_OWNER_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['OIDC_MCP_OWNER_ID'],
          message: 'OIDC_MCP_OWNER_ID is required when REMOTE_MCP_OAUTH_ENABLED=true',
        });
      }
    }

    if (
      env.REMOTE_MCP_ENABLED &&
      env.NODE_ENV === 'production' &&
      !env.REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED'],
        message:
          'Set REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED=true in production when REMOTE_MCP_ENABLED (persistent host or single instance required)',
      });
    }

    if (
      env.FEDERATION_ENABLED &&
      env.FEDERATION_TRUST_PROVIDER === 'file' &&
      !env.FEDERATION_TRUST_FILE_PATH
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['FEDERATION_TRUST_FILE_PATH'],
        message: 'FEDERATION_TRUST_FILE_PATH is required when FEDERATION_TRUST_PROVIDER=file',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}
