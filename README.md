# AI Memory Cloud

Second brain untuk AI coding assistant — simpan, cari, dan akses seluruh knowledge coding Anda dari berbagai perangkat.

Kompatibel dengan: **Cursor**, **Claude Code**, **Roo Code**, **Cline**, **Gemini CLI**, **ChatGPT (via MCP)**, dan AI lain yang mendukung MCP.

## Tech Stack

- **Fastify** + **TypeScript** — REST API
- **Cloudflare D1** — SQLite serverless database (single source of truth)
- **MCP Server** — Model Context Protocol untuk integrasi AI
- **Zod** — validasi input
- **Pino** — structured logging
- **Swagger/OpenAPI** — dokumentasi API
- **Vitest** — testing
- **Vercel** — serverless deployment

## Arsitektur

```
src/
  routes/         → HTTP routing (no business logic)
  controllers/    → Request/response handling
  services/       → Business logic (MemoryService)
  repositories/   → D1 database access
  db/             → D1 client
  mcp/            → MCP server tools
  plugins/        → Fastify plugins
  types/          → Types & Zod schemas
  config/         → Environment config
```

REST API dan MCP **berbagi logic yang sama** melalui `MemoryService`.

## Quick Start

### 1. Setup Cloudflare D1

```bash
# Buat database D1 di Cloudflare Dashboard
# atau via Wrangler:
npx wrangler d1 create ai-memory-cloud
```

Catat:
- `database_id` → `D1_DATABASE_ID`
- Account ID → `CLOUDFLARE_ACCOUNT_ID`
- API Token (D1 Edit permission) → `D1_API_TOKEN`

### 2. Environment

```bash
cp .env.example .env
# Isi credentials Cloudflare D1
```

### 3. Install & Migrate

```bash
npm install
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

API tersedia di `http://localhost:3000`  
Dokumentasi Swagger di `http://localhost:3000/docs`

### 5. MCP Server (untuk Cursor / Claude Code)

Tambahkan ke konfigurasi MCP client Anda:

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "npx",
      "args": ["tsx", "src/mcp/stdio.ts"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id",
        "D1_DATABASE_ID": "your_database_id",
        "D1_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

Atau setelah build:

```bash
npm run mcp
```

## MCP Tools

| Tool | Deskripsi |
|------|-----------|
| `save_memory` | Simpan memory baru |
| `update_memory` | Update memory by ID |
| `delete_memory` | Hapus memory |
| `get_memory` | Ambil memory by ID |
| `search_memory` | Cari by keyword/tag/project |
| `list_projects` | Daftar semua project |
| `list_tags` | Daftar semua tag |
| `toggle_favorite` | Toggle favorite |
| `archive_memory` | Archive memory |

## REST API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/memory` | Buat memory |
| GET | `/memory/:id` | Get by ID |
| PUT | `/memory/:id` | Update |
| DELETE | `/memory/:id` | Delete |
| GET | `/memory` | List (filter: project, favorite, archived) |
| GET | `/search` | Search (q, tag, project, favorite) |
| GET | `/projects` | List projects |
| GET | `/tags` | List tags |
| POST | `/memory/:id/favorite` | Toggle favorite |
| POST | `/memory/:id/archive` | Archive |
| GET | `/backup/export` | Export JSON backup |
| POST | `/backup/import` | Import JSON backup |

## Data Model

Semua memory disimpan dalam satu tabel `memories`:

| Field | Type | Deskripsi |
|-------|------|-----------|
| id | TEXT (UUID) | Primary key |
| title | TEXT | Judul |
| project | TEXT | Nama project |
| content | TEXT | **Full markdown content** |
| summary | TEXT | Ringkasan singkat |
| tags | TEXT | JSON array string |
| favorite | INTEGER | 0/1 |
| archived | INTEGER | 0/1 |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

## Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables di Vercel Dashboard:
- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `D1_API_TOKEN`
- `API_KEY` (opsional, untuk proteksi REST API)

## Backup & Restore

```bash
# Export
curl https://your-app.vercel.app/backup/export > backup.json

# Import (merge)
curl -X POST https://your-app.vercel.app/backup/import \
  -H "Content-Type: application/json" \
  -d @backup.json

# Import (replace all)
curl -X POST "https://your-app.vercel.app/backup/import?replace=true" \
  -H "Content-Type: application/json" \
  -d @backup.json
```

## Development

```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # TypeScript check
npm run db:migrate   # Run D1 migrations
```

## Environment Variables

| Variable | Required | Deskripsi |
|----------|----------|-----------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `D1_DATABASE_ID` | Yes | D1 database ID |
| `D1_API_TOKEN` | Yes | Cloudflare API token dengan D1 permission |
| `API_KEY` | No | API key untuk proteksi REST endpoints |
| `PORT` | No | Server port (default: 3000) |
| `LOG_LEVEL` | No | Pino log level (default: info) |

## License

MIT
