/**
 * Node bot example — context build + handoff memory.
 *
 * Usage:
 *   RATARY_API_KEY=aic_... node SDK/bot.mjs
 */
import { RataryClient } from '@ratary/sdk';

const apiKey = process.env.RATARY_API_KEY ?? process.env.AI_BRAIN_API_KEY;
const baseUrl = process.env.RATARY_BASE_URL ?? process.env.AI_BRAIN_BASE_URL ?? 'http://localhost:9876';
const workspaceId = process.env.RATARY_WORKSPACE_ID ?? process.env.AI_BRAIN_WORKSPACE_ID;

if (!apiKey) {
  console.error('Set RATARY_API_KEY (or AI_BRAIN_API_KEY)');
  process.exit(1);
}

const client = new RataryClient({ baseUrl, apiKey, workspaceId });

const ctx = await client.context.build({ task: 'Implement feature X' });
console.log('Context chars:', ctx.context?.length ?? 0);

const saved = await client.memory.create({
  title: 'Handoff',
  content: ctx.context ?? '',
  tags: ['handoff'],
});
console.log('Saved memory:', saved.id ?? saved);
