#!/usr/bin/env node
import type { AiBrainClient } from '@ratary/sdk';

function usage(): void {
  console.log(`Usage:
  ratary capabilities
  ratary ecosystem [list|get <type>]
  ratary memory list [--project <name>] [--limit N]
  ratary memory get <id>
  ratary memory search <query> [--limit N] [--mode hybrid|semantic|fulltext|title] [--extended] [--rerank] [--snippet-length N]
  ratary context build --task "<text>" [--project <name>]
  ratary federation peers|status
  ratary admin cloud status|regions
  ratary admin observability status
  ratary admin infrastructure status|manifest
  ratary admin platform status|manifest
  ratary admin knowledge-fabric status|connectors|runs [--limit N]
  ratary connectors list
  ratary connectors sync <notion|confluence|...> [--mode full|incremental] [--async] [--dry-run] [--limit N]
  ratary connectors state <connectorId>`);
}

function parseFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export async function runCli(client: AiBrainClient, args: string[]): Promise<void> {
  const [group, sub, ...rest] = args;

  if (!group || group === '--help' || group === '-h') {
    usage();
    return;
  }

  if (group === 'capabilities') {
    const manifest = await client.capabilities.get();
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }

  if (group === 'ecosystem') {
    if (!sub || sub === 'list') {
      const catalog = await client.ecosystem.listClients();
      console.log(JSON.stringify(catalog, null, 2));
      return;
    }
    if (sub === 'get') {
      const type = rest[0];
      if (!type) throw new Error('ecosystem get requires client type');
      const profile = await client.ecosystem.getClient(type);
      console.log(JSON.stringify(profile, null, 2));
      return;
    }
    throw new Error(`Unknown ecosystem subcommand: ${sub}`);
  }

  if (group === 'memory') {
    if (sub === 'list') {
      const project = parseFlag(rest, '--project');
      const limit = parseFlag(rest, '--limit');
      const result = await client.memory.list({
        project,
        limit: limit ? Number(limit) : undefined,
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (sub === 'get') {
      const id = rest[0];
      if (!id) throw new Error('memory get requires id');
      const memory = await client.memory.get(id);
      console.log(JSON.stringify(memory, null, 2));
      return;
    }
    if (sub === 'search') {
      const query = rest.find((a) => !a.startsWith('--'));
      if (!query) throw new Error('memory search requires query');
      const limit = parseFlag(rest, '--limit');
      const mode = parseFlag(rest, '--mode') as
        'hybrid' | 'semantic' | 'fulltext' | 'title' | undefined;
      const extended = rest.includes('--extended');
      const rerank = rest.includes('--rerank');
      const snippetLength = parseFlag(rest, '--snippet-length');
      const result = await client.memory.search({
        q: query,
        limit: limit ? Number(limit) : undefined,
        mode,
        extended,
        rerank,
        snippet_length: snippetLength ? Number(snippetLength) : undefined,
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    throw new Error(`Unknown memory subcommand: ${sub}`);
  }

  if (group === 'context' && sub === 'build') {
    const task = parseFlag(rest, '--task');
    if (!task) throw new Error('context build requires --task');
    const project = parseFlag(rest, '--project');
    const result = await client.context.build({ task, project });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (group === 'federation') {
    const federation = client.federation ?? client.admin.federation;
    if (sub === 'peers') {
      const peers = await federation.listPeers();
      console.log(JSON.stringify(peers, null, 2));
      return;
    }
    if (sub === 'status') {
      const status = await federation.getStatus();
      console.log(JSON.stringify(status, null, 2));
      return;
    }
    throw new Error(`Unknown federation subcommand: ${sub}`);
  }

  if (group === 'admin') {
    const domain = sub;
    const action = rest[0];
    const tail = rest.slice(1);
    if (domain === 'cloud') {
      if (action === 'status') {
        console.log(JSON.stringify(await client.admin.cloud.getStatus(), null, 2));
        return;
      }
      if (action === 'regions') {
        console.log(JSON.stringify(await client.admin.cloud.listRegions(), null, 2));
        return;
      }
    }
    if (domain === 'observability' && action === 'status') {
      console.log(JSON.stringify(await client.admin.observability.getStatus(), null, 2));
      return;
    }
    if (domain === 'infrastructure') {
      if (action === 'status') {
        console.log(JSON.stringify(await client.admin.infrastructure.getStatus(), null, 2));
        return;
      }
      if (action === 'manifest') {
        console.log(JSON.stringify(await client.admin.infrastructure.getManifest(), null, 2));
        return;
      }
    }
    if (domain === 'platform') {
      if (action === 'status') {
        console.log(JSON.stringify(await client.admin.platform.getStatus(), null, 2));
        return;
      }
      if (action === 'manifest') {
        console.log(JSON.stringify(await client.admin.platform.getManifest(), null, 2));
        return;
      }
    }
    if (domain === 'knowledge-fabric') {
      if (action === 'status') {
        console.log(JSON.stringify(await client.admin.knowledgeFabric.getStatus(), null, 2));
        return;
      }
      if (action === 'connectors') {
        console.log(JSON.stringify(await client.admin.knowledgeFabric.listConnectors(), null, 2));
        return;
      }
      if (action === 'runs') {
        const limit = parseFlag(tail, '--limit');
        console.log(
          JSON.stringify(
            await client.admin.knowledgeFabric.listIngestRuns(limit ? Number(limit) : undefined),
            null,
            2,
          ),
        );
        return;
      }
    }
    throw new Error(`Unknown admin command: admin ${domain} ${action ?? ''}`.trim());
  }

  if (group === 'connectors') {
    const kf = client.admin.knowledgeFabric;
    if (sub === 'list') {
      console.log(JSON.stringify(await kf.listConnectors(), null, 2));
      return;
    }
    if (sub === 'state') {
      const connectorId = rest[0];
      if (!connectorId) throw new Error('connectors state requires connectorId');
      console.log(JSON.stringify(await kf.getConnectorState(connectorId as 'notion'), null, 2));
      return;
    }
    if (sub === 'sync') {
      const connectorId = rest.find((a) => !a.startsWith('--'));
      if (!connectorId) throw new Error('connectors sync requires connectorId');
      const mode =
        (parseFlag(rest, '--mode') as 'full' | 'incremental' | undefined) ?? 'incremental';
      const body = {
        mode,
        dryRun: hasFlag(rest, '--dry-run'),
        limit: parseFlag(rest, '--limit') ? Number(parseFlag(rest, '--limit')) : undefined,
      };
      if (hasFlag(rest, '--async')) {
        console.log(JSON.stringify(await kf.sync(connectorId as 'notion', body), null, 2));
        return;
      }
      console.log(JSON.stringify(await kf.ingest(connectorId as 'notion', body), null, 2));
      return;
    }
    throw new Error(`Unknown connectors subcommand: ${sub}`);
  }

  usage();
  throw new Error(`Unknown command: ${group}`);
}
