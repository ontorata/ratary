import type { Env } from '../config/env.js';
import { DefaultRetrievalPolicy } from '../memory/retrieval-policy/default-retrieval-policy.js';
import type { IRetrievalPolicy } from '../memory/retrieval-policy/iretrieval-policy.interface.js';
import type { RetrievalDeploymentCapabilities } from '../memory/retrieval-policy/retrieval-budget.js';
import { MAX_CONTEXT_MAX_CHARS } from '../memory/context.config.js';

export interface ProgressiveRetrievalPorts {
  policy: IRetrievalPolicy;
  deployment: RetrievalDeploymentCapabilities;
}

/**
 * Composition root for Phase 6.5 progressive retrieval (ADR-024).
 * Wires pure retrieval policy and deployment capability flags from env.
 */
export function createProgressiveRetrievalPorts(env: Env): ProgressiveRetrievalPorts {
  return {
    policy: new DefaultRetrievalPolicy(env.RETRIEVAL_POLICY_VERSION),
    deployment: {
      hybridRetrieval: env.HYBRID_RETRIEVAL,
      graphRetrieval: env.GRAPH_RETRIEVAL,
      maxContextMaxChars: MAX_CONTEXT_MAX_CHARS,
    },
  };
}
