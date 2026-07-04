import type { PolicyEvaluationInput, PolicyEvaluationResult } from '../types/security.types.js';

export interface IPolicyEngine {
  evaluate(input: PolicyEvaluationInput): Promise<PolicyEvaluationResult>;
}
