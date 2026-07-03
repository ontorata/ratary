import { Meilisearch } from 'meilisearch';
import type { Env } from '../../config/env.js';
import type { IMemoryReader } from '../../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from '../../memory/retrieval-candidate-source.interface.js';
import { SqlRetrievalCandidateSource } from '../../memory/sql-retrieval-candidate-source.js';
import {
  MeilisearchRetrievalSource,
  type MeilisearchSearchClient,
} from '../search/meilisearch/meilisearch-retrieval-source.js';

export function createLexicalRetrievalSource(
  env: Env,
  repository: IMemoryReader,
): IRetrievalCandidateSource {
  if (env.SEARCH_PROVIDER === 'meilisearch') {
    if (!env.MEILISEARCH_HOST || !env.MEILISEARCH_INDEX) {
      throw new Error(
        'MEILISEARCH_HOST and MEILISEARCH_INDEX are required when SEARCH_PROVIDER=meilisearch',
      );
    }
    const client = new Meilisearch({
      host: env.MEILISEARCH_HOST,
      apiKey: env.MEILISEARCH_API_KEY,
    });
    return new MeilisearchRetrievalSource(wrapMeilisearchClient(client), repository, {
      index: env.MEILISEARCH_INDEX,
    });
  }

  if (env.SEARCH_PROVIDER !== 'sql') {
    throw new Error(`SEARCH_PROVIDER=${env.SEARCH_PROVIDER} is not implemented`);
  }

  return new SqlRetrievalCandidateSource(repository);
}

function wrapMeilisearchClient(client: Meilisearch): MeilisearchSearchClient {
  return {
    async search(index, query, options) {
      const response = await client.index(index).search(query, {
        filter: options.filter,
        limit: options.limit,
      });
      return {
        hits: response.hits.map((hit) => ({
          id: String((hit as { id?: string | number }).id ?? ''),
        })),
      };
    },
  };
}
