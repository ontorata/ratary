/** Opaque deployment identity — no vendor logic in core types (ADR-029 Phase 14). */
export interface FederationNodeDescriptor {
  readonly nodeId: string;
  readonly displayName?: string;
  readonly region?: string;
  readonly cloud?: string;
  readonly baseUrl?: string;
  readonly grpcTarget?: string;
  readonly protocolVersion: string;
  readonly capabilities?: string[];
  /** Bilateral trust link for cross-organization exchange */
  readonly trusted?: boolean;
}

export interface FederationPeerFilter {
  readonly region?: string;
  readonly cloud?: string;
  readonly trustedOnly?: boolean;
}
