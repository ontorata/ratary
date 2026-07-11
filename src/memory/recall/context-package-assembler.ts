import { createHash, randomUUID } from 'node:crypto';
import {
  ContextPackageSchema,
  type ContextPackage,
  type RecallCandidate,
  type RecallDecision,
  type RecallRequest,
} from './recall-contracts.js';
import { allocateContextBudget, DEFAULT_CONTEXT_TOKEN_BUDGET } from './context-budget.js';

export type AssembleContextInput = {
  request: RecallRequest;
  traceId: string;
  decision: RecallDecision;
  rankedCandidates: RecallCandidate[];
  generatedAt?: string;
  packageId?: string;
};

function candidateText(candidate: RecallCandidate): string {
  const title =
    typeof candidate.metadata === 'object' && candidate.metadata !== null
      ? String((candidate.metadata as Record<string, unknown>).sourceId ?? candidate.candidateId)
      : candidate.candidateId;
  return `${title}\nSource: ${candidate.sourceReference}\nType: ${candidate.sourceType}`;
}

function decisionId(decision: RecallDecision): string {
  const payload = `${decision.requestId}|${decision.policyVersion}|${decision.selectedCandidates.join(',')}`;
  return `rd-${createHash('sha256').update(payload).digest('hex').slice(0, 16)}`;
}

/**
 * Wave 4 Context Assembly — packages ranked/selected recall output for model consumption.
 *
 * Guardrails:
 * - Does not fetch data from providers/SQL/embeddings
 * - Does not re-rank or mutate ranking decisions
 * - Only applies token budget truncation while preserving ranking order
 */
export function assembleContextPackage(input: AssembleContextInput): ContextPackage {
  const selectedIds = new Set(input.decision.selectedCandidates);
  // Preserve Wave 3 ranking order; only include selected candidates
  const orderedSelected = input.rankedCandidates.filter((candidate) =>
    selectedIds.has(candidate.candidateId),
  );

  const texts = orderedSelected.map((candidate) => ({
    candidateId: candidate.candidateId,
    text: candidateText(candidate),
  }));

  const budget = input.request.contextBudget ?? DEFAULT_CONTEXT_TOKEN_BUDGET;
  const allocation = allocateContextBudget(texts, budget);
  const includedIds = new Set(allocation.included.map((item) => item.candidateId));
  const byId = new Map(orderedSelected.map((candidate) => [candidate.candidateId, candidate]));

  const items = allocation.included.map((entry) => {
    const candidate = byId.get(entry.candidateId)!;
    return {
      itemId: `ctx-${entry.candidateId}`,
      candidateId: entry.candidateId,
      text: entry.text,
      sourceReference: candidate.sourceReference,
      tokenCount: entry.tokenCount,
      metadata: {
        sourceType: candidate.sourceType,
        organizationId: candidate.organizationId,
        provenance: candidate.metadata.provenance,
      },
    };
  });

  const sourceAttribution = items.map((item) => {
    const candidate = byId.get(item.candidateId)!;
    return {
      candidateId: item.candidateId,
      sourceReference: candidate.sourceReference,
      sourceType: candidate.sourceType,
    };
  });

  return ContextPackageSchema.parse({
    packageId: input.packageId ?? randomUUID(),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    requestId: input.request.requestId,
    traceId: input.traceId,
    organizationId: input.request.organizationId,
    sourceRecallDecisionId: decisionId(input.decision),
    policyVersion: input.decision.policyVersion,
    items,
    sourceAttribution,
    tokenUsage: {
      budget: allocation.budget,
      used: allocation.used,
      remaining: allocation.remaining,
    },
    truncation: {
      truncated: allocation.omittedCandidateIds.length > 0,
      omittedCandidateIds: allocation.omittedCandidateIds,
      omittedCount: allocation.omittedCandidateIds.length,
    },
    provenance: {
      source: 'recall-intelligence',
      policyVersion: input.decision.policyVersion,
      selectedCandidateCount: orderedSelected.length,
      assembledCandidateCount: includedIds.size,
      rankingOrderPreserved: true,
    },
    tokenBudget: allocation.budget,
    truncated: allocation.omittedCandidateIds.length > 0,
  });
}
