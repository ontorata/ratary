import type { IPolicyEngine } from '../ports/ipolicy-engine.port.js';
import type { PolicyEvaluationInput, PolicyEvaluationResult } from '../types/security.types.js';

/** Default deny-nothing policy engine when POLICY_ENGINE=allow-all or none. */
export class AllowAllPolicyEngine implements IPolicyEngine {
  async evaluate(_input: PolicyEvaluationInput): Promise<PolicyEvaluationResult> {
    return { allowed: true, policyId: 'allow-all' };
  }
}
