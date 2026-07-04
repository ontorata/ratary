import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { AllowAllPolicyEngine } from '../security/adapters/allow-all-policy-engine.js';
import { OpaPolicyEngine } from '../security/adapters/opa-policy-engine.js';
import { RuleBasedPolicyEngine } from '../security/adapters/rule-based-policy-engine.js';
import { NoOpQuotaEnforcer } from '../security/adapters/noop-quota-enforcer.js';
import { MemoryQuotaEnforcer } from '../security/adapters/memory-quota-enforcer.js';
import { NoOpIdentityFederation } from '../security/adapters/noop-identity-federation.js';
import { OidcIdentityFederation } from '../security/adapters/oidc-identity-federation.js';
import { StaticIdpConnectorRegistry } from '../security/adapters/static-idp-connector-registry.js';
import { InMemoryComplianceAuditor } from '../security/adapters/in-memory-compliance-auditor.js';
import { NoOpTenantHierarchy } from '../security/adapters/noop-tenant-hierarchy.js';
import { SqlTenantHierarchy } from '../infrastructure/security/sql-tenant-hierarchy.js';
import type { IPolicyEngine } from '../security/ports/ipolicy-engine.port.js';
import type { IQuotaEnforcer } from '../security/ports/iquota-enforcer.port.js';
import type { IIdentityFederation } from '../security/ports/iidentity-federation.port.js';
import type { IIdpConnectorRegistry } from '../security/ports/iidp-connector.port.js';
import type { IComplianceAuditor } from '../security/ports/icompliance-auditor.port.js';
import type { ITenantHierarchy } from '../security/ports/itenant-hierarchy.port.js';
import { createPolicyMiddleware } from '../security/middleware/policy.middleware.js';
import { createQuotaMiddleware } from '../security/middleware/quota.middleware.js';

export interface SecurityPorts {
  enabled: boolean;
  tenantHierarchy: ITenantHierarchy;
  policyEngine: IPolicyEngine;
  quotaEnforcer: IQuotaEnforcer;
  identityFederation: IIdentityFederation;
  idpRegistry: IIdpConnectorRegistry;
  complianceAuditor: IComplianceAuditor;
  policyMiddleware: ReturnType<typeof createPolicyMiddleware>;
  quotaMiddleware: ReturnType<typeof createQuotaMiddleware>;
}

/**
 * Composition root for Phase 17 enterprise security (ADR-032).
 * Gated by ENTERPRISE_SECURITY_V2 — default off preserves Phase 10 behavior.
 */
export function createSecurityPorts(sql: ISqlDatabase, env: Env): SecurityPorts {
  const complianceAuditor = new InMemoryComplianceAuditor();
  const idpRegistry = new StaticIdpConnectorRegistry(env);

  if (!env.ENTERPRISE_SECURITY_V2) {
    const policyEngine = new AllowAllPolicyEngine();
    const quotaEnforcer = new NoOpQuotaEnforcer();
    const tenantHierarchy = new NoOpTenantHierarchy();
    const identityFederation = new NoOpIdentityFederation();

    return {
      enabled: false,
      tenantHierarchy,
      policyEngine,
      quotaEnforcer,
      identityFederation,
      idpRegistry,
      complianceAuditor,
      policyMiddleware: createPolicyMiddleware({
        policyEngine,
        tenantHierarchy,
        complianceAuditor,
      }),
      quotaMiddleware: createQuotaMiddleware(quotaEnforcer),
    };
  }

  const tenantHierarchy = new SqlTenantHierarchy(sql);
  const policyEngine = createPolicyEngine(env, tenantHierarchy);
  const quotaEnforcer = createQuotaEnforcer(env);
  const identityFederation = createIdentityFederation(env);

  return {
    enabled: true,
    tenantHierarchy,
    policyEngine,
    quotaEnforcer,
    identityFederation,
    idpRegistry,
    complianceAuditor,
    policyMiddleware: createPolicyMiddleware({
      policyEngine,
      tenantHierarchy,
      complianceAuditor,
    }),
    quotaMiddleware: createQuotaMiddleware(quotaEnforcer),
  };
}

function createPolicyEngine(env: Env, tenantHierarchy: ITenantHierarchy): IPolicyEngine {
  if (env.POLICY_ENGINE === 'opa' && env.OPA_URL) {
    return new OpaPolicyEngine({ baseUrl: env.OPA_URL });
  }
  if (env.POLICY_ENGINE === 'rule-based') {
    return new RuleBasedPolicyEngine(tenantHierarchy);
  }
  return new AllowAllPolicyEngine();
}

function createQuotaEnforcer(env: Env): IQuotaEnforcer {
  if (env.QUOTA_ENFORCER === 'memory') {
    return new MemoryQuotaEnforcer({
      maxRequestsPerMinute: env.QUOTA_MAX_REQUESTS_PER_MINUTE,
      maxWritesPerDay: env.QUOTA_MAX_WRITES_PER_DAY,
    });
  }
  return new NoOpQuotaEnforcer();
}

function createIdentityFederation(env: Env): IIdentityFederation {
  if (env.SSO_ENABLED && env.OIDC_ISSUER_URL && env.OIDC_CLIENT_ID) {
    return new OidcIdentityFederation({
      issuerUrl: env.OIDC_ISSUER_URL,
      clientId: env.OIDC_CLIENT_ID,
      clientSecret: env.OIDC_CLIENT_SECRET,
    });
  }
  return new NoOpIdentityFederation();
}
