# SDK quick example

Minimal script showing how to call Ratary via `@ratary/sdk` (no MCP, no IDE).

Requires local server (`npm run dev`) and an API key.

```bash
npm run build:sdk
RATARY_API_KEY=aic_... node SDK/index.mjs
```

Legacy env aliases `AI_BRAIN_API_KEY` and `AI_BRAIN_BASE_URL` are still accepted.
