import type { ICandidateProvider } from './candidate-provider.port.js';
import {
  assertRecallRequest,
  type RecallRequest,
  type RecallResult,
  RecallResultSchema,
} from './recall-contracts.js';
import { createRecallTrace } from './recall-trace.js';

/**
 * Wave 1 skeleton: orchestrates request validation, candidate fetch, and trace emission.
 * Ranking/policy integration is deferred to Wave 3.
 */
export class RecallService {
  constructor(private readonly candidateProvider: ICandidateProvider) {}

  async recall(request: RecallRequest): Promise<RecallResult> {
    const started = Date.now();
    const validated = assertRecallRequest(request);
    const candidateSet = await this.candidateProvider.provideCandidates(validated);
    const trace = createRecallTrace(validated, candidateSet);

    return RecallResultSchema.parse({
      requestId: validated.requestId,
      traceId: trace.traceId,
      organizationId: validated.organizationId,
      candidates: candidateSet.candidates,
      rankedCandidates: candidateSet.candidates,
      status: 'completed',
      latencyMs: Date.now() - started,
    });
  }
}
