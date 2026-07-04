export type {
  DepartmentDescriptor,
  TenantProjectDescriptor,
  HierarchyContext,
  PolicyBindingDescriptor,
} from './hierarchy.types.js';
export type {
  PolicyEvaluationInput,
  PolicyEvaluationResult,
  QuotaCheckInput,
  QuotaStatus,
  ComplianceAuditEvent,
  SsoLoginRequest,
  SsoCallbackInput,
  SsoIdentityResult,
} from './security.types.js';

export interface SecurityManifest {
  enabled: boolean;
  policyEngine: string;
  ssoEnabled: boolean;
  quotaEnforcer: string;
  hierarchyEnabled: boolean;
  supportedIdpProviders: string[];
}
