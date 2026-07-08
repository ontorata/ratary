import { randomUUID } from 'node:crypto';
import {
  type CandidateSet,
  candidateSetHash,
  type RecallProviderTrace,
  type RecallRequest,
  type RecallTrace,
  RecallTraceSchema,
} from './recall-contracts.js';

export function createRecallTrace(
  request: RecallRequest,
  candidateSet: CandidateSet,
  options?: {
    traceId?: string;
    startedAt?: string;
    completedAt?: string;
    decisionPath?: RecallTrace['decisionPath'];
    warnings?: string[];
    providerTrace?: RecallProviderTrace;
    returnedCount?: number;
  },
): RecallTrace {
  const startedAt = options?.startedAt ?? new Date().toISOString();
  const completedAt = options?.completedAt ?? new Date().toISOString();
  const providerTrace =
    options?.providerTrace ??
    (candidateSet.providerName
      ? {
          provider: candidateSet.providerName,
          queryTimeMs: candidateSet.providerLatencyMs ?? 0,
          returned: options?.returnedCount ?? candidateSet.candidates.length,
          filtered: candidateSet.candidates.length,
          candidateSetHash: candidateSetHash(candidateSet),
        }
      : undefined);

  return RecallTraceSchema.parse({
    traceId: options?.traceId ?? randomUUID(),
    requestId: request.requestId,
    organizationId: request.organizationId,
    candidateCount: candidateSet.candidates.length,
    decisionPath: options?.decisionPath ?? ['candidate_fetch'],
    startedAt,
    completedAt,
    warnings: options?.warnings,
    providerTrace,
  });
}
