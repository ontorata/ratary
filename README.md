# AI Memory Cloud

Second brain untuk AI coding assistant — simpan, cari, dan akses seluruh knowledge coding Anda dari berbagai perangkat.

Kompatibel dengan: **Cursor**, **Claude Code**, **Roo Code**, **Cline**, **Gemini CLI**, **ChatGPT (REST API)**, dan AI lain yang mendukung MCP stdio.  
→ Panduan lengkap: **[docs/PANDUAN.md](docs/PANDUAN.md)**

## Kenapa AI Brain?

AI Brain bukan sekadar “simpan catatan” — ini **memory foundation** yang dirancang khusus untuk asisten coding: scoped per owner, diakses lewat **MCP + REST** dengan logic yang sama, dan dioptimalkan agar **hemat token** tanpa kehilangan jejak knowledge (codename, relasi, graph).

### Benchmark token context

Fixture standar repo: **20 memory × ~2.400 karakter body** + summary otomatis (≤300 karakter).  
Estimasi token memakai heuristic `chars/4` (±10% vs tokenizer model nyata).

Jalankan ulang kapan saja:

```bash
npm run benchmark:context-tokens
```

| Strategi | Token (~) | Penghematan vs dump mentah |
|----------|-----------|----------------------------|
| Naive full dump (semua body) | ~10.935 | 0% (baseline) |
| ContextBuilder default (12k chars) | ~2.541 | **76,8%** |
| **Summary-only (default MCP `get_context`)** | **~1.588** | **85,5%** |
| Summary-only (top 5 memory) | ~402 | **96,3%** |
| Codename index (fetch on demand) | ~305 | **97,2%** |

**Implikasi praktis:** dengan default summary-only, Anda bisa memasukkan **~7× lebih banyak konteks** ke jendela token yang sama — atau membayar jauh lebih sedikit untuk handoff antar sesi AI.

Progressive retrieval (`IRetrievalPolicy`) dan capability manifest (`GET /api/v1/capabilities`) membuat perilaku ini **terprediksi dan discoverable** oleh agent runtime eksternal.

### Perbandingan singkat vs proyek sejenis

| Aspek | AI Brain | Mem0 / Zep (hosted memory) | Cursor memory built-in | RAG generik (vector DB + chunk) |
|-------|----------|----------------------------|------------------------|----------------------------------|
| **Self-host & data sovereignty** | ✅ D1/Postgres milik Anda | ⚠️ SaaS / cloud vendor | ❌ Terikat Cursor | ⚠️ Tergantung stack |
| **MCP native (Cursor, Claude Code, …)** | ✅ 20 tools + stdio | ✅ (Mem0 MCP) | ✅ (hanya Cursor) | ❌ Perlu glue code |
| **REST + OpenAPI + auth** | ✅ API key, RBAC, audit | ✅ (berbayar tier) | ❌ | ⚠️ DIY |
| **Owner / workspace isolation** | ✅ ADR-governed, 457 tests | ⚠️ Tenant model vendor | ❌ Single user | ⚠️ DIY |
| **Knowledge graph + relasi** | ✅ BFS traverse, hybrid retrieval | ⚠️ Graph di Zep | ❌ | ❌ |
| **Token-efficient context default** | ✅ Summary-first ~85%+ | ⚠️ Bervariasi | ⚠️ Tidak terukur | ❌ Sering dump full chunk |
| **Agent runtime di repo** | ❌ By design (boundary jelas) | ⚠️ Kadang bundled | ✅ | N/A |
| **Arsitektur & ADR** | ✅ 26 ADR, fase 1–10 + tracks | ⚠️ Closed source / docs terbatas | ❌ | ❌ |

### Analisis SWOT

| | |
|---|---|
| **Strengths (Kekuatan)** | Memory foundation matang (fase 1–10 ✅); **MCP + REST satu codebase**; default **summary-only ~85% hemat token**; hybrid retrieval (SQL + vector + graph); multi-AI workspace; **457 automated tests**; manifest capability untuk agent; self-host Cloudflare D1 (free tier) atau Postgres enterprise |
| **Weaknesses (Kelemahan)** | Butuh setup D1/env sendiri (bukan plug-and-play SaaS); tidak ada UI dashboard siap pakai; embedding OpenAI opsional (noop default); dokumentasi orientasi developer/architect |
| **Opportunities (Peluang)** | Tim multi-AI (Cursor + Claude Code + custom bot) sharing satu brain; cutover Postgres/R2/pgvector (fase 11); semantic compression & quality signals (tracks 5.5–8.5); integrasi CI/handoff otomatis via MCP |
| **Threats (Ancaman)** | Vendor memory SaaS (Mem0, Zep) bergerak cepat; Cursor/IDE menambah memory native yang “cukup baik” untuk solo dev; risiko scope creep ke agent runtime (dicegah konstitusi) |

