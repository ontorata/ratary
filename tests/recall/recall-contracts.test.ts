import { describe, expect, it } from 'vitest';
import {
  assertRecallRequest,
  assertRecallTrace,
  CandidateSetSchema,
  candidateSetHash,
  RecallCandidateSchema,
  RecallDecisionSchema,
  RecallRequestSchema,
  RecallResultSchema,
} from '../../src/memory/recall/recall-contracts.js';

const baseRequest = {
  requestId: 'req-1',
  organizationId: 'org-ontorata',
  query: 'p1 release baseline',
  traceContext: { sessionId: 'sess-1' },
};

const baseMetadata = {
  source: 'adr',
  sourceId: 'cand-1',
  contentType: 'adr',
  organizationId: 'org-ontorata',
  createdAt: '2026-07-08T06:00:00.000Z',
  updatedAt: '2026-07-08T06:00:01.000Z',
  permissions: [],
  provenance: 'fixture',
};

const baseCandidate = {
  candidateId: 'cand-1',
  organizationId: 'org-ontorata',
  sourceType: 'adr',
  sourceReference: '.ai/core/architecture/ADR-0005-knowledge-ingestion-pipeline.md',
  signals: {},
  metadata: baseMetadata,
};

describe('recall contracts', () => {
  it('validates RecallRequest with trace context', () => {
    const parsed = assertRecallRequest(baseRequest);
    expect(parsed.organizationId).toBe('org-ontorata');
  });

  it('rejects RecallRequest without sessionId or correlationId', () => {
    expect(() =>
      RecallRequestSchema.parse({
        ...baseRequest,
        traceContext: {},
      }),
    ).toThrow();
  });

  it('validates RecallCandidate required fields', () => {
    const parsed = RecallCandidateSchema.parse(baseCandidate);
    expect(parsed.candidateId).toBe('cand-1');
  });

  it('validates RecallDecision explainability contract', () => {
    const parsed = RecallDecisionSchema.parse({
      requestId: 'req-1',
      policyVersion: 'policy-v1',
      selectedCandidates: ['cand-1'],
      rejectedCandidates: ['cand-2'],
      decisionReason: 'tenant-safe lexical match',
      confidenceSummary: 'high',
    });
    expect(parsed.selectedCandidates).toHaveLength(1);
  });

  it('validates RecallTrace provider stats', () => {
    const parsed = assertRecallTrace({
      traceId: 'trace-1',
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      candidateCount: 1,
      decisionPath: ['candidate_fetch'],
      startedAt: '2026-07-08T08:00:00.000Z',
      completedAt: '2026-07-08T08:00:00.010Z',
      providerTrace: {
        provider: 'sql',
        queryTimeMs: 18,
        returned: 42,
        filtered: 42,
        candidateSetHash: 'csh-1-cand-1',
      },
    });
    expect(parsed.providerTrace?.provider).toBe('sql');
  });

  it('validates RecallTrace decision path stages', () => {
    const parsed = assertRecallTrace({
      traceId: 'trace-1',
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      candidateCount: 1,
      decisionPath: ['candidate_fetch'],
      startedAt: '2026-07-08T08:00:00.000Z',
      completedAt: '2026-07-08T08:00:00.010Z',
    });
    expect(parsed.decisionPath[0]).toBe('candidate_fetch');
  });

  it('validates RecallResult ranked output contract', () => {
    const parsed = RecallResultSchema.parse({
      requestId: 'req-1',
      traceId: 'trace-1',
      organizationId: 'org-ontorata',
      candidates: [baseCandidate],
      rankedCandidates: [baseCandidate],
      status: 'completed',
    });
    expect(parsed.status).toBe('completed');
  });

  it('produces stable candidate_set_hash for same candidate ordering', () => {
    const candidateSet = CandidateSetSchema.parse({
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      candidates: [
        baseCandidate,
        { ...baseCandidate, candidateId: 'cand-2', sourceReference: 'ref-2', metadata: { ...baseMetadata, sourceId: 'cand-2' } },
      ],
      generatedAt: '2026-07-08T08:00:00.000Z',
    });
    const first = candidateSetHash(candidateSet);
    const second = candidateSetHash(candidateSet);
    expect(first).toBe(second);
  });
});
