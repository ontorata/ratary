import type { BuildContextRequest } from '../context.service.js';
import { DEFAULT_CONTEXT_MAX_CHARS, DEFAULT_RETRIEVAL_RANK_LIMIT } from '../context.config.js';
import type { IRetrievalBudget, RetrievalDeploymentCapabilities } from './retrieval-budget.js';
import type { IRetrievalPolicy, RetrievalPlan } from './iretrieval-policy.interface.js';
import { RETRIEVAL_POLICY_VERSION } from './retrieval-stage.js';
import type { RetrievalStage } from './retrieval-stage.js';

const TIGHT_BUDGET_CHARS = 2_000;

export class DefaultRetrievalPolicy implements IRetrievalPolicy {
  constructor(private readonly policyVersion: string = RETRIEVAL_POLICY_VERSION) {}

  resolve(
    request: BuildContextRequest,
    rankedCount: number,
    deployment: RetrievalDeploymentCapabilities,
  ): RetrievalPlan {
    const includeSummaryOnly = request.context?.includeSummaryOnly !== false;
    const maxChars = Math.min(
      request.context?.maxChars ?? DEFAULT_CONTEXT_MAX_CHARS,
      deployment.maxContextMaxChars,
    );
    let maxMemories = request.limit ?? DEFAULT_RETRIEVAL_RANK_LIMIT;

    if (maxChars < TIGHT_BUDGET_CHARS && rankedCount > 0) {
      maxMemories = Math.max(1, Math.min(maxMemories, Math.ceil(maxMemories / 2)));
    }

    const stages: RetrievalStage[] = ['metadata', 'summary'];
    let hydrateBody = false;

    if (!includeSummaryOnly) {
      stages.push('body');
      hydrateBody = true;
    }

    if (deployment.hybridRetrieval) {
      stages.push('vector');
    }
    if (deployment.graphRetrieval) {
      stages.push('graph');
    }

    const budget: IRetrievalBudget = {
      maxChars,
      maxMemories,
      allowBodyHydration: hydrateBody,
      allowGraphExpansion: deployment.graphRetrieval,
    };

    return {
      policyVersion: this.policyVersion,
      stagesApplied: stages,
      hydrateBody,
      budget,
    };
  }
}
