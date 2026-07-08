import { describe, expect, it } from 'vitest';
import type { ICandidateProvider } from '../../src/memory/recall/candidate-provider.port.js';
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
          signals: { lexical: 1 },
        },
      ],
    };
  }
}

describe('RecallService (wave 1 skeleton)', () => {
  it('returns traceable recall result without ranking', async () => {
    const service = new RecallService(new StubCandidateProvider());
    const result = await service.recall({
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      query: 'knowledge ingestion pipeline',
      traceContext: { correlationId: 'corr-1' },
    });

    expect(result.status).toBe('completed');
    expect(result.traceId.length).toBeGreaterThan(0);
    expect(result.candidates).toHaveLength(1);
    expect(result.rankedCandidates).toEqual(result.candidates);
  });
});
