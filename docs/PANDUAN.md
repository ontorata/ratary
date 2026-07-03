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

**Phase 9 — workspace (opsional):**

| Variable | Fungsi |
|----------|--------|
| `MCP_WORKSPACE_ID` | Scope memory ke workspace tertentu (default: workspace `default` owner) |
| `MCP_AGENT_ID` | Hint attribution agent (registry via `register_agent`) |

REST: header `X-Workspace-Id` / `X-Agent-Id` pada request memory.

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

Tools MCP: `save_memory`, `search_memory`, `get_context`, `build_prompt`, `get_graph_capabilities`, `traverse_relations`, `list_workspaces`, `list_agents`, `register_agent`, dan 10 lainnya (**19 total**).

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

## 8. Infrastruktur platform (Fase 10 + 11)

Adapter eksternal diaktifkan melalui variabel lingkungan di composition root. **Default tidak berubah** (D1, inline storage, tanpa cache/events/analytics eksternal).

| Variable | Default | Provider | Catatan |
|----------|---------|---------|---------|
| `SQL_PROVIDER` | `d1` | D1 · `postgres` | **Phase 11:** Postgres metadata via `DATABASE_URL` |
| `VECTOR_PROVIDER` | `d1` | D1 · `pgvector` | Vektor di tabel `memory_embeddings` |
| `OBJECT_STORAGE_PROVIDER` | `inline` | R2 · S3 | Content offload (Phase 13) |
| `SEARCH_PROVIDER` | `sql` | SQL · Meilisearch | Hybrid search (Phase 14) |
| `GRAPH_PROVIDER` | `d1` | D1 · Neo4j | Knowledge graph (Phase 14) |
| `CACHE_PROVIDER` | `none` | Redis | Opsional (Phase 12) |
| `EVENT_BUS_PROVIDER` | `none` | Redis | Audit fan-out (Phase 12) |
| `ANALYTICS_PROVIDER` | `none` | DuckDB | Dev analytics (Phase 12) |
| `ENTERPRISE_RBAC` | `false` | RBAC | Workspace RBAC (Phase 10) |
| `MEMORY_ACCESS_AUDIT` | `false` | Audit | `memory.accessed` trail (ADR-017) |
| `OTEL_ENABLED` | `false` | OTel | OpenTelemetry HTTP tracing |

Rincian ADR: [docs/adr/README.md](adr/README.md). Contoh variabel: [.env.example](../.env.example).

### Postgres metadata (Phase 11)

**Strategy:** Quiesce + backfill + env flip (ADR-018 Option A). **Runbook:** [.ai/phases/11-production-ops/MIGRATION.md](../.ai/phases/11-production-ops/MIGRATION.md)

| Env | Value | Catatan |
|-----|-------|---------|
| `SQL_PROVIDER` | `postgres` | Flip saat cutover |
| `DATABASE_URL` | `postgresql://...` | Wajib — dari vault, jangan commit |

#### Apply schema Postgres (idempotent)

```bash
# via DATABASE_URL
npm run db:apply-postgres-schema

# via --database-url flag
npx tsx scripts/apply-postgres-schema.ts --database-url=postgresql://user:pass@host:5432/dbname
```

#### Backfill D1 → Postgres

```bash
# dry-run (default) — log saja, tidak tulis
npm run db:backfill-d1-to-postgres

# execute — tulis data
npm run db:backfill-d1-to-postgres -- --execute

# dengan --target-url override
npm run db:backfill-d1-to-postgres -- --target-url=postgresql://user:pass@host:5432/dbname --execute

# scope owner tertentu
npm run db:backfill-d1-to-postgres -- --owner=<uuid> --execute

# batch size kustom (default 100)
npm run db:backfill-d1-to-postgres -- --batch-size=500 --execute
```

#### Verifikasi parity (D1 ↔ Postgres)

```bash
npm run db:verify-postgres-parity

# dengan --target-url override
npm run db:verify-postgres-parity -- --target-url=postgresql://user:pass@host:5432/dbname
```

Exit code `0` = parity OK. `1` = mismatch — block flip sampai diperbaiki.

### Backfill provider eksternal

Semua perintah di bawah **dry-run** secara default; tambahkan `:execute` atau flag `--execute` untuk menulis data.

| Perintah | Prasyarat env |
|----------|---------------|
| `npm run db:backfill-pgvector` | `PGVECTOR_DATABASE_URL` atau `DATABASE_URL` |
| `npm run db:backfill-meilisearch` | `MEILISEARCH_HOST`, `MEILISEARCH_INDEX` |
| `npm run db:backfill-neo4j` | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |
| `npm run db:backfill-organizations` | Enterprise schema (D1) |
| `npm run db:backfill-workspaces` | Phase 9 workspace |

Opsi CLI: `--owner=<uuid>`, `--batch-size=100`, `--execute`.

---

## 9. Migrasi lingkungan pengembangan

Apabila Anda memindahkan instalasi ke perangkat atau workstation baru, ikuti panduan formal:

**[README.md — Instalasi pada Lingkungan Pengembangan Baru](../README.md#instalasi-pada-lingkungan-pengembangan-baru)**

Ringkasan: salin `.env` (terutama `AUTH_SECRET`), jalankan `db:migrate`, verifikasi dengan `test:integration`, konfigurasi ulang MCP.

---

## Developer?

| Dokumen | Isi |
|---------|-----|
| [.ai/core/ai-rules/11-AI-RULES.md](.ai/core/ai-rules/11-AI-RULES.md) | Aturan agent + registry modul |
| [.ai/core/architecture/04-ARCHITECTURE.md](.ai/core/architecture/04-ARCHITECTURE.md) | Struktur, layer, extension points |
| [.ai/workflow/05-WORKFLOW.md](.ai/workflow/05-WORKFLOW.md) | Proses Principal Engineer & format analisis |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Status post–Phase 10 |
| [.ai/workflow/12-TASK-TEMPLATE.md](.ai/workflow/12-TASK-TEMPLATE.md) | Template task untuk fase berikutnya |
| [adr/POLICY.md](adr/POLICY.md) | Kebijakan ADR — wajib untuk perubahan struktural |
| [archive/](archive/) | Desain historis per fase |
