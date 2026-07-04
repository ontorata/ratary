import type { PluginManifest } from '../types/plugin.types.js';

/** SSOT curated provider plugin manifests (ADR-035 Phase 20). */
export const PROVIDER_PLUGIN_CATALOG: readonly PluginManifest[] = [
  {
    id: 'storage-d1',
    version: '1.0.0',
    type: 'storage',
    displayName: 'Cloudflare D1 SQL',
    description: 'Default D1 SQL storage adapter',
    implements: 'ISqlDatabase',
    envAdapterKey: 'SQL_PROVIDER',
    envAdapterValue: 'd1',
  },
  {
    id: 'storage-postgres',
    version: '1.0.0',
    type: 'storage',
    displayName: 'PostgreSQL SQL',
    description: 'PostgreSQL storage adapter',
    implements: 'ISqlDatabase',
    envAdapterKey: 'SQL_PROVIDER',
    envAdapterValue: 'postgres',
  },
  {
    id: 'embedding-noop',
    version: '1.0.0',
    type: 'embedding',
    displayName: 'No-op Embedding',
    description: 'No-op embedding provider for dev/test',
    implements: 'IEmbeddingProvider',
    envAdapterKey: 'EMBEDDING_PROVIDER',
    envAdapterValue: 'noop',
  },
  {
    id: 'embedding-openai',
    version: '1.0.0',
    type: 'embedding',
    displayName: 'OpenAI Embeddings',
    description: 'OpenAI embedding provider',
    implements: 'IEmbeddingProvider',
    envAdapterKey: 'EMBEDDING_PROVIDER',
    envAdapterValue: 'openai',
  },
  {
    id: 'vector-d1',
    version: '1.0.0',
    type: 'vector',
    displayName: 'D1 Vector Store',
    description: 'D1-backed vector store bridge',
    implements: 'IVectorStore',
    envAdapterKey: 'VECTOR_PROVIDER',
    envAdapterValue: 'd1',
  },
  {
    id: 'vector-pgvector',
    version: '1.0.0',
    type: 'vector',
    displayName: 'pgvector Store',
    description: 'PostgreSQL pgvector adapter',
    implements: 'IVectorStore',
    envAdapterKey: 'VECTOR_PROVIDER',
    envAdapterValue: 'pgvector',
  },
  {
    id: 'graph-d1',
    version: '1.0.0',
    type: 'graph',
    displayName: 'D1 Graph Adapter',
    description: 'SQL-backed graph adapter',
    implements: 'IGraphStore',
    envAdapterKey: 'GRAPH_PROVIDER',
    envAdapterValue: 'd1',
  },
  {
    id: 'graph-neo4j',
    version: '1.0.0',
    type: 'graph',
    displayName: 'Neo4j Graph Store',
    description: 'Neo4j graph adapter',
    implements: 'IGraphStore',
    envAdapterKey: 'GRAPH_PROVIDER',
    envAdapterValue: 'neo4j',
  },
  {
    id: 'llm-openai-inference',
    version: '1.0.0',
    type: 'llm',
    displayName: 'OpenAI Inference (embedding boundary)',
    description: 'LLM inference port for embedding/completion boundary only — not agent runtime',
    implements: 'ILLMInferenceProvider',
    envAdapterKey: 'EMBEDDING_PROVIDER',
    envAdapterValue: 'openai',
  },
];

export function findCatalogPlugin(pluginId: string): PluginManifest | undefined {
  return PROVIDER_PLUGIN_CATALOG.find((p) => p.id === pluginId);
}

export const PLUGIN_TYPES = ['storage', 'embedding', 'vector', 'graph', 'llm'] as const;
