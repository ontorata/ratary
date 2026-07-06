/**
 * Minimal Node.js example — uses @ratary/sdk only.
 *
 * Usage:
 *   RATARY_API_KEY=aic_... node SDK/index.mjs
 */
import { RataryClient } from '@ratary/sdk';

const apiKey = process.env.RATARY_API_KEY ?? process.env.AI_BRAIN_API_KEY;
const baseUrl = process.env.RATARY_BASE_URL ?? process.env.AI_BRAIN_BASE_URL ?? 'http://localhost:9876';

const client = new RataryClient({ baseUrl, apiKey });

const manifest = await client.capabilities.get();
console.log('Protocol:', manifest.protocolVersion ?? manifest);

const catalog = await client.ecosystem.listClients();
console.log('Certified clients:', catalog.count);

if (apiKey) {
  const search = await client.memory.search({ q: 'handoff', limit: 3 });
  console.log('Search results:', search.results?.length ?? 0);
}
