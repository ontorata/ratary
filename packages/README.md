# npm packages (`@ratary`)

TypeScript client libraries for [Ratary Server](https://github.com/ontorata/ratary). Published on npm under the **`@ratary`** scope ([npm org](https://www.npmjs.com/org/ratary)), maintained by [Ontorata](https://ontorata.com).

The scope matches the **product name** (Ratary), not the company name. GitHub and npm publisher identity remain **Ontorata** (`ontorata/ratary`).

---

## Packages

| Package | npm | Use when |
|---------|-----|----------|
| [`@ratary/sdk`](sdk/) | [npmjs.com/package/@ratary/sdk](https://www.npmjs.com/package/@ratary/sdk) | Headless REST client in Node, Studio, or custom agents |
| [`@ratary/cli`](cli/) | [npmjs.com/package/@ratary/cli](https://www.npmjs.com/package/@ratary/cli) | Operator commands against a hosted or local Ratary |
| [`@ratary/mcp-server`](mcp-server/) | [npmjs.com/package/@ratary/mcp-server](https://www.npmjs.com/package/@ratary/mcp-server) | IDE stdio MCP proxy to a **remote** Ratary REST API |

---

## Install

```bash
npm install @ratary/sdk
npm install -g @ratary/cli @ratary/mcp-server   # optional global CLIs
```

No server clone required — point clients at your Ratary URL and API key (`aic_...`).

### SDK quick start

```typescript
import { RataryClient } from '@ratary/sdk';

const client = new RataryClient({
  baseUrl: process.env.RATARY_BASE_URL!,
  apiKey: process.env.RATARY_API_KEY!,
});

const results = await client.memory.search({ query: 'deployment' });

// Phase 28 — admin surfaces (cloud, observability, infrastructure, platform, fabric, federation)
const cloudStatus = await client.admin.cloud.getStatus();
const connectors = await client.admin.knowledgeFabric.listConnectors();
```

### MCP (hosted brain)

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://your-host.example.com",
        "RATARY_API_KEY": "aic_your_key_here"
      }
    }
  }
}
```

Full guide: [docs/install/remote.md](../docs/install/remote.md).

### CLI

```bash
export RATARY_BASE_URL=https://your-host.example.com
export RATARY_API_KEY=aic_...
ratary --help
ratary admin cloud status
ratary connectors sync notion --mode incremental
```

**Live connector sync (Phase 29):** requires server `KNOWLEDGE_FABRIC_ENABLED=true` and `CONNECTOR_SYNC_ENABLED=true` plus vendor token (e.g. `NOTION_API_TOKEN`).

---

## Monorepo development

From the repository root:

```bash
npm install
npm run build:packages    # sdk → cli → mcp-server
npm run test              # includes SDK tests when tests/ present locally
```

Workspace packages live under `packages/`. Server source stays in `src/` — no agent runtime in npm packages.

---

## Publishing (maintainers)

1. Bump version in `packages/*/package.json` (keep `@ratary/cli` and `@ratary/mcp-server` aligned on `@ratary/sdk`).
2. `npm run build:packages`
3. Publish each package with public access:

```bash
cd packages/sdk && npm publish --access public
cd ../cli && npm publish --access public
cd ../mcp-server && npm publish --access public
```

Requires membership in the [npm `@ratary` org](https://www.npmjs.com/org/ratary). npm 2FA (passkey) uses browser auth during publish — do not rely on `--otp` alone.

---

## Related

| Doc | Purpose |
|-----|---------|
| [SDK/README.md](../SDK/README.md) | Example scripts using `@ratary/sdk` |
| [docs/GUIDE.md](../docs/GUIDE.md) | Server setup + client env vars |
| [MCP/README.md](../MCP/README.md) | stdio vs npm vs remote MCP |
