import { describe, expect, it } from 'vitest';
import type { ICandidateProvider } from '../../src/memory/recall/candidate-provider.port.js';
import type { IRecallPolicy } from '../../src/memory/recall/recall-policy.port.js';
import type { CandidateSet, RecallRequest } from '../../src/memory/recall/recall-contracts.js';
import { RecallService } from '../../src/memory/recall/recall-service.js';

class StubCandidateProvider implements ICandidateProvider {
  readonly providerName = 'stub';

  async provideCandidates(request: RecallRequest): Promise<CandidateSet> {
    return {
      requestId: request.requestId,
      organizationId: request.organizationId,
      generatedAt: '2026-07-08T08:00:00.000Z',
      providerName: this.providerName,
      candidates: [
        {
          candidateId: 'cand-1',
          organizationId: request.organizationId,
          sourceType: 'fixture',
          sourceReference: 'fixture://adr-0005',
          signals: {},
          metadata: {
            source: 'fixture',
            sourceId: 'cand-1',
            contentType: 'fixture',
            organizationId: request.organizationId,
            createdAt: '2026-07-08T08:00:00.000Z',
            updatedAt: '2026-07-08T08:00:00.000Z',
            permissions: [],
            provenance: 'stub-provider',
          },
        },
      ],
    };
  }
}

class StubRecallPolicy implements IRecallPolicy {
  readonly policyVersion = '0.0.1';

  async applyPolicy(
    request: RecallRequest,
    candidateSet: CandidateSet,
  ): Promise<{ rankedCandidates: import('../../src/memory/recall/recall-contracts.js').RecallCandidate[]; decision: import('../../src/memory/recall/recall-contracts.js').RecallDecision }> {
    return {
      rankedCandidates: candidateSet.candidates,
      decision: {
        requestId: request.requestId,
        policyVersion: this.policyVersion,
        selectedCandidates: [candidateSet.candidates[0].candidateId],
        rejectedCandidates: [],
        decisionReason: 'stub policy — no ranking applied',
        confidenceSummary: '1 candidate selected.',
      },
    };
  }
}

describe('RecallService (wave 3 — policy integration)', () => {
  it('returns traceable recall result with policy decision', async () => {
    const service = new RecallService(new StubCandidateProvider(), new StubRecallPolicy());
    const result = await service.recall({
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      query: 'knowledge ingestion pipeline',
      traceContext: { correlationId: 'corr-1' },
    });

    expect(result.status).toBe('completed');
    expect(result.traceId.length).toBeGreaterThan(0);
    expect(result.candidates).toHaveLength(1);
    expect(result.rankedCandidates).toHaveLength(1);
    expect(result.decision).toBeDefined();
    expect(result.decision!.policyVersion).toBe('0.0.1');
    expect(result.decision!.selectedCandidates).toContain('cand-1');
  });
});
