# AI Memory Cloud

Second brain untuk AI coding assistant — simpan, cari, dan akses seluruh knowledge coding Anda dari berbagai perangkat.

Kompatibel dengan: **Cursor**, **Claude Code**, **Roo Code**, **Cline**, **Gemini CLI**, **ChatGPT (REST API)**, dan AI lain yang mendukung MCP stdio.  
→ Panduan lengkap: **[docs/PANDUAN.md](docs/PANDUAN.md)**

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

**Konstitusi (wajib untuk semua agent):** **[docs/AI_BRAIN_CONSTITUTION.md](docs/AI_BRAIN_CONSTITUTION.md)**

Detail operasional: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

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

## Roadmap

| Fase | Status | Dokumen |
|------|--------|---------|
| Phase 1 — Foundation | ✅ | README Quick Start |
| Phase 2 — Identity & Auth | ✅ | README Auth endpoints |
| **Phase 2.5 — Stabilization** | ✅ | [archive](docs/archive/) |
| **Phase 2.6 — Knowledge Foundation** | ✅ | [archive](docs/archive/) |
| **Phase 3 — JWT/OAuth & Permissions** | ✅ | [archive](docs/archive/) |
| **Phase 4 — Memory Intelligence** | ✅ | [archive](docs/archive/) · panduan: **[docs/PANDUAN.md](docs/PANDUAN.md)** |

## Quick Start

> **Mulai di sini:** [docs/PANDUAN.md](docs/PANDUAN.md) — setup 3 langkah, cara pakai, MCP.

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

### 3. Install, Migrate & Setup MCP

```bash
npm install
npm run db:migrate
npm run setup
```

`npm run setup` membuat config MCP untuk **Cursor** dan **Claude Code** otomatis (path + `.env`).

### 4. Run Development Server

```bash
npm run dev
```

API tersedia di `http://localhost:3000` (atau port di `.env`, mis. `3001`)  
Dokumentasi Swagger di `http://localhost:3000/docs`

### 5. MCP Server (semua AI client)

Server MCP stdio — koneksi langsung ke D1, **tanpa** API key `aic_...`.

**Panduan MCP & multi-client:** [docs/PANDUAN.md](docs/PANDUAN.md) §6  
(Cursor, Claude Code, Roo Code, Cline, Gemini CLI, ChatGPT, Claude Desktop, Windsurf, VS Code, dll.)

#### Cursor & Claude Code (1 perintah)

→ **[docs/PANDUAN.md](docs/PANDUAN.md)**

```bash
npm run setup
```

Lalu Cursor: **Settings → MCP** hijau → Reload.  
Claude Code: `claude` di folder repo → approve server.

| Client | File config | Template |
|--------|-------------|----------|
| Cursor | `.cursor/mcp.json` | `.cursor/mcp.json.example` |
| Claude Code | `.mcp.json` | `mcp.json.example` |
| Roo Code | `.roo/mcp.json` | `.roo/mcp.json.example` |
| Gemini CLI | `.gemini/settings.json` | `docs/examples/gemini-settings.json.example` |
| Cline | via UI → MCP settings JSON | lihat panduan |

Contoh konfigurasi (sesuaikan path):

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

**Windows:** jika MCP gagal connect, pakai `"command": "cmd"` — detail di [PANDUAN.md](docs/PANDUAN.md).

**ChatGPT:** MCP stdio tidak didukung — gunakan **REST API** + API key. Lihat [PANDUAN.md](docs/PANDUAN.md).

Setelah simpan config:
1. Reload / restart client AI
2. Pastikan server `ai-memory-cloud` connected (hijau / tools ter-list)
3. Uji: `search_memory` dengan query apa saja

Atau jalankan MCP standalone:

```bash
npm run mcp
```

---

## Setup di Laptop Baru

Panduan lengkap memindahkan **AI Brain** ke laptop baru.  
Baca ini sebelum atau sesudah pindah perangkat.

### Apa yang ikut pindah vs tetap di cloud

