# Ratary — OpenCode install entrypoint

Install **Ratary Memory MCP** (`ratary`) for OpenCode harnesses.

## Steps

1. Clone Ratary and install dependencies:

   ```bash
   git clone https://github.com/ontorata/ratary.git
   cd ratary
   npm install
   cp .env.example .env
   ```

2. Fill D1 credentials in `.env` — see [docs/CONFIGURATION.md](docs/CONFIGURATION.md) Tier 0.

3. Migrate and generate MCP config:

   ```bash
   npm run db:migrate
   npm run setup
   ```

4. Point OpenCode MCP at the generated stdio config (`.cursor/mcp.json` pattern) or use hosted `@ratary/mcp-server` — [docs/install/remote.md](docs/install/remote.md).

5. Verify: search memory for `ratary` in an OpenCode session.

Full harness index: [docs/install/README.md](docs/install/README.md).