**Kapan pilih AI Brain?** Anda butuh **memori coding persisten, portable antar AI client, terukur token-nya, dan under your control** — bukan sekadar chat history atau RAG dokumen generik.

**Kapan pertimbangkan alternatif?** Solo dev yang hanya pakai Cursor dan tidak peduli portability → built-in memory mungkin cukup. Tim yang ingin zero-ops sepenuhnya → SaaS memory layer. Use case pure document Q&A tanpa struktur memory → RAG vector store saja.

### Dukungan platform

#### AI client & protokol (saat ini ✅)

| Platform | Cara akses | Status | Catatan |
|----------|------------|--------|---------|
| **Cursor** | MCP stdio | ✅ Didukung | `npm run setup` → `.cursor/mcp.json` |
| **Claude Code** | MCP stdio | ✅ Didukung | `.mcp.json` |
| **Roo Code** | MCP stdio | ✅ Didukung | `.roo/mcp.json` |
| **Cline** | MCP stdio | ✅ Didukung | via UI MCP settings |
| **Gemini CLI** | MCP stdio | ✅ Didukung | `.gemini/settings.json` |
| **VS Code Copilot** | MCP stdio | ✅ Didukung | `.vscode/mcp.json` |
| **Claude Desktop** | MCP stdio | ✅ Didukung | config global `%APPDATA%\Claude\` |
| **Windsurf / IDE MCP-compatible** | MCP stdio | ✅ Didukung* | *Setara MCP stdio generik |
| **Custom bot / CI** | REST API | ✅ Didukung | `Authorization: Bearer aic_...` |
| **ChatGPT / Actions** | REST API | ✅ Didukung | MCP stdio **tidak** didukung ChatGPT |
| **ChatGPT New App (MCP URL)** | MCP remote HTTPS | ✅ Opt-in (`REMOTE_MCP_ENABLED=true`) | [13.1](.ai/phases/13.1-remote-mcp-clients/README.md) · OAuth: `REMOTE_MCP_OAUTH_ENABLED` |
| **Agent runtime eksternal** | REST + MCP | ✅ Didukung | `GET /api/v1/capabilities`, 20 MCP tools |

Semua client MCP di atas **menulis ke D1/Postgres yang sama** — memory portable antar AI.

#### Runtime & deploy (saat ini ✅)

| Platform | Peran | Status |
|----------|-------|--------|
| **Node.js 24.x** | Runtime wajib | ✅ |
| **Windows / macOS / Linux** | Dev + MCP | ✅ |
| **Local dev** | `npm run dev` | ✅ |
| **Vercel** | REST API produksi | ✅ `ai-brain-beryl.vercel.app` |
| **Cloudflare D1** | Metadata DB default | ✅ |

#### Storage & adapter infrastruktur (saat ini ✅ opt-in)

Default deploy = **D1-only** (tanpa adapter eksternal). Adapter di bawah aktif via env ([PANDUAN §8](docs/PANDUAN.md)):

| Kategori | Provider didukung | Default | Opt-in |
|----------|-------------------|---------|--------|
| Metadata SQL | Cloudflare D1, **PostgreSQL** | D1 | `SQL_PROVIDER=postgres` |
| Vector store | D1 inline, **pgvector** | D1 | `VECTOR_PROVIDER=pgvector` |
| Object storage | inline, **Cloudflare R2**, **S3** | inline | `OBJECT_STORAGE_PROVIDER=r2\|s3` |
| Search index | SQL lexical, **Meilisearch** | sql | `SEARCH_PROVIDER=meilisearch` |
| Graph store | D1 relations, **Neo4j** | d1 | `GRAPH_PROVIDER=neo4j` |
| Cache | none, memory, **Redis/Valkey** | none | `CACHE_PROVIDER=redis` |
| Event bus | none, noop, **Redis Streams** | none | `EVENT_BUS_PROVIDER=redis` |
| Analytics | none, **DuckDB** (dev ref) | none | `ANALYTICS_PROVIDER=duckdb` |
| Embedding | noop, **OpenAI** | noop | `EMBEDDING_PROVIDER=openai` |

#### Roadmap platform (berikutnya 🔲)

| Fase | Fokus | Platform / capability baru |
|------|-------|----------------------------|
| **11 — Production Ops** 🔄 | Cutover metadata | **Postgres produksi** (ADR-018), staging harness, runbook rollback |
| **12 — Event Pipeline** 🔲 | Async & observability | **Redis Streams consumers**, audit fan-out, OTel runbook |
| **13 — Content Scale** 🔲 | Skala konten & vektor | **R2/S3** body offload, **pgvector** produksi, embedding job hardening |
| **14 — Search & Graph Prod** 🔲 | Index & graph skala | **Meilisearch** + **Neo4j** produksi, backfill terbukti di staging |
| **External** 🔲 | Ekosistem | npm **`@ai-brain/client` SDK** (di luar repo), MCP `submit_signal` (env-gated) |

Detail timeline: [.ai/phases/roadmap/10-POST-ROADMAP.md](.ai/phases/roadmap/10-POST-ROADMAP.md) · status live: [10-PHASE-STATUS.md](.ai/core/architecture/10-PHASE-STATUS.md)

#### Visi platform (desain jangka panjang 🔲)

Arah evolusi AI-Brain menjadi **Collaborative Memory Intelligence Platform** terdokumentasi sebagai desain (belum diimplementasi, menunggu approval owner):

| Desain | Fokus | Referensi |
|--------|-------|-----------|
| **Vision charter** | Identitas platform, prinsip knowledge independence & team ownership | [.ai/core/vision/01-COLLABORATIVE-MEMORY-PLATFORM.md](.ai/core/vision/01-COLLABORATIVE-MEMORY-PLATFORM.md) |
| **Phase 25 — Global AI Intelligence Platform** | AI telemetry, usage analytics, cloud-connected ecosystem, federasi 5-tier (Workspace → Org → Cloud → Edge → Developer) | [.ai/phases/25-global-ai-intelligence/DESIGN.md](.ai/phases/25-global-ai-intelligence/DESIGN.md) · ADR-036/037/038/043 |
| **Indeks fase & drafts** | Seluruh fase reserved + extension design drafts | [.ai/phases/README.md](.ai/phases/README.md) |

Semua desain di atas berstatus **draft** — tanpa perubahan `MemoryService`, semua kapabilitas default OFF.

## Tech Stack

- **Cloudflare D1** — SQLite serverless database (default metadata store)
- **Platform adapters** — Postgres, R2/S3, pgvector, Redis, Meilisearch, Neo4j (opt-in, Phase 10)
- **MCP Server** — Model Context Protocol untuk integrasi AI
- **Zod** — validasi input
- **Pino** — structured logging
- **Swagger/OpenAPI** — dokumentasi API
- **Vitest** — testing
- **Vercel** — serverless deployment

## Arsitektur

**Dokumentasi manusia:** **[docs/README.md](docs/README.md)** · **[docs/PANDUAN.md](docs/PANDUAN.md)**  
**AI Operating System (wajib untuk assistant):** **[.ai/START-HERE.md](.ai/START-HERE.md)**

**Konstitusi:** **[.ai/core/constitution/00-CONSTITUTION.md](.ai/core/constitution/00-CONSTITUTION.md)** · **Registry modul:** **[.ai/core/ai-rules/11-AI-RULES.md](.ai/core/ai-rules/11-AI-RULES.md)**

**Arsitektur:** **[.ai/core/architecture/04-ARCHITECTURE.md](.ai/core/architecture/04-ARCHITECTURE.md)** · **Status fase:** **[.ai/core/architecture/10-PHASE-STATUS.md](.ai/core/architecture/10-PHASE-STATUS.md)** · **Workflow:** **[.ai/workflow/05-WORKFLOW.md](.ai/workflow/05-WORKFLOW.md)** · **Pekerjaan aktif:** **[.ai/TASK_PROMPT.md](.ai/TASK_PROMPT.md)**

```
src/
  routes/         → HTTP routing (no business logic)
  controllers/    → Request/response handling
  services/       → Business logic (MemoryService)
  repositories/   → Scoped data access (via ISqlDatabase)
  infrastructure/ → Vendor adapters (Phase 10)
  ports/          → Vendor-neutral contracts
  db/             → D1 client
  mcp/            → MCP server tools
  plugins/        → Fastify plugins
  types/          → Types & Zod schemas
  config/         → Environment config
