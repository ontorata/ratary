import { describe, expect, it } from 'vitest';
import { RecallPolicy } from '../../src/memory/recall/recall-policy.js';
import type { CandidateSet, RecallRequest } from '../../src/memory/recall/recall-contracts.js';

function makeCandidate(
  id: string,
  overrides: Partial<{
    organizationId: string;
    confidence: number;
    updatedAt: string;
    source: string;
    contentType: string;
    embeddingVersion: string;
  }> = {},
): import('../../src/memory/recall/recall-contracts.js').RecallCandidate {
  return {
    candidateId: id,
    organizationId: overrides.organizationId ?? 'org-test',
    sourceType: overrides.contentType ?? 'document',
    sourceReference: `ref://${id}`,
    signals: {},
    metadata: {
      source: overrides.source ?? 'sql',
      sourceId: id,
      contentType: overrides.contentType ?? 'document',
      organizationId: overrides.organizationId ?? 'org-test',
      createdAt: '2026-07-01T08:00:00.000Z',
      updatedAt: overrides.updatedAt ?? '2026-07-01T08:00:00.000Z',
      permissions: ['read'],
      provenance: 'test',
      embeddingVersion: overrides.embeddingVersion,
    },
    confidence: overrides.confidence,
  };
}

function makeCandidateSet(candidates: ReturnType<typeof makeCandidate>[]): CandidateSet {
  return {
    requestId: 'req-test',
    organizationId: 'org-test',
    generatedAt: '2026-07-08T08:00:00.000Z',
    candidates,
  };
}

function makeRequest(overrides: Partial<RecallRequest> = {}): RecallRequest {
  return {
    requestId: 'req-test',
    organizationId: 'org-test',
    query: 'test query',
    traceContext: { correlationId: 'corr-test' },
    ...overrides,
  };
}