| Ikut Anda (backup manual) | Tetap di cloud (tidak hilang) |
|---------------------------|-------------------------------|
| File `.env` (credential) | Semua **memory** di D1 |
| `AUTH_SECRET` (wajib sama!) | Tabel `identities`, `audit_logs` |
| API key `aic_...` (simpan di password manager) | Deploy Vercel |
| `.cursor/mcp.json` (path + env) | Repo GitHub |
| Folder `D:\Apps\_backups` (opsional) | |

> **Penting:** `AUTH_SECRET` harus **sama** dengan laptop lama. Jika diganti, semua API key di database tidak bisa diverifikasi lagi.

---

### Sebelum tinggalkan laptop lama

Salin ke password manager / USB terenkripsi:

```
□ Isi file .env lengkap (atau minimal 4 variabel di bawah)
□ API key aic_... (dari saat bootstrap — tidak bisa dilihat ulang dari DB)
□ .cursor/mcp.json (jika sudah dikonfigurasi)
□ Folder _backups (opsional, kalau mau offline copy chat)
```

**Variabel wajib di `.env`:**

```env
CLOUDFLARE_ACCOUNT_ID=...
D1_DATABASE_ID=...
D1_API_TOKEN=...
AUTH_SECRET=...          # min 32 karakter — HARUS sama dengan laptop lama
PORT=3001
BACKUP_ROOT=D:/Apps/_backups
```

Generate `AUTH_SECRET` baru **hanya** jika database masih kosong dan belum bootstrap.

---

### Prasyarat software

| Software | Versi | Cek |
|----------|-------|-----|
| Node.js | **24.x** | `node -v` |
| npm | 10+ | `npm -v` |
| Git | terbaru | `git --version` |
| Cursor | terbaru | — |

