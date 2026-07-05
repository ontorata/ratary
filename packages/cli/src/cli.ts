import type { AiBrainClient } from '@ratary/sdk';

function usage(): void {
  console.log(`Usage:
  ai-brain capabilities
  ai-brain ecosystem [list|get <type>]
  ai-brain memory list [--project <name>] [--limit N]
  ai-brain memory get <id>
  ai-brain memory search <query> [--limit N]
  ai-brain context build --task "<text>" [--project <name>]
  ai-brain federation peers`);
}

function parseFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
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
      const result = await client.memory.search({
        q: query,
        limit: limit ? Number(limit) : undefined,
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

  if (group === 'federation' && sub === 'peers') {
    if (!client.federation) throw new Error('Set AI_BRAIN_FEDERATION=true to use federation');
    const peers = await client.federation.listPeers();
    console.log(JSON.stringify(peers, null, 2));
    return;
  }

  usage();
  throw new Error(`Unknown command: ${group}`);
}
