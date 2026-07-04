import type { AuthUser } from '../../auth/auth.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { HierarchyContext } from './hierarchy.types.js';

export interface PolicyEvaluationInput {
  readonly user: AuthUser;
  readonly scope: MemoryScope;
  readonly hierarchy: HierarchyContext;
  readonly method: string;
  readonly path: string;
  readonly action: 'read' | 'write' | 'admin';
}

export interface PolicyEvaluationResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly policyId?: string;
}

export interface QuotaCheckInput {
  readonly user: AuthUser;
  readonly scope: MemoryScope;
  readonly method: string;
  readonly path: string;
  readonly action: 'read' | 'write';
}

export interface QuotaStatus {
  readonly requestsRemaining?: number;
  readonly writesRemaining?: number;
  readonly windowSeconds: number;
}

export interface ComplianceAuditEvent {
  readonly eventType: string;
  readonly actorId: string;
  readonly organizationId?: string;
  readonly workspaceId?: string;
  readonly resource: string;
  readonly action: string;
  readonly outcome: 'allow' | 'deny';
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: string;
}

export interface SsoLoginRequest {
  readonly provider: string;
  readonly redirectUri: string;
  readonly state?: string;
}

export interface SsoCallbackInput {
  readonly provider: string;
  readonly code: string;
  readonly state?: string;
  readonly redirectUri: string;
}

export interface SsoIdentityResult {
  readonly subject: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly claims: Record<string, unknown>;
}