```

REST API dan MCP **berbagi logic yang sama** melalui `MemoryService`.

## Roadmap

| Referensi | Tautan |
|-----------|--------|
| Timeline & milestones | [.ai/phases/roadmap/09-ROADMAP.md](.ai/phases/roadmap/09-ROADMAP.md) |
| Metrik, debt, perintah ops | [.ai/core/architecture/10-PHASE-STATUS.md](.ai/core/architecture/10-PHASE-STATUS.md) |
| Panduan setup & MCP | [docs/PANDUAN.md](docs/PANDUAN.md) |

| Fase | Status | Evidence |
|------|--------|----------|
| 1 — Foundation | ✅ | [.ai/phases/01-foundation/](.ai/phases/01-foundation/) |
| 2.5 — Stabilization | ✅ | [.ai/phases/02.5-stabilization/](.ai/phases/02.5-stabilization/) |
| 2.6 — Knowledge Foundation | ✅ | [.ai/phases/02.6-knowledge/](.ai/phases/02.6-knowledge/) |
| 3 — Authorization | ✅ | [.ai/phases/03-authorization/](.ai/phases/03-authorization/) |
| 4 — Memory Intelligence | ✅ | [.ai/phases/04-memory-intelligence/](.ai/phases/04-memory-intelligence/) |
| 5 — Embedding | ✅ | [.ai/phases/05-embedding/](.ai/phases/05-embedding/) · [ADR-003](docs/adr/003-embedding-storage-mvp.md) |
| 6 — Hybrid Retrieval | ✅ | [.ai/phases/06-hybrid-retrieval/](.ai/phases/06-hybrid-retrieval/) · [ADR-001](docs/adr/001-multi-source-retrieval.md) |
| 7 — Agent Runtime | ✅ | [.ai/phases/07-agent-runtime/](.ai/phases/07-agent-runtime/) |
| 8 — Knowledge Graph | ✅ | [.ai/phases/08-knowledge-graph/](.ai/phases/08-knowledge-graph/) · [ADR-006](docs/adr/006-igraph-provider.md) |
| 9 — Multi-AI | ✅ | [.ai/phases/09-multi-ai/](.ai/phases/09-multi-ai/) · [ADR-007](docs/adr/007-multi-ai-workspace-scope.md) |
| 9.5 — Platform Architecture | ✅ | [.ai/phases/09.5-platform-architecture/](.ai/phases/09.5-platform-architecture/) · [ADR-008](docs/adr/008-platform-architecture.md) |
| 10 — Enterprise | ✅ | [.ai/phases/10-enterprise/](.ai/phases/10-enterprise/) · [ADR-008–016](docs/adr/README.md) |
| 11 — Production Ops | 🔲 In Progress | [.ai/phases/11-production-ops/](.ai/phases/11-production-ops/) · [ADR-018](docs/adr/018-production-postgres-cutover.md) |
| 5.5–8.5 — Extension tracks | ✅ | Compression · Progressive retrieval · Capability API · Quality signals · [ADR-023–026](docs/adr/README.md) |

*Desain historis (read-only): [docs/archive/](docs/archive/). Perintah backfill/migrate: lihat [10-PHASE-STATUS.md](.ai/core/architecture/10-PHASE-STATUS.md).*

## Quick Start

> **Mulai di sini:** [docs/PANDUAN.md](docs/PANDUAN.md) — setup 3 langkah, cara pakai, MCP.

> **Migrasi lingkungan pengembangan?** Panduan lengkap: [Instalasi pada Lingkungan Pengembangan Baru](#instalasi-pada-lingkungan-pengembangan-baru).

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

**ChatGPT:** MCP stdio tidak didukung. Tiga jalur: **Custom GPT Actions** (REST + `aic_...`), **Remote MCP** (`https://host/mcp` + API key, `REMOTE_MCP_ENABLED=true`), atau **OAuth** (`REMOTE_MCP_OAUTH_ENABLED=true` + Phase 17 OIDC). Host long-running (Railway/VPS) — bukan Vercel serverless untuk SSE MCP. Detail: [PANDUAN.md](docs/PANDUAN.md) §6.1.

