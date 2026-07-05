import type { FederationScopeRef } from './federation-scope-ref.js';

export interface FederationPullRequest {
  readonly source: FederationScopeRef;
  readonly target: FederationScopeRef;
  readonly memoryIds?: string[];
  readonly cursor?: string | null;
  readonly limit?: number;
}

export interface FederationPushResult {
  readonly accepted: number;
  readonly rejected: number;
}

export interface FederationExchangeResult {
  readonly peerId: string;
  readonly direction: 'pull' | 'push';
  readonly accepted: number;
  readonly rejected: number;
  readonly bundleId?: string;
  readonly cursor?: string | null;
  readonly timestamp: string;
}

export interface FederationCredentials {
  readonly token?: string;
  readonly certificateRef?: string;
}

export interface FederationTrustContext {
  readonly peerId: string;
  readonly trusted: boolean;
}

export interface FederationStatusResult {
  readonly enabled: boolean;
  readonly nodeId: string;
  readonly peerCount: number;
  readonly peers: Array<{
    nodeId: string;
    displayName?: string;
    region?: string;
    trusted?: boolean;
  }>;
  readonly lastExchangeAt?: string;
}
