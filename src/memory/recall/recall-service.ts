import type { ICandidateProvider } from './candidate-provider.port.js';
import type { IRecallPolicy } from './recall-policy.port.js';
import {
  assertRecallRequest,
  type RecallRequest,
  type RecallResult,
  RecallResultSchema,
} from './recall-contracts.js';
import { createRecallTrace } from './recall-trace.js';

/**
 * Wave 3: RecallService with policy integration.
 * Orchestrates request validation → candidate fetch → policy ranking → trace emission.
 */
export class RecallService {
  constructor(
    private readonly candidateProvider: ICandidateProvider,
    private readonly recallPolicy: IRecallPolicy,
  ) {}

  async recall(request: RecallRequest): Promise<RecallResult> {
    const started = Date.now();
    const validated = assertRecallRequest(request);
    const candidateSet = await this.candidateProvider.provideCandidates(validated);
    const { rankedCandidates, decision } = await this.recallPolicy.applyPolicy(
      validated,
      candidateSet,
    );
    const trace = createRecallTrace(validated, candidateSet, {
      decisionPath: ['candidate_fetch', 'policy_filter', 'rank'],
      policyVersion: this.recallPolicy.policyVersion,
    });

    return RecallResultSchema.parse({
      requestId: validated.requestId,
      traceId: trace.traceId,
      organizationId: validated.organizationId,
      candidates: candidateSet.candidates,
      rankedCandidates,
      status: 'completed',
      latencyMs: Date.now() - started,
      decision,
    });
  }
}
