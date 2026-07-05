# SDK examples

Headless integration with `@ratary/sdk` — no MCP, no IDE. Your agent loop stays outside Ratary; the platform provides memory and context.

Requires local server (`npm run dev`) and an API key.

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
```

Legacy env aliases `AI_BRAIN_*` are still accepted.
