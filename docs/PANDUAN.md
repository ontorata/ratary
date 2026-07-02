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

Tools MCP: `save_memory`, `search_memory`, `get_context`, `build_prompt`, dan 10 lainnya (14 total).

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

---

## Developer?

| Dokumen | Isi |
|---------|-----|
| [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) | Aturan immutable (agent) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Struktur, layer, extension points |
| [ENGINEERING.md](ENGINEERING.md) | Proses Principal Engineer & format analisis |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Pekerjaan aktif (Phase 5 Embedding) |
| [TASK_PROMPT.template.md](TASK_PROMPT.template.md) | Template task untuk fase berikutnya |
| [ADR-POLICY.md](ADR-POLICY.md) | Kebijakan ADR — wajib untuk perubahan struktural |
| [archive/](archive/) | Desain historis per fase |