describe('RecallPolicy (wave 3)', () => {
  describe('determinism', () => {
    it('same input yields same ranked order across multiple calls', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('cand-b', { confidence: 0.8 }),
        makeCandidate('cand-a', { confidence: 0.9 }),
        makeCandidate('cand-c', { confidence: 0.7 }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest();

      const result1 = await policy.applyPolicy(request, candidateSet);
      const result2 = await policy.applyPolicy(request, candidateSet);

      expect(result1.rankedCandidates.map((c) => c.candidateId)).toEqual(
        result2.rankedCandidates.map((c) => c.candidateId),
      );
    });

    it('tiebreak by candidateId is stable', async () => {
      const policy = new RecallPolicy();
      const now = new Date().toISOString();
      const candidates = [
        makeCandidate('cand-z', { confidence: 0.5, updatedAt: now }),
        makeCandidate('cand-a', { confidence: 0.5, updatedAt: now }),
        makeCandidate('cand-m', { confidence: 0.5, updatedAt: now }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest();

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates.map((c) => c.candidateId)).toEqual([
        'cand-a',
        'cand-m',
        'cand-z',
      ]);
    });
  });

  describe('ranking', () => {
    it('higher confidence ranks first', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('low', { confidence: 0.2 }),
        makeCandidate('high', { confidence: 0.9 }),
        makeCandidate('mid', { confidence: 0.5 }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest();

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates.map((c) => c.candidateId)).toEqual([
        'high',
        'mid',
        'low',
      ]);
    });

    it('with-embedding candidates rank above those without', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('no-embed', { confidence: 0.5, embeddingVersion: undefined }),
        makeCandidate('with-embed', { confidence: 0.5, embeddingVersion: 'v2' }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest();

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates[0].candidateId).toBe('with-embed');
    });

    it('more-recent candidates rank above older ones at equal confidence', async () => {
      const policy = new RecallPolicy();
      const yesterday = new Date(Date.now() - 86_400_000).toISOString();
      const today = new Date().toISOString();
      const candidates = [
        makeCandidate('old', { confidence: 0.5, updatedAt: yesterday }),
        makeCandidate('new', { confidence: 0.5, updatedAt: today }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest();

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates[0].candidateId).toBe('new');
    });

    it('limit caps the ranked output', async () => {
      const policy = new RecallPolicy();
      const candidates = Array.from({ length: 10 }, (_, i) =>
        makeCandidate(`cand-${i}`, { confidence: 1 - i * 0.1 }),
      );
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ limit: 3 });

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates).toHaveLength(3);
      expect(result.rankedCandidates[0].candidateId).toBe('cand-0');
    });
  });

  describe('filtering', () => {
    it('tag filter excludes non-matching sources', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('sql-cand', { source: 'sql' }),
        makeCandidate('knowledge-cand', { source: 'knowledge' }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ tags: ['sql'] });

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates).toHaveLength(1);
      expect(result.rankedCandidates[0].candidateId).toBe('sql-cand');
      expect(result.decision.rejectedCandidates).toContain('knowledge-cand');
    });

    it('level filter excludes non-matching contentType', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('doc', { contentType: 'document' }),
        makeCandidate('note', { contentType: 'note' }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ levels: ['note'] });

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates).toHaveLength(1);
      expect(result.rankedCandidates[0].candidateId).toBe('note');
    });

    it('freshnessPolicy max_age:h filters by hours', async () => {
      // Freeze evaluation clock — wall-clock Date.now() races at the exact age boundary.
      const now = Date.parse('2026-07-08T12:00:00.000Z');
      const policy = new RecallPolicy(() => now);
      const twoHoursAgo = new Date(now - 2 * 3_600_000).toISOString();
      const oneHourAgo = new Date(now - 3_600_000).toISOString();
      const candidates = [
        makeCandidate('recent', { updatedAt: oneHourAgo }),
        makeCandidate('stale', { updatedAt: twoHoursAgo }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ freshnessPolicy: 'max_age:1h' });

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates).toHaveLength(1);
      expect(result.rankedCandidates[0].candidateId).toBe('recent');
    });

    it('freshnessPolicy max_age:d filters by days', async () => {
      // Freeze evaluation clock — wall-clock Date.now() races at the exact age boundary.
      const now = Date.parse('2026-07-08T12:00:00.000Z');
      const policy = new RecallPolicy(() => now);
      const twoDaysAgo = new Date(now - 2 * 86_400_000).toISOString();
      const yesterday = new Date(now - 86_400_000).toISOString();
      const candidates = [
        makeCandidate('recent', { updatedAt: yesterday }),
        makeCandidate('stale', { updatedAt: twoDaysAgo }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ freshnessPolicy: 'max_age:1d' });

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.rankedCandidates).toHaveLength(1);
      expect(result.rankedCandidates[0].candidateId).toBe('recent');
    });
  });

  describe('RecallDecision', () => {
    it('populates decision with selected and rejected candidateIds', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('c1', { confidence: 0.9 }),
        makeCandidate('c2', { confidence: 0.1 }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ limit: 1 }); // c2 overflows limit → rejected

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.decision.requestId).toBe('req-test');
      expect(result.decision.policyVersion).toBe('1.0.0');
      expect(result.decision.selectedCandidates).toContain('c1');
      expect(result.decision.rejectedCandidates).toContain('c2');
      expect(result.decision.decisionReason).toContain('Selected');
    });

    it('rejectedCandidates includes filter-rejected items even when no limit set', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('sql-cand', { source: 'sql' }),
        makeCandidate('knowledge-cand', { source: 'knowledge' }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ tags: ['sql'] });

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.decision.selectedCandidates).toContain('sql-cand');
      expect(result.decision.rejectedCandidates).toContain('knowledge-cand');
    });

    it('confidenceSummary reflects the confidence band', async () => {
      const policy = new RecallPolicy();
      const candidates = [makeCandidate('c1', { confidence: 0.9 })];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest();

      const result = await policy.applyPolicy(request, candidateSet);

      expect(result.decision.confidenceSummary).toMatch(/high|medium|low/);
    });

    it('candidateOutcomes explain selection and rejection with per-signal scores', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('c1', { confidence: 0.9, source: 'sql' }),
        makeCandidate('c2', { confidence: 0.8, source: 'knowledge' }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ tags: ['sql'], limit: 1 });

      const result = await policy.applyPolicy(request, candidateSet);
      const outcomes = result.decision.candidateOutcomes ?? [];

      expect(outcomes).toHaveLength(2);
      expect(outcomes.find((o) => o.candidateId === 'c1')?.outcome).toBe('selected');
      expect(outcomes.find((o) => o.candidateId === 'c2')?.outcome).toBe('rejected_filter');
      expect(outcomes.find((o) => o.candidateId === 'c1')?.reasons.length).toBeGreaterThan(0);
      expect(result.decision.policyExecution?.policyName).toBe('confidence-recency-embedding');
      expect(result.decision.policyExecution?.candidatesSelected).toBe(1);
    });
  });

  describe('boundary — no mutation', () => {
    it('input CandidateSet.candidates is not mutated', async () => {
      const policy = new RecallPolicy();
      const candidates = [
        makeCandidate('a', { confidence: 0.8 }),
        makeCandidate('b', { confidence: 0.6 }),
      ];
      const candidateSet = makeCandidateSet(candidates);
      const request = makeRequest({ limit: 1 });

      const originalOrder = candidateSet.candidates.map((c) => c.candidateId);
      await policy.applyPolicy(request, candidateSet);

      expect(candidateSet.candidates.map((c) => c.candidateId)).toEqual(originalOrder);
    });
  });
});
