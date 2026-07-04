import type { BuildContextRequest } from '../context.service.js';
import type { RetrievalDeploymentCapabilities } from './retrieval-budget.js';
import type { IRetrievalPolicy, RetrievalPlan } from './iretrieval-policy.interface.js';
import type { AdaptiveRetrievalHints } from './retrieval-policy-hints.js';
import { DefaultRetrievalPolicy } from './default-retrieval-policy.js';

/** Rule-based adaptive caps from access/importance hints — not online ML (ADR-024 deferred track). */
export class AdaptiveRetrievalPolicy implements IRetrievalPolicy {
  private readonly inner: DefaultRetrievalPolicy;

  constructor(policyVersion = '1') {
    this.inner = new DefaultRetrievalPolicy(policyVersion);
  }

  resolve(
    request: BuildContextRequest,
    rankedCount: number,
    deployment: RetrievalDeploymentCapabilities,
    hints?: AdaptiveRetrievalHints,
  ): RetrievalPlan {
    const base = this.inner.resolve(request, rankedCount, deployment, hints);
    if (!hints) {
      return { ...base, policyVersion: `adaptive-${base.policyVersion}` };
    }

    let maxMemories = base.budget.maxMemories;
    let maxChars = base.budget.maxChars;

    if (hints.avgAccessCount >= 3 && rankedCount > maxMemories) {
      maxMemories = Math.min(rankedCount, maxMemories + 2);
    }
    if (hints.avgImportance >= 70) {
      maxChars = Math.min(deployment.maxContextMaxChars, maxChars + 1_000);
    }
    if (hints.topImportance >= 90) {
      maxMemories = Math.max(maxMemories, Math.min(5, rankedCount));
    }

    return {
      ...base,
      policyVersion: `adaptive-${base.policyVersion}`,
      budget: {
        ...base.budget,
        maxMemories,
        maxChars,
      },
    };
  }
}
