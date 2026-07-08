import { randomUUID } from 'node:crypto';
import type { CandidateSet, RecallRequest, RecallTrace } from './recall-contracts.js';
import { RecallTraceSchema } from './recall-contracts.js';

export function createRecallTrace(
  request: RecallRequest,
  candidateSet: CandidateSet,
  options?: {
    traceId?: string;
    startedAt?: string;
    completedAt?: string;
    decisionPath?: RecallTrace['decisionPath'];
    warnings?: string[];
  },
): RecallTrace {
  const startedAt = options?.startedAt ?? new Date().toISOString();
  const completedAt = options?.completedAt ?? new Date().toISOString();

  return RecallTraceSchema.parse({
    traceId: options?.traceId ?? randomUUID(),
    requestId: request.requestId,
    organizationId: request.organizationId,
    candidateCount: candidateSet.candidates.length,
    decisionPath: options?.decisionPath ?? ['candidate_fetch'],
    startedAt,
    completedAt,
    warnings: options?.warnings,
  });
}
