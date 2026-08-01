import type { Env } from '../config/env.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import { createLexicalRetrievalSource } from '../infrastructure/composition/create-lexical-retrieval-source.js';
import { RecallPolicy } from '../memory/recall/recall-policy.js';
import { RecallService } from '../memory/recall/recall-service.js';
import { SqlCandidateProvider } from '../memory/recall/sql-candidate-provider.js';

/** Composition helper for PI-P6-B recommendations (ADR-1042 recall trace). */
export function createRecallService(repository: IMemoryRepository, env: Env): RecallService {
  const candidateSource = createLexicalRetrievalSource(env, repository);
  const provider = new SqlCandidateProvider(candidateSource);
  const policy = new RecallPolicy();
  return new RecallService(provider, policy);
}
