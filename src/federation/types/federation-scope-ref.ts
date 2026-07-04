/** Remote or local scope pointer for federation exchange (ADR-029 Phase 14). */
export interface FederationScopeRef {
  readonly nodeId: string;
  readonly ownerId: string;
  readonly workspaceId?: string;
  readonly organizationId?: string;
  readonly agentId?: string;
  readonly region?: string;
  readonly cloud?: string;
}
