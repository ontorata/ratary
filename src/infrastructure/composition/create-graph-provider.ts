import neo4j from 'neo4j-driver';
import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IGraphProvider } from '../../graph/igraph-provider.interface.js';
import { D1GraphAdapter } from '../graph/d1/d1-graph.adapter.js';
import { Neo4jGraphStoreAdapter } from '../graph/neo4j/neo4j-graph-store.adapter.js';
import type { Neo4jQueryClient } from '../graph/neo4j/neo4j-graph-store.adapter.js';

export function createGraphProvider(env: Env, sql: ISqlDatabase): IGraphProvider {
  if (env.GRAPH_PROVIDER === 'neo4j') {
    if (!env.NEO4J_URI || !env.NEO4J_USERNAME || !env.NEO4J_PASSWORD) {
      throw new Error(
        'NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD are required when GRAPH_PROVIDER=neo4j',
      );
    }
    const driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USERNAME, env.NEO4J_PASSWORD),
    );
    const session = driver.session();
    const client: Neo4jQueryClient = {
      run: async (cypher, params) => {
        const result = await session.run(cypher, params ?? {});
        return { records: result.records };
      },
    };
    return new Neo4jGraphStoreAdapter(client);
  }

  if (env.GRAPH_PROVIDER !== 'd1') {
    throw new Error(`GRAPH_PROVIDER=${env.GRAPH_PROVIDER} is not implemented`);
  }

  return new D1GraphAdapter(sql);
}
