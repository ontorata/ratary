import type { BuildContextRequest } from '../context.service.js';
import type { IRetrievalBudget, RetrievalDeploymentCapabilities } from './retrieval-budget.js';
import type { RetrievalStage } from './retrieval-stage.js';
import { RETRIEVAL_POLICY_VERSION } from './retrieval-stage.js';

export interface RetrievalPlan {
  policyVersion: string;
  stagesApplied: RetrievalStage[];
  hydrateBody: boolean;
  budget: IRetrievalBudget;
}

export interface IRetrievalPolicy {
  resolve(
    request: BuildContextRequest,
    rankedCount: number,
    deployment: RetrievalDeploymentCapabilities,
  ): RetrievalPlan;
}

export { RETRIEVAL_POLICY_VERSION };
