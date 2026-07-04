import type { IPolicyEngine } from '../ports/ipolicy-engine.port.js';
import type { ITenantHierarchy } from '../ports/itenant-hierarchy.port.js';
import type { PolicyEvaluationInput, PolicyEvaluationResult } from '../types/security.types.js';

/** SQL-backed deny rules from policy_bindings when POLICY_ENGINE=rule-based. */
export class RuleBasedPolicyEngine implements IPolicyEngine {
  constructor(private readonly tenantHierarchy: ITenantHierarchy) {}

  async evaluate(input: PolicyEvaluationInput): Promise<PolicyEvaluationResult> {
    const orgId = input.scope.organizationId ?? input.hierarchy.organizationId;
    if (!orgId) {
      return { allowed: true, policyId: 'rule-based-default-allow' };
    }

    const bindings = await this.tenantHierarchy.listPolicyBindings(orgId);
    const path = input.path;

    for (const binding of bindings) {
      if (binding.effect !== 'deny') continue;
      if (matchesPattern(path, binding.resourcePattern)) {
        return {
          allowed: false,
          reason: `Denied by policy ${binding.policyPackage}`,
          policyId: binding.id,
        };
      }
    }

    return { allowed: true, policyId: 'rule-based-default-allow' };
  }
}

function matchesPattern(path: string, pattern: string): boolean {
  if (pattern === '*' || pattern === '/*') return true;
  if (pattern.endsWith('*')) {
    return path.startsWith(pattern.slice(0, -1));
  }
  return path === pattern || path.startsWith(pattern);
}
