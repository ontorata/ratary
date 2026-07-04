import type { IPolicyEngine } from '../ports/ipolicy-engine.port.js';
import type { PolicyEvaluationInput, PolicyEvaluationResult } from '../types/security.types.js';

export interface OpaPolicyEngineOptions {
  baseUrl: string;
  policyPath?: string;
  fetchImpl?: typeof fetch;
}

/** OPA HTTP adapter — evaluates Rego package at edge (Phase 17). */
export class OpaPolicyEngine implements IPolicyEngine {
  private readonly fetchImpl: typeof fetch;
  private readonly policyPath: string;

  constructor(private readonly options: OpaPolicyEngineOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.policyPath = options.policyPath ?? 'ai_brain/authz';
  }

  async evaluate(input: PolicyEvaluationInput): Promise<PolicyEvaluationResult> {
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/v1/data/${this.policyPath}`;
    const body = {
      input: {
        user: {
          identityId: input.user.identityId,
          ownerId: input.user.ownerId,
          permissions: input.user.permissions,
        },
        scope: input.scope,
        hierarchy: input.hierarchy,
        method: input.method,
        path: input.path,
        action: input.action,
      },
    };

    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { allowed: false, reason: `OPA HTTP ${response.status}`, policyId: 'opa' };
    }

    const parsed = (await response.json()) as { result?: { allow?: boolean; reason?: string } };
    const allowed = parsed.result?.allow === true;
    return {
      allowed,
      reason: parsed.result?.reason ?? (allowed ? undefined : 'OPA denied'),
      policyId: 'opa',
    };
  }
}
