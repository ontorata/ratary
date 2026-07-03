# Panduan — AI Memory Cloud

Satu panduan untuk **setup, pemakaian sehari-hari, dan MCP** (Cursor, Claude Code, Roo, Cline, Gemini CLI, dll.).

---

## 1. Setup (3 langkah)

```bash
git clone https://github.com/lutfi04/ai-brain.git
cd ai-brain
npm install
cp .env.example .env
```

Isi `.env` dari [Cloudflare Dashboard](https://dash.cloudflare.com):

- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `D1_API_TOKEN`

```bash
npm run db:migrate
npm run setup
```

**Cursor:** Settings → MCP → `ai-memory-cloud` hijau → Reload Window  
**Claude Code:** `claude` di folder repo → approve `ai-memory-cloud`

Uji: *"cari memory tentang ai-brain"*

---

## 2. Cara pakai (cukup chat)

Tidak perlu mengetik nama tool. Bilang natural:

| Anda ingin… | Contoh |
|-------------|--------|
| Lanjut kerja | `Lanjut kerja ai-brain — fokus dokumentasi` |
| Baca konteks dulu | `Baca memory tentang auth sebelum coding` |
| Simpan handoff | `Simpan handoff: selesai fix MCP, besok lanjut test` |
| Cari topik | `Cari memory tentang deployment Vercel` |
| Ringkas keputusan | `Ringkas apa yang sudah kita putuskan untuk mangroveapps` |

**Tips:** sebut **nama proyek** (`ai-brain`, `mangroveapps`) dan **topik** (`auth`, `hydration`). Akhiri sesi dengan handoff.

### Memory pintar (Fase 4)

AI otomatis memilih cuplikan memory yang paling relevan — bukan dump semua catatan. Jika MCP sudah hijau, **tidak ada setup tambahan**. Cukup bilang *"lanjut kerja …"*.

---

## 3. Keamanan

| Situasi | `MCP_OWNER_ID` di `.env` |
|---------|--------------------------|
| Dev lokal, solo | Opsional |
| Production / tim | **Wajib** (UUID owner dari bootstrap REST) |

Tanpa `MCP_OWNER_ID` di production, MCP **tidak akan start** — mencegah memory tercampur antar user.

Jangan commit atau share file `.env`.

---

## 4. Setelah `git pull`

1. `npm install`
2. `npm run setup`
3. Reload Cursor
4. Opsional: `npm run db:migrate`

---

## 5. Troubleshooting

| Gejala | Solusi |
|--------|--------|
| MCP merah | `npm run setup` → reload |
| Connection closed (Windows) | Pakai `command: "cmd"` — lihat §6 |
| AI tidak pakai memory | Sebut proyek + topik |
| Memory kosong | Normal di DB baru — simpan dulu |
| MCP error production | Set `MCP_OWNER_ID` |
| Claude pending approval | `claude` di folder repo → approve |
| ChatGPT | MCP stdio tidak didukung — pakai REST API + `aic_...` key |

---

## 6. MCP — client lain

**Disarankan:** `npm run setup` (Cursor + Claude Code) — credential dari `.env`, jangan duplikasi di `mcp.json`.

### Konfigurasi dasar

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "npx",
      "args": ["-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "...",
        "D1_DATABASE_ID": "...",
        "D1_API_TOKEN": "...",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Ganti path repo. Windows: gunakan slash `/`.

### Windows — jika `npx` gagal

```json
"command": "cmd",
"args": ["/c", "npx", "-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"]
```

### Lokasi config per client

| Client | File |
|--------|------|
| Cursor (project) | `.cursor/mcp.json` |
| Claude Code | `.mcp.json` |
| Roo Code | `.roo/mcp.json` |
| Gemini CLI | `.gemini/settings.json` — template: `docs/examples/gemini-settings.json.example` |
| VS Code Copilot | `.vscode/mcp.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |

### Verifikasi

```bash
npm run mcp          # tidak crash = D1 OK
npm run test:integration
```

Tools MCP: `save_memory`, `search_memory`, `get_context`, `build_prompt`, `get_graph_capabilities`, `traverse_relations`, dan 10 lainnya (**16 total**).

### MCP vs REST

| | MCP | REST API |
|---|-----|----------|
| Auth | D1 di env | `Bearer aic_...` |
| Client | Cursor, Claude, Cline, … | curl, ChatGPT Actions |
| Deploy | Tidak perlu server | Vercel / `npm run dev` |

Keduanya menulis ke **D1 yang sama**.

---

## 7. Opsional

| Perintah | Untuk apa |
|----------|-----------|
| `npm run dev` | REST API / Swagger |
| `npm run sync:backups:watch` | Sync folder chat ke D1 |
| `npm run db:backfill-embeddings` | Generate embedding untuk memory tanpa `embedding_id` (dry-run default) |
| `npm run db:backfill-embeddings:execute` | Jalankan backfill embedding (butuh provider) |

### Embedding (Fase 5)

Backfill **async** — CRUD tidak memanggil model embedding.

1. Default: `EMBEDDING_PROVIDER=noop` (tes lokal, vektor nol).
2. Produksi OpenAI: set di `.env`:
   - `EMBEDDING_PROVIDER=openai`
   - `EMBEDDING_API_KEY=sk-...`
   - `EMBEDDING_MODEL=text-embedding-3-small` (opsional)
3. Cek dulu: `npm run db:backfill-embeddings`
4. Jalankan: `npm run db:backfill-embeddings:execute`

Hapus memory lewat REST/MCP otomatis membersihkan vektor terkait.

### Hybrid & graph retrieval (Fase 6 + 8)

Retrieval multi-sumber diaktifkan lewat env (default: SQL-only).

| Variable | Default | Efek |
|----------|---------|------|
| `HYBRID_RETRIEVAL` | `false` | Gabung SQL + vector (RRF) — butuh embedding provider |
| `GRAPH_RETRIEVAL` | `false` | Tambah leg graph di composite retrieval |
| `GRAPH_MAX_DEPTH` | `2` | Kedalaman BFS (max 3) |
| `GRAPH_SEED_CAP` | `5` | Seed lexical per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Budget neighbor total |

Contoh graph-only recall:

```env
GRAPH_RETRIEVAL=true
```

Contoh full hybrid + graph:

```env
HYBRID_RETRIEVAL=true
GRAPH_RETRIEVAL=true
EMBEDDING_PROVIDER=openai
EMBEDDING_API_KEY=sk-...
```

API eksplorasi graph (tanpa flag di atas): MCP `get_graph_capabilities`, `traverse_relations`; REST `GET /api/v1/graph/capabilities`, `POST /api/v1/graph/traverse`.

---

## Developer?

| Dokumen | Isi |
|---------|-----|
| [.ai/core/ai-rules/11-AI-RULES.md](.ai/core/ai-rules/11-AI-RULES.md) | Aturan agent + registry modul |
| [.ai/core/architecture/04-ARCHITECTURE.md](.ai/core/architecture/04-ARCHITECTURE.md) | Struktur, layer, extension points |
| [.ai/workflow/05-WORKFLOW.md](.ai/workflow/05-WORKFLOW.md) | Proses Principal Engineer & format analisis |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Laporan selesai Phase 5 Embedding |
| [.ai/workflow/12-TASK-TEMPLATE.md](.ai/workflow/12-TASK-TEMPLATE.md) | Template task untuk fase berikutnya |
| [adr/POLICY.md](adr/POLICY.md) | Kebijakan ADR — wajib untuk perubahan struktural |
| [archive/](archive/) | Desain historis per fase |
