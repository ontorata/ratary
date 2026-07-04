import { DEFAULT_CONTEXT_MAX_CHARS } from '../context.config.js';
import { DEFAULT_RETRIEVAL_RANK_LIMIT } from '../context.config.js';

export interface IRetrievalBudget {
  maxChars: number;
  maxMemories: number;
  maxGraphDepth?: number;
  allowBodyHydration: boolean;
  allowGraphExpansion: boolean;
}

export interface RetrievalDeploymentCapabilities {
  hybridRetrieval: boolean;
  graphRetrieval: boolean;
  maxContextMaxChars: number;
}

export function defaultRetrievalBudget(
  maxChars = DEFAULT_CONTEXT_MAX_CHARS,
  maxMemories = DEFAULT_RETRIEVAL_RANK_LIMIT,
): IRetrievalBudget {
  return {
    maxChars,
    maxMemories,
    allowBodyHydration: false,
    allowGraphExpansion: false,
  };
}
