import { Meilisearch } from 'meilisearch';
import { Client as OpenSearchClient } from '@opensearch-project/opensearch';
import type { Env } from '../../config/env.js';
import type { IMemoryReader } from '../../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from '../../memory/retrieval-candidate-source.interface.js';
import { SqlRetrievalCandidateSource } from '../../memory/sql-retrieval-candidate-source.js';
import {
  MeilisearchRetrievalSource,
  type MeilisearchSearchClient,
} from '../search/meilisearch/meilisearch-retrieval-source.js';
import {
  OpenSearchRetrievalSource,
  type OpenSearchSearchClient,
} from '../search/opensearch/opensearch-retrieval-source.js';

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

  if (env.SEARCH_PROVIDER === 'opensearch') {
    if (!env.OPENSEARCH_NODE || !env.OPENSEARCH_INDEX) {
      throw new Error(
        'OPENSEARCH_NODE and OPENSEARCH_INDEX are required when SEARCH_PROVIDER=opensearch',
      );
    }
    const client = new OpenSearchClient({
      node: env.OPENSEARCH_NODE,
      auth:
        env.OPENSEARCH_USERNAME && env.OPENSEARCH_PASSWORD
          ? { username: env.OPENSEARCH_USERNAME, password: env.OPENSEARCH_PASSWORD }
          : undefined,
    });
    return new OpenSearchRetrievalSource(wrapOpenSearchClient(client), repository, {
      index: env.OPENSEARCH_INDEX,
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

function wrapOpenSearchClient(client: OpenSearchClient): OpenSearchSearchClient {
  return {
    async search(index, query, options) {
      const filters: Record<string, unknown>[] = [{ term: { owner_id: options.ownerId } }];
      if (options.workspaceId) {
        filters.push({ term: { workspace_id: options.workspaceId } });
      }
      if (options.projectId) {
        filters.push({ term: { project_id: options.projectId } });
      }

      const response = await client.search({
        index,
        body: {
          size: options.limit,
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['content', 'title', 'summary'],
                  },
                },
              ],
              filter: filters,
            },
          },
        },
      });

      const hits = (response.body.hits?.hits ?? []) as Array<{ _id?: string }>;
      return {
        hits: hits.map((hit) => ({
          id: String(hit._id ?? ''),
        })),
      };
    },
  };
}
