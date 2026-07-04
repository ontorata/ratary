import type { IMetricsExporter } from '../ports/imetrics-exporter.port.js';

/** Registers v1 metric catalog namespaces (ADR-034). */
export function registerObservabilityMetricCatalog(exporter: IMetricsExporter): void {
  const metrics = [
    { name: 'ai_brain_http_requests_total', type: 'counter' as const, help: 'Total HTTP requests' },
    {
      name: 'ai_brain_http_request_duration_seconds',
      type: 'histogram' as const,
      help: 'HTTP request duration in seconds',
    },
    {
      name: 'ai_brain_memory_operations_total',
      type: 'counter' as const,
      help: 'Memory CRUD operations',
    },
    {
      name: 'ai_brain_memory_search_duration_seconds',
      type: 'histogram' as const,
      help: 'Memory search latency',
    },
    {
      name: 'ai_brain_embedding_requests_total',
      type: 'counter' as const,
      help: 'Embedding provider requests',
    },
    {
      name: 'ai_brain_embedding_duration_seconds',
      type: 'histogram' as const,
      help: 'Embedding provider latency',
    },
    {
      name: 'ai_brain_graph_query_duration_seconds',
      type: 'histogram' as const,
      help: 'Graph traversal latency',
    },
    {
      name: 'ai_brain_federation_sync_lag_seconds',
      type: 'gauge' as const,
      help: 'Federation peer sync lag',
    },
    {
      name: 'ai_brain_federation_egress_bytes_total',
      type: 'counter' as const,
      help: 'Federation egress bytes',
    },
    {
      name: 'ai_brain_cost_embedding_estimate_usd',
      type: 'gauge' as const,
      help: 'Estimated embedding cost USD',
    },
    {
      name: 'ai_brain_cost_storage_bytes',
      type: 'gauge' as const,
      help: 'Estimated storage bytes',
    },
    {
      name: 'ai_brain_protocol_request_duration_seconds',
      type: 'histogram' as const,
      help: 'Protocol request duration by transport',
    },
    {
      name: 'ai_brain_cloud_operations_total',
      type: 'counter' as const,
      help: 'Control plane operations',
    },
    {
      name: 'ai_brain_plugin_lifecycle_total',
      type: 'counter' as const,
      help: 'Plugin register/enable/disable lifecycle events',
    },
    {
      name: 'ai_brain_search_graph_sync_total',
      type: 'counter' as const,
      help: 'Search/graph production sync job completions',
    },
    {
      name: 'ai_brain_content_scale_sync_total',
      type: 'counter' as const,
      help: 'Content/vector scale sync job completions',
    },
  ];

  for (const metric of metrics) {
    exporter.registerMetric(metric);
  }
}

export const ObservabilityMetricNames = {
  HTTP_REQUESTS_TOTAL: 'ai_brain_http_requests_total',
  HTTP_REQUEST_DURATION: 'ai_brain_http_request_duration_seconds',
  MEMORY_OPERATIONS: 'ai_brain_memory_operations_total',
  MEMORY_SEARCH_DURATION: 'ai_brain_memory_search_duration_seconds',
  EMBEDDING_REQUESTS: 'ai_brain_embedding_requests_total',
  EMBEDDING_DURATION: 'ai_brain_embedding_duration_seconds',
  GRAPH_QUERY_DURATION: 'ai_brain_graph_query_duration_seconds',
  FEDERATION_SYNC_LAG: 'ai_brain_federation_sync_lag_seconds',
  FEDERATION_EGRESS_BYTES: 'ai_brain_federation_egress_bytes_total',
  COST_EMBEDDING_USD: 'ai_brain_cost_embedding_estimate_usd',
  COST_STORAGE_BYTES: 'ai_brain_cost_storage_bytes',
  PROTOCOL_REQUEST_DURATION: 'ai_brain_protocol_request_duration_seconds',
  CLOUD_OPERATIONS: 'ai_brain_cloud_operations_total',
} as const;
