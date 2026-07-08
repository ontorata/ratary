import type { ICandidateProvider } from './candidate-provider.port.js';
import type { IRecallPolicy } from './recall-policy.port.js';
import {
  assertRecallRequest,
  type RecallRequest,
  type RecallResult,
  RecallResultSchema,
} from './recall-contracts.js';
import { assembleContextPackage } from './context-package-assembler.js';
import { createRecallTrace } from './recall-trace.js';

/**
 * Wave 4: RecallService with policy ranking + context assembly.
 * Orchestrates: validate → fetch candidates → apply policy → assemble context → emit trace.
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
      decisionPath: ['candidate_fetch', 'policy_filter', 'rank', 'assemble'],
      policyVersion: this.recallPolicy.policyVersion,
    });
    const contextPackage = assembleContextPackage({
      request: validated,
      traceId: trace.traceId,
      decision,
      rankedCandidates,
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
      contextPackage,
    });
  }
}
