import type { FederationScopeRef } from './federation-scope-ref.js';

export interface FederatedMemoryRecord {
  readonly sourceMemoryId: string;
  readonly codename?: string;
  readonly slug?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly body?: string;
  readonly objectKey?: string;
  readonly metadata: Record<string, unknown>;
  readonly updatedAt: string;
}

export interface FederatedRelationRecord {
  readonly sourceRelationId: string;
  readonly fromMemoryId: string;
  readonly toMemoryId: string;
  readonly relationType: string;
}

export interface FederatedMemoryBundle {
  readonly bundleId: string;
  readonly source: FederationScopeRef;
  readonly target: FederationScopeRef;
  readonly memories: FederatedMemoryRecord[];
  readonly relations?: FederatedRelationRecord[];
  readonly exportedAt: string;
  readonly contentHash: string;
  readonly signature?: string;
}