Setelah simpan config:
1. Reload / restart client AI
2. Pastikan server `ai-memory-cloud` connected (hijau / tools ter-list)
3. Uji: `search_memory` dengan query apa saja

Atau jalankan MCP standalone:

```bash
npm run mcp
```

---

## Instalasi pada Lingkungan Pengembangan Baru

Panduan formal untuk memindahkan instalasi **AI Memory Cloud** ke perangkat atau lingkungan pengembangan baru.  
Dokumen ini relevan apabila Anda berganti workstation, memulihkan environment setelah reinstall, atau menstandarkan setup tim.

### Apa yang perlu disalin vs tetap di cloud

| Disalin secara manual (lokal) | Tetap di cloud (tidak hilang) |
|-------------------------------|-------------------------------|
| File `.env` (kredensial) | Seluruh **memory** di D1 |
| `AUTH_SECRET` (wajib identik) | Tabel `identities`, `audit_logs` |
| API key `aic_...` (password manager) | Deploy Vercel |
| `.cursor/mcp.json` (path + env) | Repositori GitHub |
| Folder `D:\Apps\_backups` (opsional) | |

> **Penting:** Nilai `AUTH_SECRET` harus **identik** dengan lingkungan sumber. Perubahan nilai ini membuat API key yang sudah diterbitkan tidak dapat diverifikasi.

