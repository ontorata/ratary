/**
 * Phase 38 staging prove — in-memory execute path (does NOT touch D1/Postgres).
 *
 * Usage: npm run prove:code-memory
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ISqlDatabase, SqlExecuteResult } from '../src/ports/sql/isql-database.port.js';
import type {
  CodeBridge,
  CodeBridgeType,
  CodeEdge,
  CodeEdgeType,
  CodeNode,
  CodeNodeKind,
} from '../src/types/code-memory.js';
import type { CodeMemoryPorts } from '../src/knowledge/code-memory/icode-memory-store.js';
import { runCodeIndex } from '../src/knowledge/code-memory/code-index-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(__dirname, '../docs/evidence/phase-38-code-memory/fixture');
const ownerId = process.env.MCP_OWNER_ID?.trim() || '00000000-0000-4000-8000-000000000038';

function createMemoryPorts(): {
  ports: CodeMemoryPorts & { enabled: true };
  sql: ISqlDatabase;
  nodeCount: () => number;
  edgeCount: () => number;
  firstNode: () => CodeNode | null;
} {
  const byStable = new Map<string, CodeNode>();
  const byId = new Map<string, CodeNode>();
  const edges = new Map<string, CodeEdge>();
  const bridges = new Map<string, CodeBridge>();
  const runs: unknown[] = [];

  const nodeKey = (owner: string, stableKey: string) => `${owner}::${stableKey}`;
  const edgeKey = (o: string, t: string, f: string, to: string) => `${o}::${t}::${f}::${to}`;

  const ports: CodeMemoryPorts & { enabled: true } = {
    enabled: true,
    nodes: {
      async upsertNode(node) {
        byStable.set(nodeKey(node.ownerId, node.stableKey), node);
        byId.set(`${node.ownerId}::${node.id}`, node);
      },
      async getById(owner, id) {
        return byId.get(`${owner}::${id}`) ?? null;
      },
      async getByStableKey(owner, stableKey) {
        return byStable.get(nodeKey(owner, stableKey)) ?? null;
      },
      async listByRepo(owner, repoId, kinds?) {
        return [...byStable.values()].filter(
          (n) =>
            n.ownerId === owner &&
            (n.id === repoId || n.repoId === repoId) &&
            (!kinds || kinds.includes(n.kind as CodeNodeKind)),
        );
      },
    },
    edges: {
      async upsertEdge(edge) {
        edges.set(edgeKey(edge.ownerId, edge.type, edge.fromId, edge.toId), edge);
      },
      async listNeighbors(owner, nodeId, options) {
        return [...edges.values()]
          .filter((e) => {
            if (e.ownerId !== owner) return false;
            if (options.types && !options.types.includes(e.type as CodeEdgeType)) return false;
            if (options.direction === 'outgoing') return e.fromId === nodeId;
            if (options.direction === 'incoming') return e.toId === nodeId;
            return e.fromId === nodeId || e.toId === nodeId;
          })
          .slice(0, options.limit);
      },
    },
    bridges: {
      async upsertBridge(bridge) {
        bridges.set(
          `${bridge.ownerId}::${bridge.type}::${bridge.codeNodeId}::${bridge.targetId}`,
          bridge,
        );
      },
      async listByCodeNode(owner, codeNodeId, types?) {
        return [...bridges.values()].filter(
          (b) =>
            b.ownerId === owner &&
            b.codeNodeId === codeNodeId &&
            (!types || types.includes(b.type as CodeBridgeType)),
        );
      },
    },
  };

  const sql: ISqlDatabase = {
    async query() {
      return [];
    },
    async execute(sqlText, params = []): Promise<SqlExecuteResult> {
      if (sqlText.includes('INSERT INTO code_index_runs')) {
        runs.push({ id: params[0], owner_id: params[1], repo: params[2] });
      }
      return { results: [], meta: { changes: 1 } };
    },
  };

  return {
    ports,
    sql,
    nodeCount: () => byStable.size,
    edgeCount: () => edges.size,
    firstNode: () => [...byStable.values()][0] ?? null,
  };
}

async function main(): Promise<void> {
  const { ports, sql, nodeCount, edgeCount, firstNode } = createMemoryPorts();

  console.log('Phase 38 prove:code-memory (in-memory execute)...');
  console.log(`  fixture=${fixtureRoot}`);
  console.log(`  owner=${ownerId}`);

  const report = await runCodeIndex({
    dryRun: false,
    ownerId,
    repository: 'fixture/phase38',
    rootDir: fixtureRoot,
    gitCommit: 'fixture',
    ports,
    sql,
  });

  if (!report.enabled || report.dryRun || !report.runId) {
    throw new Error(`unexpected report: ${JSON.stringify(report)}`);
  }
  if (report.stats.filesScanned < 1 || report.stats.nodes < 1) {
    throw new Error(`extract too small: ${JSON.stringify(report.stats)}`);
  }
  if (nodeCount() !== report.stats.nodes || edgeCount() !== report.stats.edges) {
    throw new Error(
      `upsert mismatch nodes=${nodeCount()}/${report.stats.nodes} edges=${edgeCount()}/${report.stats.edges}`,
    );
  }

  const sample = firstNode();
  if (!sample) throw new Error('no node after upsert');
  const roundTrip = await ports.nodes.getById(ownerId, sample.id);
  if (!roundTrip || roundTrip.stableKey !== sample.stableKey) {
    throw new Error('getById round-trip failed');
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'in-memory-execute',
        touchesD1: false,
        report,
        persistedNodes: nodeCount(),
        persistedEdges: edgeCount(),
        sampleNode: { id: sample.id, kind: sample.kind, displayName: sample.displayName },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('prove:code-memory failed:', error);
  process.exit(1);
});
