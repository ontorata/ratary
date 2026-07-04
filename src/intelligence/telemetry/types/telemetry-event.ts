export const TELEMETRY_EVENT_TYPES = [
  'MemoryAccessed',
  'MemoryCreated',
  'MemoryUpdated',
  'SearchExecuted',
  'ContextBuilt',
  'PromptGenerated',
  'AgentConnected',
  'SDKConnected',
  'ModelInvoked',
  'SyncCompleted',
] as const;

export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

export interface TelemetryScopeRef {
  workspaceId?: string;
  organizationId?: string;
  agentId?: string;
  region?: string;
  ownerId?: string;
}

export interface TelemetryEventBase {
  type: TelemetryEventType;
}

export interface MemoryAccessedTelemetry extends TelemetryEventBase {
  type: 'MemoryAccessed';
  memoryId: string;
  accessPath: string;
  latencyMs?: number;
  cacheHit?: boolean;
}

export interface MemoryCreatedTelemetry extends TelemetryEventBase {
  type: 'MemoryCreated';
  memoryId: string;
  bytes?: number;
  hasEmbedding?: boolean;
  sourceProtocol?: string;
}

export interface MemoryUpdatedTelemetry extends TelemetryEventBase {
  type: 'MemoryUpdated';
  memoryId: string;
  changedFields?: string[];
}

export interface SearchExecutedTelemetry extends TelemetryEventBase {
  type: 'SearchExecuted';
  mode: string;
  resultCount: number;
  latencyMs?: number;
}

export interface ContextBuiltTelemetry extends TelemetryEventBase {
  type: 'ContextBuilt';
  tokenBudget?: number;
  tokensUsed?: number;
  memoryCount?: number;
  truncated?: boolean;
}

export interface PromptGeneratedTelemetry extends TelemetryEventBase {
  type: 'PromptGenerated';
  template?: string;
  tokenCount?: number;
}

export interface AgentConnectedTelemetry extends TelemetryEventBase {
  type: 'AgentConnected';
  agentId?: string;
  clientKind?: string;
  protocol?: string;
}

export interface SDKConnectedTelemetry extends TelemetryEventBase {
  type: 'SDKConnected';
  sdkVersion?: string;
  protocol?: string;
}

export interface ModelInvokedTelemetry extends TelemetryEventBase {
  type: 'ModelInvoked';
  providerLabel: string;
  operation: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
}

export interface SyncCompletedTelemetry extends TelemetryEventBase {
  type: 'SyncCompleted';
  tier: string;
  applied?: number;
  conflicts?: number;
  lagMs?: number;
}

export type TelemetryEvent =
  | MemoryAccessedTelemetry
  | MemoryCreatedTelemetry
  | MemoryUpdatedTelemetry
  | SearchExecutedTelemetry
  | ContextBuiltTelemetry
  | PromptGeneratedTelemetry
  | AgentConnectedTelemetry
  | SDKConnectedTelemetry
  | ModelInvokedTelemetry
  | SyncCompletedTelemetry;

export interface TelemetryEnvelope {
  eventId: string;
  type: TelemetryEventType;
  occurredAt: string;
  scope: TelemetryScopeRef;
  nodeId: string;
  traceId?: string;
  spanId?: string;
  attributes: Record<string, string | number | boolean>;
  redaction: 'none' | 'hashed' | 'aggregated';
  payload: TelemetryEvent;
}
