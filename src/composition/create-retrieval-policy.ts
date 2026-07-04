import type { Env } from '../config/env.js';
import type { IRetrievalPolicy } from '../memory/retrieval-policy/iretrieval-policy.interface.js';
import { AdaptiveRetrievalPolicy } from '../memory/retrieval-policy/adaptive-retrieval-policy.js';
import { DefaultRetrievalPolicy } from '../memory/retrieval-policy/default-retrieval-policy.js';
import { LegacyRetrievalPolicy } from '../memory/retrieval-policy/legacy-retrieval-policy.js';

export function createRetrievalPolicy(env: Env): IRetrievalPolicy {
  switch (env.RETRIEVAL_POLICY) {
    case 'legacy':
      return new LegacyRetrievalPolicy();
    case 'adaptive':
      return new AdaptiveRetrievalPolicy(env.RETRIEVAL_POLICY_VERSION);
    default:
      return new DefaultRetrievalPolicy(env.RETRIEVAL_POLICY_VERSION);
  }
}
