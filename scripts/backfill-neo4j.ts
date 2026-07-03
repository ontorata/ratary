import neo4j from 'neo4j-driver';
import { getEnv } from '../src/config/env.js';
import { NEO4J_GRAPH_DDL } from '../src/infrastructure/graph/neo4j/neo4j-graph-store.adapter.js';
import { parseBackfillArgs } from './lib/backfill-cli.js';
import { createBackfillSourceSql } from './lib/backfill-sql.js';
import {
  backfillNeo4j,
  NEO4J_MERGE_RELATION_CYPHER,
  type Neo4jGraphWriter,
  type Neo4jRelationRow,
} from './lib/neo4j-backfill.js';

function createNeo4jWriter(uri: string, username: string, password: string): Neo4jGraphWriter {
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  return {
    async ensureSchema(dryRun) {
      if (dryRun) {
        return;
      }
      for (const statement of NEO4J_GRAPH_DDL.split(';').map((s) => s.trim()).filter(Boolean)) {
        await session.run(statement);
      }
    },
    async mergeRelation(row: Neo4jRelationRow) {
      await session.run(NEO4J_MERGE_RELATION_CYPHER, {
        sourceMemoryId: row.source_memory_id,
        targetMemoryId: row.target_memory_id,
        relation: row.relation,
        ownerId: row.owner_id,
      });
    },
  };
}

async function backfillNeo4jScript(): Promise<void> {
  const cli = parseBackfillArgs(process.argv);
  const env = getEnv();
  console.log(`Neo4j backfill (${cli.dryRun ? 'dry-run' : 'execute'})...`);

  if (!env.NEO4J_URI || !env.NEO4J_USERNAME || !env.NEO4J_PASSWORD) {
    throw new Error('NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD are required for Neo4j backfill');
  }

  const source = await createBackfillSourceSql();
  const writer = createNeo4jWriter(env.NEO4J_URI, env.NEO4J_USERNAME, env.NEO4J_PASSWORD);

  const result = await backfillNeo4j({
    source,
    writer,
    ownerId: cli.ownerId,
    batchSize: cli.batchSize,
    dryRun: cli.dryRun,
  });

  console.log(`scanned: ${result.scanned}`);
  console.log(`merged: ${result.merged}`);
  console.log(`failed: ${result.failed}`);
  console.log(`dryRun: ${result.dryRun}`);
}

backfillNeo4jScript().catch((error) => {
  console.error('Neo4j backfill failed:', error);
  process.exit(1);
});
