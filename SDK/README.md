# SDK examples

Headless integration with `@ratary/sdk` — no MCP, no IDE. Your agent loop stays outside Ratary; the platform provides memory and context.

## Install

```bash
npm install @ratary/sdk@1.1.0
```

Package docs: [packages/sdk/README.md](../packages/sdk/README.md) · [npm @ratary/sdk@1.1.0](https://www.npmjs.com/package/@ratary/sdk)

For monorepo development, `npm run build:sdk` from the repo root. Examples below assume a running Ratary Server and API key (`aic_...`).

## Quick start (`index.mjs`)

Capabilities, ecosystem catalog, and memory search:

```bash
npm run build:sdk
RATARY_API_KEY=aic_... node SDK/index.mjs
```

## Node bot pattern (`bot.mjs`)

Build context for a task, then save a handoff memory:

```bash
npm run build:sdk
RATARY_API_KEY=aic_... node SDK/bot.mjs
```

Equivalent TypeScript pattern:

```typescript
import { RataryClient } from '@ratary/sdk';

const client = new RataryClient({
  baseUrl: process.env.RATARY_BASE_URL!,
  apiKey: process.env.RATARY_API_KEY!,
  workspaceId: process.env.RATARY_WORKSPACE_ID,
});

const ctx = await client.context.build({ task: 'Implement feature X' });
// External agent loop uses ctx.context — reasoning stays outside Ratary
await client.memory.create({
  title: 'Handoff',
  content: ctx.context,
  tags: ['handoff'],
});

// Operator / admin (SDK 1.1.0+)
const fabric = await client.admin.knowledgeFabric.getStatus();
await client.admin.knowledgeFabric.ingest('notion', { mode: 'incremental', dryRun: true });
```

Legacy env aliases `AI_BRAIN_*` are still accepted.

See also: [docs/GUIDE.md — Knowledge fabric](../docs/GUIDE.md#12-knowledge-fabric-live-connectors).
