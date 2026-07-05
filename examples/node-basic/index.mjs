/**
 * Minimal Node.js example — uses @ratary/sdk only.
 *
 * Usage:
 *   AI_BRAIN_API_KEY=aic_... node examples/node-basic/index.mjs
 */
import { AiBrainClient } from '@ratary/sdk';

const client = new AiBrainClient({
  baseUrl: process.env.AI_BRAIN_BASE_URL ?? 'http://localhost:3000',
  apiKey: process.env.AI_BRAIN_API_KEY,
});

const manifest = await client.capabilities.get();
console.log('Protocol:', manifest.protocolVersion ?? manifest);

const catalog = await client.ecosystem.listClients();
console.log('Certified clients:', catalog.count);

if (process.env.AI_BRAIN_API_KEY) {
  const search = await client.memory.search({ q: 'handoff', limit: 3 });
  console.log('Search results:', search.results?.length ?? 0);
}
