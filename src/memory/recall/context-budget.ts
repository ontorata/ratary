import { estimateTokens } from '../token-estimate.js';

export const DEFAULT_CONTEXT_TOKEN_BUDGET = 2048;

export type BudgetAllocation = {
  budget: number;
  used: number;
  remaining: number;
  included: Array<{ candidateId: string; text: string; tokenCount: number }>;
  omittedCandidateIds: string[];
};

/**
 * Fit ranked candidate texts into a token budget without reordering or re-ranking.
 * Ordering of `candidates` is preserved (Wave 3 ranking order).
 */
export function allocateContextBudget(
  candidates: Array<{ candidateId: string; text: string }>,
  budget: number = DEFAULT_CONTEXT_TOKEN_BUDGET,
): BudgetAllocation {
  const safeBudget = Math.max(1, Math.floor(budget));
  const included: BudgetAllocation['included'] = [];
  const omittedCandidateIds: string[] = [];
  let used = 0;

  for (const candidate of candidates) {
    const tokenCount = estimateTokens(candidate.text);
    if (used + tokenCount <= safeBudget) {
      included.push({
        candidateId: candidate.candidateId,
        text: candidate.text,
        tokenCount,
      });
      used += tokenCount;
    } else {
      omittedCandidateIds.push(candidate.candidateId);
    }
  }

  return {
    budget: safeBudget,
    used,
    remaining: Math.max(0, safeBudget - used),
    included,
    omittedCandidateIds,
  };
}
