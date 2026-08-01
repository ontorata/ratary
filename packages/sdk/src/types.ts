export interface MemoryRecord {
  id: string;
  title: string;
  content: string;
  summary?: string;
  project?: string;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateMemoryInput {
  title: string;
  content: string;
  summary?: string;
  project?: string;
  tags?: string[];
  favorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryInput {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  favorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ListMemoriesParams {
  project?: string;
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface SearchMemoriesParams {
  q: string;
  limit?: number;
  project?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface BuildContextInput {
  task: string;
  maxTokens?: number;
  project?: string;
}

export interface BuildContextResult {
  context: string;
  prompt?: string;
  memoryCount?: number;
  /** ADR-1011 Context Package envelope (additive). */
  packageId?: string;
  ownerId?: string;
  createdAt?: string;
  confidence?: 'high' | 'medium' | 'low' | number;
  /** ADR-1016 model id (`confidence-product-v1` default). */
  confidenceModel?: 'heuristic-top-relevance-v1' | 'confidence-product-v1' | string;
  updateMechanism?: string;
  /** ADR-1013 — mint is `active`; retire/archive transition APIs deferred. */
  lifecycleState?: 'active' | 'retired' | 'archived';
  sourceLabels?: readonly string[];
  query?: string;
  system?: string;
  user?: string;
  [key: string]: unknown;
}

export type CapabilityManifest = Record<string, unknown>;

export interface ClientCapabilityRequest {
  protocolVersion?: string;
  clientInfo?: { name: string; version: string };
  requiredCapabilities?: string[];
  preferredCapabilities?: string[];
  transports?: string[];
}

export interface CapabilityNegotiationResult {
  compatible: boolean;
  negotiatedProtocolVersion: string;
  serverProtocolVersion: string;
  supportedProtocolVersions: readonly string[];
  matched: {
    required: string[];
    preferred: string[];
    transports: string[];
  };
  missing: {
    required: string[];
    preferred: string[];
    transports: string[];
  };
  serverEnabledCapabilities: string[];
  capabilitiesUrl: string;
  negotiateUrl: string;
  clientInfo?: { name: string; version: string };
  timestamp: string;
}

export interface EcosystemClientProfile {
  clientType: string;
  displayName: string;
  primaryProtocol: string;
  supportedProtocols: string[];
  [key: string]: unknown;
}

export interface FederationPeer {
  nodeId: string;
  displayName?: string;
  [key: string]: unknown;
}

export type GovernanceExceptionClass = 'decay_protection' | 'feature_flag_off' | 'ops_maintenance';

export type GovernanceExceptionStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface GovernanceExceptionAuditEntry {
  at: string;
  action: string;
  actor?: string;
  note?: string;
}

export interface GovernanceExceptionRecord {
  exceptionId: string;
  ownerId: string;
  exceptionClass: GovernanceExceptionClass;
  rationale: string;
  status: GovernanceExceptionStatus;
  requestedBy: string;
  requestedAt: string;
  expiresAt?: string;
  auditLog: GovernanceExceptionAuditEntry[];
}

export interface CreateGovernanceExceptionInput {
  exceptionClass: GovernanceExceptionClass;
  rationale: string;
  expiresAt?: string;
}

export type PolicyDenialPoint = 'write' | 'recall' | 'stewardship';

export interface PolicyDenialEvent {
  denialId: string;
  ownerId: string;
  point: PolicyDenialPoint;
  policyModuleId?: string;
  reasonCode: string;
  occurredAt: string;
  memoryId?: string;
  resource?: string;
}

export interface PolicyDenialSummary {
  since: string;
  byPoint: Record<PolicyDenialPoint, number>;
  total: number;
}

export interface RecommendationCard {
  cardId: string;
  title: string;
  advisory: true;
  memoryId?: string;
  sourceReference: string;
  confidence?: number;
  evidenceRefs: string[];
  reason: string;
}

export interface FetchRecommendationsInput {
  query: string;
  limit?: number;
}

export interface FetchRecommendationsResult {
  traceId: string;
  cards: RecommendationCard[];
  advisory: true;
}

export interface CreateDecisionProvenanceInput {
  briefId: string;
  packageId?: string;
  verdict: 'accepted' | 'rejected';
  rationale?: string;
  sourceMemoryIds?: string[];
  decisionModelId?: string;
  decisionModelVersion?: string;
  decisionModelPluginDigest?: string;
  sandboxOutcome?: 'ok' | 'timeout' | 'error' | 'denied' | 'disabled';
}

export interface DecisionModelComputedPluginSummary {
  kind: 'worker';
  artifactDigestPrefix: string;
}

export interface DecisionModelCatalogEntry {
  id: string;
  version: string;
  displayName: string;
  description?: string;
  stability: 'experimental' | 'stable' | 'deprecated';
  executionProfileName: string;
  capabilities: string[];
  computedPlugin?: DecisionModelComputedPluginSummary;
}

export interface DecisionModelCatalogResponse {
  models: DecisionModelCatalogEntry[];
}

export interface DecisionProvenanceRecord {
  recordId: string;
  ownerId: string;
  briefId: string;
  packageId?: string;
  verdict: 'accepted' | 'rejected';
  rationale?: string;
  sourceMemoryIds: string[];
  decisionModelId?: string;
  decisionModelVersion?: string;
  decisionModelPluginDigest?: string;
  sandboxOutcome?: 'ok' | 'timeout' | 'error' | 'denied' | 'disabled';
  recordedAt: string;
}