---

### Persiapan sebelum meninggalkan lingkungan sumber

Arsipkan ke password manager atau media terenkripsi:

```
□ Isi file .env lengkap (atau minimal empat variabel di bawah)
□ API key aic_... (diterbitkan saat bootstrap — tidak dapat dibaca ulang dari DB)
□ .cursor/mcp.json (jika sudah dikonfigurasi)
□ Folder _backups (opsional, salinan offline riwayat chat)
```

**Variabel wajib di `.env`:**

```env
CLOUDFLARE_ACCOUNT_ID=...
D1_DATABASE_ID=...
D1_API_TOKEN=...
AUTH_SECRET=...          # min 32 karakter — HARUS sama dengan lingkungan sumber
PORT=3001
BACKUP_ROOT=D:/Apps/_backups
```

Generate `AUTH_SECRET` baru **hanya** jika database masih kosong dan bootstrap belum pernah dijalankan.

---

### Prasyarat perangkat lunak

| Perangkat lunak | Versi | Verifikasi |
|-----------------|-------|------------|
| Node.js | **24.x** | `node -v` |
| npm | 10+ | `npm -v` |
| Git | stabil terbaru | `git --version` |
| Cursor | stabil terbaru | — |

Akun yang diperlukan:
- [GitHub](https://github.com/lutfi04/ai-brain) — clone repositori
- [Cloudflare](https://dash.cloudflare.com) — database D1
- [Vercel](https://vercel.com) (opsional) — API produksi

---

### Langkah 1 — Clone repositori dan instalasi dependensi

```bash
git clone https://github.com/lutfi04/ai-brain.git
cd ai-brain
npm install
```

---

### Langkah 2 — Konfigurasi `.env`

```bash
cp .env.example .env
```

Isi dengan kredensial dari lingkungan sumber:

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

**Mendapatkan kredensial D1** (jika belum tersedia salinan):

1. Cloudflare Dashboard → **Workers & Pages** → **D1**
2. Pilih database → salin **Database ID**
3. Sidebar kanan → salin **Account ID** (hex 32 karakter, bukan alamat email)
4. **My Profile → API Tokens** → buat token dengan izin **D1 Edit**

**`AUTH_SECRET`:** salin dari lingkungan sumber. Jika hilang dan identities sudah ada di DB, diperlukan reset database atau pembuatan database baru.

---

### Langkah 3 — Migrasi skema dan verifikasi D1

```bash
npm run db:migrate
npm run test:integration
```

Output yang diharapkan: `All integration tests PASSED against Cloudflare D1`

---

### Langkah 4 — Menjalankan server pengembangan

```bash
npm run dev
```

Verifikasi:

```bash
curl http://localhost:3001/health
# {"status":"ok",...}

curl http://localhost:3001/api/v1/memory?limit=3 \
  -H "Authorization: Bearer aic_YOUR_KEY"
```

> Tanpa API key, endpoint memory mengembalikan **401**.

Swagger: `http://localhost:3001/docs`

---

### Langkah 5 — Autentikasi (API key)

#### Skenario A — Bootstrap sudah dilakukan di lingkungan sumber (umum)

1. Gunakan API key `aic_...` yang sudah diarsipkan
2. Verifikasi:

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify \
  -H "Authorization: Bearer aic_YOUR_KEY"
```

Response: `{ "success": true, "data": { "authenticated": true, ... } }`

3. **Jangan** menjalankan `/auth/bootstrap` kembali (akan ditolak dengan 403)

#### Skenario B — Database baru / bootstrap belum pernah dilakukan

```bash
curl -X POST http://localhost:3001/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"cursor\",\"client\":{\"name\":\"cursor\",\"type\":\"mcp\"}}"
```

Simpan `data.apiKey` — **hanya ditampilkan sekali**.

#### Menerbitkan API key tambahan (setelah memiliki key aktif)

```bash
curl -X POST http://localhost:3001/api/v1/auth/identities \
  -H "Authorization: Bearer aic_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"dev-workstation\",\"type\":\"api_key\"}"
```

---

### Langkah 6 — Konfigurasi MCP

Ikuti **[docs/PANDUAN.md](docs/PANDUAN.md)** untuk klien yang digunakan (Cursor, Claude Code, Roo, Cline, Gemini CLI, dan lainnya).

Ringkasan Cursor:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Sesuaikan path absolut dan kredensial D1 → **Settings → MCP** → status `ai-memory-cloud` aktif → uji `search_memory`.

---

### Langkah 7 — Folder cadangan chat (opsional)

Salin dari lingkungan sumber:

```
D:\Apps\_backups\
```

Perbarui `BACKUP_ROOT` di `.env`.

```bash
# Import sekali
npm run import:backups

# Sinkronisasi otomatis (terminal terpisah)
npm run sync:backups:watch
```

---

### Langkah 8 — Produksi (Vercel)

URL: `https://ai-brain-beryl.vercel.app`

**Variabel lingkungan di Vercel Dashboard** (harus konsisten dengan lokal):

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

### Checklist migrasi lingkungan

```
□ Clone repositori + npm install
□ Salin .env (D1 + AUTH_SECRET)
□ npm run db:migrate
□ npm run test:integration → lulus
□ npm run dev → /health OK
□ API key aic_... tersimpan & /auth/verify OK
□ .cursor/mcp.json + MCP aktif di Cursor
□ (Opsional) Salin _backups + sync:backups:watch
□ (Opsional) Variabel Vercel lengkap
```

---

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Environment validation failed` | Lengkapi `CLOUDFLARE_*`, `D1_*`, `AUTH_SECRET` |
| `AUTH_SECRET is required` | Tambahkan ke `.env` (min 32 karakter) |
| API key selalu 401 | `AUTH_SECRET` tidak cocok dengan saat key diterbitkan |
| `D1 API error (401)` | Token Cloudflare kedaluwarsa — buat token baru |
| `CLOUDFLARE_ACCOUNT_ID` salah | Harus ID hex, bukan email |
| Port bentrok | Set `PORT=3001` di `.env` |
| Memory `total: 0` | `D1_DATABASE_ID` menunjuk ke database yang salah |
| Bootstrap 403 | Normal — bootstrap sudah pernah dijalankan |
| MCP tidak aktif | Periksa path absolut `tsx` di mcp.json |
| `npm start` gagal | Jalankan `npm run build:local` terlebih dahulu, atau gunakan `npm run dev` |

---

### Perintah operasional

```bash
npm run dev                    # Server lokal
npm run test                   # Unit + E2E (457 tests)
npm run benchmark:context-tokens  # Token savings benchmark
npm run test:integration       # Verifikasi D1 live
npm run mcp                    # MCP standalone
npm run import:backups         # Import backup markdown
npm run sync:backups:watch     # Sinkronisasi _backups → D1
```

### Diagram alur migrasi

```
Lingkungan Pengembangan Baru
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
| `get_graph_capabilities` | Graph traversal capabilities (Phase 8) |
| `traverse_relations` | BFS traversal from seed memory (Phase 8) |
| `list_workspaces` | List workspaces for MCP owner (Phase 9) |
| `list_agents` | List agents in MCP workspace (Phase 9) |
| `register_agent` | Register agent in MCP workspace (Phase 9) |
| `get_capabilities` | Deployment capability manifest (Phase 7.5) |

See also: `get_memory_by_codename`, `get_context`, `build_prompt`, `link_memories`, `list_relations` — **20 tools** total in MCP server.

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

**Header scope (Phase 9, optional):** `X-Workspace-Id`, `X-Agent-Id`

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
| GET | `/api/v1/capabilities` | Capability manifest (public, Phase 7.5) |
| POST | `/api/v1/signals` | Quality signal ingest (env-gated, Phase 8.5) |
| GET | `/api/v1/graph/capabilities` | Graph traversal capabilities (Phase 8) |
| POST | `/api/v1/graph/traverse` | BFS traverse from seed memory (Phase 8) |
| GET | `/api/v1/workspaces` | List workspaces (Phase 9) |
| POST | `/api/v1/workspaces` | Create workspace (Phase 9) |
| GET | `/api/v1/workspaces/:id/agents` | List agents in workspace (Phase 9) |
| POST | `/api/v1/workspaces/:id/agents` | Register agent (Phase 9) |

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

Lihat [Langkah 7 — Folder cadangan chat](#langkah-7--folder-cadangan-chat-opsional) di panduan instalasi lingkungan pengembangan.

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
npm run test         # Run tests (457 unit + E2E)
npm run benchmark:context-tokens  # Context token benchmark
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
| `MCP_OWNER_ID` | No | Scope memory MCP (required in production) |
| `MCP_WORKSPACE_ID` | No | MCP workspace (default workspace if unset) |
| `MCP_AGENT_ID` | No | MCP agent attribution hint |
| `PORT` | No | Server port (default: 3000) |
| `LOG_LEVEL` | No | Pino log level (default: info) |
| `BACKUP_ROOT` | No | Path folder backup chat (default: `D:/Apps/_backups`) |
| `BACKUP_SYNC_DEBOUNCE_MS` | No | Delay sebelum sync file (default: 3000) |
| `BACKUP_SYNC_POLL_MS` | No | Interval polling sync (default: 30000) |

### Infrastruktur platform (Fase 10 — opt-in)

Default: D1 metadata, inline storage, noop cache/events/analytics. Provider eksternal diaktifkan per variabel lingkungan. Rincian: [docs/PANDUAN.md](docs/PANDUAN.md) §8, [docs/adr/README.md](docs/adr/README.md).

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `SQL_PROVIDER` | `d1` | `d1` \| `postgres` |
| `DATABASE_URL` | — | PostgreSQL (wajib jika `SQL_PROVIDER=postgres`) |
| `VECTOR_PROVIDER` | `d1` | `d1` \| `pgvector` |
| `PGVECTOR_DATABASE_URL` | — | Postgres khusus vektor (opsional) |
| `OBJECT_STORAGE_PROVIDER` | `inline` | `inline` \| `r2` \| `s3` |
| `SEARCH_PROVIDER` | `sql` | `sql` \| `meilisearch` |
| `GRAPH_PROVIDER` | `d1` | `d1` \| `neo4j` |
| `CACHE_PROVIDER` | `none` | `none` \| `memory` \| `redis` |
| `EVENT_BUS_PROVIDER` | `none` | `none` \| `noop` \| `redis` |
| `ANALYTICS_PROVIDER` | `none` | `none` \| `duckdb` |
| `ENTERPRISE_RBAC` | `false` | RBAC workspace (Fase 10) |
| `MEMORY_ACCESS_AUDIT` | `false` | Audit `memory.accessed` on context build (ADR-017) |
| `OTEL_ENABLED` | `false` | OpenTelemetry HTTP tracing |

Backfill provider eksternal (dry-run default): `db:backfill-pgvector`, `db:backfill-meilisearch`, `db:backfill-neo4j` — lihat [PANDUAN.md](docs/PANDUAN.md). Postgres metadata cutover: [.ai/phases/11-production-ops/MIGRATION.md](.ai/phases/11-production-ops/MIGRATION.md).

## License

MIT
