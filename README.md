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

> **Pindah laptop?** Ikuti panduan lengkap di [Setup di Laptop Baru](#setup-di-laptop-baru).

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

API tersedia di `http://localhost:3000` (atau port di `.env`, mis. `3001`)  
Dokumentasi Swagger di `http://localhost:3000/docs`

### 5. MCP Server (untuk Cursor / Claude Code)

Salin template project MCP:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
# Edit path absolut ke repo Anda + isi credential D1
```

Contoh `.cursor/mcp.json` (sesuaikan path laptop Anda):

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "npx",
      "args": ["-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id",
        "D1_DATABASE_ID": "your_database_id",
        "D1_API_TOKEN": "your_api_token",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Global MCP** (opsional, semua workspace): edit `%USERPROFILE%\.cursor\mcp.json` dengan format yang sama.

Setelah simpan:
1. **Cursor → Settings → MCP** → pastikan `ai-memory-cloud` hijau/aktif
2. **Reload Window** jika perlu

Atau jalankan MCP standalone:

```bash
npm run mcp
```

---

## Setup di Laptop Baru

Panduan ini untuk memindahkan development environment ke laptop lain. **Data memory tetap di Cloudflare D1** (cloud) — yang perlu disetup ulang hanya kode lokal, `.env`, dan konfigurasi Cursor.

### Prasyarat

| Software | Versi | Cek |
|----------|-------|-----|
| Node.js | **24.x** | `node -v` |
| npm | 10+ | `npm -v` |
| Git | terbaru | `git --version` |
| Cursor | terbaru | — |

Akun yang harus bisa diakses:
- **GitHub** — clone repo `https://github.com/lutfi04/ai-brain.git`
- **Cloudflare** — Dashboard → D1 (database yang sama dengan laptop lama)
- **Vercel** (opsional) — jika pakai deploy production

### Langkah 1 — Clone repository

```bash
git clone https://github.com/lutfi04/ai-brain.git
cd ai-brain
```

### Langkah 2 — Credential Cloudflare D1

File `.env` **tidak** ada di Git. Ambil dari laptop lama (password manager / backup aman) atau buat ulang di Cloudflare Dashboard.

```bash
cp .env.example .env
```

Isi `.env`:

```env
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
D1_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
D1_API_TOKEN=your_cloudflare_api_token

NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Sesuaikan path folder backup di laptop baru
BACKUP_ROOT=D:/Apps/_backups
BACKUP_SYNC_DEBOUNCE_MS=3000
```

**Cara dapat nilai D1:**

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **D1**
2. Pilih database `ai-memory-cloud` (atau nama yang Anda pakai)
3. **Database ID** → `D1_DATABASE_ID`
4. **Account ID** (sidebar kanan) → `CLOUDFLARE_ACCOUNT_ID`
5. **My Profile → API Tokens** → buat token dengan permission **D1 Edit** → `D1_API_TOKEN`

> **Tips:** `CLOUDFLARE_ACCOUNT_ID` adalah string hex 32 karakter, **bukan** email.

### Langkah 3 — Install & migrasi database

```bash
npm install
npm run db:migrate
```

`db:migrate` aman dijalankan ulang — hanya membuat tabel jika belum ada.

Verifikasi koneksi D1:

```bash
npm run test:integration
```

Output harus menampilkan `All integration tests passed!`

### Langkah 4 — Jalankan server lokal

**Mode development (disarankan):**

```bash
npm run dev
```

**Mode production lokal:**

```bash
npm run build:local
npm start
```

Cek API:

```bash
curl http://localhost:3001/health
# {"status":"ok",...}

curl http://localhost:3001/memory?limit=3
# Daftar memory dari D1 (sama dengan laptop lama)
```

Swagger UI: `http://localhost:3001/docs`

> Jika port 3000 bentrok dengan app lain (Nuxt, dll.), set `PORT=3001` di `.env`.

### Langkah 5 — Setup MCP di Cursor

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edit `.cursor/mcp.json`:
- Ganti path `D:/Apps/ai-brain/...` ke path absolut repo di laptop baru
- Isi `CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID`, `D1_API_TOKEN`

Reload Cursor → **Settings → MCP** → pastikan `ai-memory-cloud` aktif.

Uji di chat Cursor:

```
search_memory query="mangrove"
```

### Langkah 6 — Folder backup chat (opsional)

Jika Anda punya folder backup chat di laptop lama, salin ke laptop baru (USB / cloud sync):

```
D:\Apps\_backups\
```

Update `BACKUP_ROOT` di `.env` sesuai path baru.

**Import sekali (semua backup lama):**

```bash
npm run import:backups
npm run import:backups -- --include-jsonl   # termasuk transcript JSONL
```

**Auto-sync ke memory (disarankan):**

Terminal 1 — API:
```bash
npm run dev
```

Terminal 2 — watcher backup:
```bash
npm run sync:backups:watch
```

Setiap file baru di `_backups` otomatis masuk ke D1.

### Langkah 7 — Production API (opsional)

Tanpa server lokal, memory tetap bisa diakses via deploy Vercel:

```
https://ai-brain-beryl.vercel.app/health
https://ai-brain-beryl.vercel.app/memory
```

Env vars di **Vercel Dashboard** harus sama dengan `.env` lokal.

---

### Checklist pindah laptop

- [ ] Clone repo `ai-brain`
- [ ] `npm install`
- [ ] Salin / buat `.env` dengan credential D1
- [ ] `npm run db:migrate`
- [ ] `npm run test:integration` → lulus
- [ ] `npm run dev` → `/health` OK
- [ ] Setup `.cursor/mcp.json` + reload Cursor
- [ ] MCP `ai-memory-cloud` hijau di Settings
- [ ] (Opsional) Salin folder `_backups` + set `BACKUP_ROOT`
- [ ] (Opsional) `npm run sync:backups:watch` untuk auto-sync

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Environment validation failed` | Pastikan 3 variabel D1 terisi di `.env` |
| `D1 API error (401)` | Token salah/expired — buat API token baru |
| `D1 API error (400)` account | `CLOUDFLARE_ACCOUNT_ID` harus hex ID, bukan email |
| Port sudah dipakai | Ganti `PORT=3001` di `.env` |
| MCP tidak muncul | Cek path absolut di `mcp.json`, reload Cursor |
| Memory kosong (`total: 0`) | Pastikan `D1_DATABASE_ID` sama dengan laptop lama |
| `npm start` error | Jalankan `npm run build:local` dulu, atau pakai `npm run dev` |
| Sync backup gagal | Cek `BACKUP_ROOT` ada dan path pakai `/` di `.env` |

### Perintah berguna

```bash
npm run dev                  # Server dev + hot reload
npm run test                 # Unit test
npm run test:integration     # Test CRUD ke D1
npm run mcp                  # MCP stdio standalone
npm run import:backups       # Import markdown backup
npm run import:transcript -- "path/to/transcript.jsonl"
npm run sync:backups         # Sync backup sekali
npm run sync:backups:watch   # Auto-sync folder backup
npm run sync:file -- "path/to/README.md"
```

---

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

**Penting — Vercel Build Settings:**
- **Framework Preset:** Other
- **Install Command:** `npm install` (jangan tambahkan `db:migrate`)
- **Build Command:** kosong / override dengan `vercel.json` (`buildCommand: null`)
- **Output Directory:** `public` (folder static minimal, API di `/api` via rewrite)

Entrypoint Vercel: `api/index.ts` (default export handler). Proyek ini **API-only**, tanpa static site.

Migrasi database cukup dijalankan **sekali secara lokal** sebelum deploy pertama:
```bash
npm run db:migrate
```

## Backup & Restore

### Export / import JSON

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

### Sync folder chat backup → memory

Lihat [Langkah 6 — Folder backup chat](#langkah-6--folder-backup-chat-opsional) di panduan setup laptop baru.

| Perintah | Fungsi |
|----------|--------|
| `npm run sync:backups` | Scan & sync file baru/berubah |
| `npm run sync:backups:watch` | Pantau folder real-time |
| `npm run sync:file -- <path>` | Sync satu file setelah backup |
| `npm run import:backups` | Import massal markdown backup |

## Development

```bash
npm run dev          # Start dev server (disarankan)
npm run build:local  # Compile TypeScript → dist/
npm start            # Jalankan dist/ (butuh build:local dulu)
npm run test         # Run tests
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # TypeScript check
npm run db:migrate   # Run D1 migrations
```

## Environment Variables

| Variable | Required | Deskripsi |
|----------|----------|-----------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID (hex 32 karakter) |
| `D1_DATABASE_ID` | Yes | D1 database ID |
| `D1_API_TOKEN` | Yes | Cloudflare API token dengan D1 permission |
| `API_KEY` | No | API key untuk proteksi REST endpoints |
| `PORT` | No | Server port (default: 3000) |
| `LOG_LEVEL` | No | Pino log level (default: info) |
| `BACKUP_ROOT` | No | Path folder backup chat (default: `D:/Apps/_backups`) |
| `BACKUP_SYNC_DEBOUNCE_MS` | No | Delay sebelum sync file (default: 3000) |
| `BACKUP_SYNC_POLL_MS` | No | Interval polling sync (default: 30000) |

## License

MIT
