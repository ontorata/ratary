# Node bot template

Headless agent using `@ratary/sdk`:

```typescript
import { AiBrainClient } from '@ratary/sdk';

const client = new AiBrainClient({
  baseUrl: process.env.AI_BRAIN_BASE_URL!,
  apiKey: process.env.AI_BRAIN_API_KEY!,
  workspaceId: process.env.AI_BRAIN_WORKSPACE_ID,
});

const ctx = await client.context.build({ task: 'Implement feature X' });
// External agent loop uses ctx.context — reasoning stays outside repo
await client.memory.create({
  title: 'Handoff',
  content: ctx.context,
  tags: ['handoff'],
});
```

See [SDK quick example](../../SDK/).