Akun yang dibutuhkan:
- [GitHub](https://github.com/lutfi04/ai-brain) — clone repo
- [Cloudflare](https://dash.cloudflare.com) — D1 database
- [Vercel](https://vercel.com) (opsional) — production API

---

### Langkah 1 — Clone & install

```bash
git clone https://github.com/lutfi04/ai-brain.git
cd ai-brain
npm install
```

---

### Langkah 2 — Buat `.env`

```bash
cp .env.example .env
```

Isi dengan credential dari laptop lama:

```env
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
D1_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
D1_API_TOKEN=your_cloudflare_api_token

AUTH_SECRET=your_auth_secret_min_32_characters_long

NODE_ENV=development
PORT=3001
LOG_LEVEL=info

BACKUP_ROOT=D:/Apps/_backups
BACKUP_SYNC_DEBOUNCE_MS=3000
```

**Cara dapat credential D1** (jika belum punya salinan):

1. Cloudflare Dashboard → **Workers & Pages** → **D1**
2. Pilih database Anda → copy **Database ID**
3. Sidebar kanan → copy **Account ID** (hex 32 char, bukan email)
4. **My Profile → API Tokens** → buat token **D1 Edit**

**`AUTH_SECRET`:** salin dari laptop lama. Jika hilang dan sudah ada identities di DB, Anda harus reset database atau buat DB baru.

---

### Langkah 3 — Migrasi & verifikasi D1

```bash
npm run db:migrate
npm run test:integration
```

Harus muncul: `All integration tests PASSED against Cloudflare D1`

---

### Langkah 4 — Jalankan server

```bash
npm run dev
```

Cek:

```bash
curl http://localhost:3001/health
# {"status":"ok",...}

curl http://localhost:3001/api/v1/memory?limit=3 \
  -H "Authorization: Bearer aic_YOUR_KEY"
```

> Tanpa API key, endpoint memory mengembalikan **401**.

Swagger: `http://localhost:3001/docs`

---

### Langkah 5 — Authentication (API key)

#### Skenario A — Sudah bootstrap di laptop lama (umum)

1. Pakai API key `aic_...` yang sudah disimpan
2. Verifikasi:

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify \
  -H "Authorization: Bearer aic_YOUR_KEY"
```

Response: `{ "success": true, "data": { "authenticated": true, ... } }`

3. **Jangan** jalankan `/auth/bootstrap` lagi (akan ditolak 403)

#### Skenario B — Database baru / belum pernah bootstrap

```bash
curl -X POST http://localhost:3001/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"cursor\",\"client\":{\"name\":\"cursor\",\"type\":\"mcp\"}}"
```

Simpan `data.apiKey` — **hanya muncul sekali**.

#### Buat API key tambahan (setelah punya key aktif)

```bash
curl -X POST http://localhost:3001/api/v1/auth/identities \
  -H "Authorization: Bearer aic_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"laptop-baru\",\"type\":\"api_key\"}"
```

---

### Langkah 6 — Setup MCP

Ikuti **[docs/PANDUAN.md](docs/PANDUAN.md)** untuk client Anda (Cursor, Claude Code, Roo, Cline, Gemini CLI, dll.).

Ringkas Cursor:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edit path absolut + credential D1 → **Settings → MCP** → `ai-memory-cloud` hijau → uji `search_memory`.

---

### Langkah 7 — Folder backup chat (opsional)

Salin dari laptop lama:

```
D:\Apps\_backups\
```

Update `BACKUP_ROOT` di `.env`.

```bash
# Import sekali
npm run import:backups

# Auto-sync (terminal terpisah)
npm run sync:backups:watch
```

---

### Langkah 8 — Production (Vercel)

URL: `https://ai-brain-beryl.vercel.app`

**Env vars di Vercel Dashboard** (harus sama dengan lokal):

| Variable | Wajib |
|----------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | Ya |
| `D1_DATABASE_ID` | Ya |
| `D1_API_TOKEN` | Ya |
| `AUTH_SECRET` | Ya |

```bash
curl https://ai-brain-beryl.vercel.app/health
curl https://ai-brain-beryl.vercel.app/api/v1/memory?limit=3 \
  -H "Authorization: Bearer aic_YOUR_KEY"
```

---

### Checklist pindah laptop

```
□ Clone repo + npm install
□ Salin .env (D1 + AUTH_SECRET)
□ npm run db:migrate
□ npm run test:integration → lulus
□ npm run dev → /health OK
□ API key aic_... tersimpan & /auth/verify OK
□ .cursor/mcp.json + MCP hijau di Cursor
□ (Opsional) Salin _backups + sync:backups:watch
□ (Opsional) Vercel env vars lengkap
```

---

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Environment validation failed` | Isi `CLOUDFLARE_*`, `D1_*`, `AUTH_SECRET` |
| `AUTH_SECRET is required` | Tambah ke `.env` (min 32 char) |
| API key selalu 401 | `AUTH_SECRET` beda dengan saat key dibuat |
| `D1 API error (401)` | Token Cloudflare expired — buat baru |
| `CLOUDFLARE_ACCOUNT_ID` salah | Harus hex ID, bukan email |
| Port bentrok | `PORT=3001` di `.env` |
| Memory `total: 0` | `D1_DATABASE_ID` salah (DB berbeda) |
| Bootstrap 403 | Normal — sudah pernah bootstrap |
| MCP tidak hijau | Cek path absolut `tsx` di mcp.json |
| `npm start` gagal | `npm run build:local` dulu, atau pakai `npm run dev` |

---

### Perintah cepat

```bash
npm run dev                    # Server lokal
npm run test                   # 27 unit + E2E tests
npm run test:integration       # Test D1 live
npm run mcp                    # MCP standalone
npm run import:backups         # Import backup markdown
npm run sync:backups:watch     # Auto-sync _backups → D1
```

### Diagram alur singkat

```
Laptop Baru
    │
    ├─ git clone + npm install
    ├─ .env (D1 + AUTH_SECRET + PORT)
    ├─ db:migrate + test:integration
    ├─ npm run dev
    │
    ├─ REST API ──► Authorization: Bearer aic_...
    │                    │
    │                    ▼
    │              Cloudflare D1 (memory + identities)
    │
    └─ Cursor MCP ──► D1 langsung (tanpa API key)
```

---

## MCP Tools

Panduan setup per client: **[docs/PANDUAN.md](docs/PANDUAN.md)**

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

### Auth (`/api/v1/auth/*`) — response format `{ success, data }`

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/v1/auth/bootstrap` | Tidak* | One-time setup (hanya jika DB kosong) |
| POST | `/api/v1/auth/identities` | Ya | Buat API key baru |
| GET | `/api/v1/auth/identities` | Ya | List identities (tanpa secret) |
| DELETE | `/api/v1/auth/identities/:id` | Ya | Revoke (soft) |
| POST | `/api/v1/auth/identities/:id/rotate` | Ya | Rotate secret |
| POST | `/api/v1/auth/verify` | Ya | Cek credential aktif |
| POST | `/api/v1/auth/clients` | Ya | Daftarkan client app |
| GET | `/api/v1/auth/clients` | Ya | List clients owner |
| GET | `/api/v1/auth/clients/:id` | Ya | Detail client |
| PATCH | `/api/v1/auth/clients/:id` | Ya | Update / deactivate client |

\*Bootstrap hanya aktif sekali selamanya.

**Header auth:** `Authorization: Bearer aic_...` atau `X-API-Key: aic_...`

```bash
# Bootstrap (sekali, setelah db:migrate)
curl -X POST http://localhost:3001/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"cursor","client":{"name":"cursor","type":"mcp"}}'

# Pakai API key
curl http://localhost:3001/api/v1/memory \
  -H "Authorization: Bearer aic_xxxx..."
```

### Memory & backup (`/api/v1/*`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` atau `/api/v1/health` | Health check |
| POST | `/api/v1/memory` | Buat memory |
| GET | `/api/v1/memory/:id` | Get by ID |
| PUT | `/api/v1/memory/:id` | Update |
| DELETE | `/api/v1/memory/:id` | Delete |
| GET | `/api/v1/memory` | List |
| GET | `/api/v1/search` | Search |
| GET | `/api/v1/projects` | List projects |
| GET | `/api/v1/tags` | List tags |
| POST | `/api/v1/memory/:id/favorite` | Toggle favorite |
| POST | `/api/v1/memory/:id/archive` | Archive |
| POST | `/api/v1/auth/token` | Issue JWT |
| GET | `/api/v1/backup/export` | Export JSON |
| POST | `/api/v1/backup/import` | Import JSON |

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
- `AUTH_SECRET`

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
npm run dev          # Start dev server (disarankan, graceful shutdown)
npm run build:local  # Compile TypeScript → dist/
npm start            # Jalankan dist/ (butuh build:local dulu)
npm run test         # Run tests (unit + API E2E)
npm run lint         # ESLint
npm run format       # Prettier
npm run format:check # CI format gate
npm run typecheck    # TypeScript check
npm run db:migrate   # Run D1 migrations
```

**CI:** GitHub Actions menjalankan `lint`, `format:check`, `typecheck`, `test` pada setiap push/PR ke `main`.

**Health:** `GET /health` memeriksa koneksi D1 — mengembalikan `503` jika database tidak dapat dijangkau.

Lihat **[docs/archive/PHASE-2.5.md](docs/archive/PHASE-2.5.md)** untuk checklist stabilisasi lengkap.

## Environment Variables

| Variable | Required | Deskripsi |
|----------|----------|-----------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID (hex 32 karakter) |
| `D1_DATABASE_ID` | Yes | D1 database ID |
| `D1_API_TOKEN` | Yes | Cloudflare API token dengan D1 permission |
| `AUTH_SECRET` | Yes (prod) | HMAC secret min 32 char (`openssl rand -hex 32`) |
| `MCP_OWNER_ID` | No | Scope memory MCP (default: `''` = legacy shared pool) |
| `PORT` | No | Server port (default: 3000) |
| `LOG_LEVEL` | No | Pino log level (default: info) |
| `BACKUP_ROOT` | No | Path folder backup chat (default: `D:/Apps/_backups`) |
| `BACKUP_SYNC_DEBOUNCE_MS` | No | Delay sebelum sync file (default: 3000) |
| `BACKUP_SYNC_POLL_MS` | No | Interval polling sync (default: 30000) |

## License

MIT
