import { describe, expect, it } from 'vitest';
import { allocateContextBudget } from '../../src/memory/recall/context-budget.js';
import { assembleContextPackage } from '../../src/memory/recall/context-package-assembler.js';
import type {
  RecallCandidate,
  RecallDecision,
  RecallRequest,
} from '../../src/memory/recall/recall-contracts.js';

function makeCandidate(
  id: string,
  overrides: Partial<{ confidence: number; sourceReference: string }> = {},
): RecallCandidate {
  return {
    candidateId: id,
    organizationId: 'org-test',
    sourceType: 'document',
    sourceReference: overrides.sourceReference ?? `ref://${id}`,
    signals: {},
    confidence: overrides.confidence,
    metadata: {
      source: 'sql',
      sourceId: id,
      contentType: 'document',
      organizationId: 'org-test',
      createdAt: '2026-07-01T08:00:00.000Z',
      updatedAt: '2026-07-08T08:00:00.000Z',
      permissions: ['read'],
      provenance: 'test',
    },
  };
}

const request: RecallRequest = {
  requestId: 'req-ctx',
  organizationId: 'org-test',
  query: 'context assembly',
  traceContext: { correlationId: 'corr-ctx' },
};

const decision: RecallDecision = {
  requestId: 'req-ctx',
  policyVersion: '1.0.0',
  selectedCandidates: ['cand-a', 'cand-b', 'cand-c'],
  rejectedCandidates: [],
  decisionReason: 'selected three',
  confidenceSummary: 'medium',
};

describe('context budget', () => {
  it('preserves input order while filling budget', () => {
    const allocation = allocateContextBudget(
      [
        { candidateId: 'a', text: 'short' },
        { candidateId: 'b', text: 'also short' },
        { candidateId: 'c', text: 'x'.repeat(5000) },
      ],
      50,
    );

    expect(allocation.included.map((item) => item.candidateId)).toEqual(['a', 'b']);
    expect(allocation.omittedCandidateIds).toContain('c');
    expect(allocation.used).toBeLessThanOrEqual(allocation.budget);
  });
});

describe('context package assembler', () => {
  it('assembles package from RecallDecision with provenance', () => {
    const ranked = [
      makeCandidate('cand-a', { confidence: 0.9 }),
      makeCandidate('cand-b', { confidence: 0.8 }),
      makeCandidate('cand-c', { confidence: 0.7 }),
    ];

    const pkg = assembleContextPackage({
      request,
      traceId: 'trace-1',
      decision,
      rankedCandidates: ranked,
      generatedAt: '2026-07-08T09:00:00.000Z',
      packageId: 'pkg-1',
    });

    expect(pkg.packageId).toBe('pkg-1');
    expect(pkg.sourceRecallDecisionId.startsWith('rd-')).toBe(true);
    expect(pkg.policyVersion).toBe('1.0.0');
    expect(pkg.items.map((item) => item.candidateId)).toEqual(['cand-a', 'cand-b', 'cand-c']);
    expect(pkg.provenance.rankingOrderPreserved).toBe(true);
    expect(pkg.truncation.truncated).toBe(false);
    expect(pkg.tokenUsage.used).toBeGreaterThan(0);
  });

  it('enforces token budget and records truncation without reordering', () => {
    const ranked = [
      makeCandidate('cand-a'),
      makeCandidate('cand-b'),
      makeCandidate('cand-c'),
    ];

    const pkg = assembleContextPackage({
      request: { ...request, contextBudget: 20 },
      traceId: 'trace-2',
      decision,
      rankedCandidates: ranked,
      generatedAt: '2026-07-08T09:00:00.000Z',
      packageId: 'pkg-2',
    });

    expect(pkg.tokenUsage.budget).toBe(20);
    expect(pkg.truncation.truncated).toBe(true);
    expect(pkg.truncation.omittedCount).toBeGreaterThan(0);
    expect(pkg.items.length).toBeLessThan(3);
    // retained items keep Wave 3 order prefix
    expect(pkg.items[0]?.candidateId).toBe('cand-a');
  });

  it('does not introduce candidates outside RecallDecision.selectedCandidates', () => {
    const ranked = [
      makeCandidate('cand-a'),
      makeCandidate('cand-x'),
      makeCandidate('cand-b'),
    ];
    const narrowDecision: RecallDecision = {
      ...decision,
      selectedCandidates: ['cand-a', 'cand-b'],
    };

    const pkg = assembleContextPackage({
      request,
      traceId: 'trace-3',
      decision: narrowDecision,
      rankedCandidates: ranked,
      generatedAt: '2026-07-08T09:00:00.000Z',
      packageId: 'pkg-3',
    });

    expect(pkg.items.map((item) => item.candidateId)).toEqual(['cand-a', 'cand-b']);
    expect(pkg.items.some((item) => item.candidateId === 'cand-x')).toBe(false);
  });
});
