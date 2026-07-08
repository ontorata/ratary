import type { CandidateSet, RecallRequest } from './recall-contracts.js';

/**
 * Produces tenant-scoped recall candidates from existing retrieval backends.
 * Candidate generation is intentionally separated from ranking policy.
 */
export interface ICandidateProvider {
  readonly providerName: string;
  provideCandidates(request: RecallRequest): Promise<CandidateSet>;
}
