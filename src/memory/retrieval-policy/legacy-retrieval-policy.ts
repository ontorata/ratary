import type { BuildContextRequest } from '../context.service.js';
import { DEFAULT_CONTEXT_MAX_CHARS, DEFAULT_RETRIEVAL_RANK_LIMIT } from '../context.config.js';
import type { IRetrievalBudget, RetrievalDeploymentCapabilities } from './retrieval-budget.js';
import type { IRetrievalPolicy, RetrievalPlan } from './iretrieval-policy.interface.js';
import type { AdaptiveRetrievalHints } from './retrieval-policy-hints.js';
import type { RetrievalStage } from './retrieval-stage.js';

/** Pre-6.5 rollback adapter — no progressive caps or relation/graph stage metadata (ADR-024). */
export class LegacyRetrievalPolicy implements IRetrievalPolicy {
  resolve(
    request: BuildContextRequest,
    _rankedCount: number,
    deployment: RetrievalDeploymentCapabilities,
    _hints?: AdaptiveRetrievalHints,
  ): RetrievalPlan {
    const includeSummaryOnly = request.context?.includeSummaryOnly !== false;
    const maxChars = Math.min(
      request.context?.maxChars ?? DEFAULT_CONTEXT_MAX_CHARS,
      deployment.maxContextMaxChars,
    );
    const maxMemories = request.limit ?? DEFAULT_RETRIEVAL_RANK_LIMIT;
    const hydrateBody = !includeSummaryOnly;

    const stages: RetrievalStage[] = includeSummaryOnly ? ['summary'] : ['summary', 'body'];

    const budget: IRetrievalBudget = {
      maxChars,
      maxMemories,
      allowBodyHydration: hydrateBody,
      allowGraphExpansion: false,
    };

    return {
      policyVersion: 'legacy',
      stagesApplied: stages,
      hydrateBody,
      budget,
    };
  }
}
