# Panduan Setup MCP — AI Memory Cloud

Server MCP **ai-memory-cloud** memakai transport **stdio** (proses lokal) dan terhubung langsung ke **Cloudflare D1**. Tidak membutuhkan API key `aic_...` — cukup credential D1 di environment.

Tools yang tersedia: `save_memory`, `update_memory`, `delete_memory`, `get_memory`, `search_memory`, `list_projects`, `list_tags`, `toggle_favorite`, `archive_memory`.

---

## Prasyarat (semua klien)

1. **Clone & install** repo `ai-brain`
2. **Node.js 24.x** — cek: `node -v`
3. Credential D1 (sama dengan `.env`):

| Variabel | Sumber |
|----------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Account ID (hex 32 char) |
| `D1_DATABASE_ID` | D1 → database Anda |
| `D1_API_TOKEN` | API Token dengan permission **D1 Edit** |

4. Ganti path repo di contoh di bawah. Di Windows gunakan **slash** `/` atau escape backslash:

```
D:/Apps/ai-brain/src/mcp/stdio.ts
```

5. Uji standalone (opsional):

```bash
cd D:/Apps/ai-brain
npm run mcp
# Ctrl+C untuk stop — jika tidak error, D1 credential OK
```

---

## Konfigurasi dasar (semua klien stdio)

Blok ini sama di hampir semua client MCP. Salin dan sesuaikan path + env:

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

### Windows — jika `npx` gagal / Connection closed

Beberapa client (Cline, Roo Code) tidak mewarisi PATH shell. Pakai wrapper `cmd`:

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "tsx",
        "D:/Apps/ai-brain/src/mcp/stdio.ts"
      ],
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

Atau gunakan path absolut ke `node.exe` (cari dengan `where node`):

```json
"command": "C:/Program Files/nodejs/node.exe",
"args": ["D:/Apps/ai-brain/node_modules/tsx/dist/cli.mjs", "D:/Apps/ai-brain/src/mcp/stdio.ts"]
```

---

## Cursor

| | |
|---|---|
| **Project** | `.cursor/mcp.json` |
| **Global** | `%USERPROFILE%\.cursor\mcp.json` (Windows) |
| **Template** | `.cursor/mcp.json.example` |

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
# Edit path + credential D1
```

**Langkah:**
1. Simpan file → **Cursor → Settings → MCP**
2. Pastikan `ai-memory-cloud` **hijau/Connected**
3. **Reload Window** jika perlu
4. Uji di chat: `search_memory` dengan query apa saja

---

## Claude Code

| Scope | File |
|-------|------|
| Project (disarankan, bisa di-commit) | `.mcp.json` di root repo |
| Local (hanya Anda, project ini) | `~/.claude.json` |
| User (semua project) | `~/.claude.json` → key `mcpServers` |

```bash
cp mcp.json.example .mcp.json
# Edit path + credential D1
```

**Via CLI** (alternatif):

```bash
claude mcp add-json ai-memory-cloud --scope project '{
  "command": "npx",
  "args": ["-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"],
  "env": {
    "CLOUDFLARE_ACCOUNT_ID": "xxx",
    "D1_DATABASE_ID": "xxx",
    "D1_API_TOKEN": "xxx",
    "NODE_ENV": "production",
    "LOG_LEVEL": "info"
  }
}'
```

**Langkah:**
1. Buka Claude Code di folder `ai-brain`
2. **Restart session** setelah edit config (dibaca saat startup)
3. Approve server jika diminta (project `.mcp.json`)
4. Uji: minta Claude cari memory — `search_memory`

> Jangan taruh `mcpServers` di `.claude/settings.json` — itu file settings, bukan MCP.

---

## Roo Code (VS Code extension)

| Scope | File |
|-------|------|
| Project | `.roo/mcp.json` |
| Global | `mcp_settings.json` (buka via UI) |
| **Template** | `.roo/mcp.json.example` |

```bash
mkdir -p .roo
cp .roo/mcp.json.example .roo/mcp.json
```

**Langkah:**
1. Buka panel **Roo Code** → ikon ⚙️ → **MCP Servers**
2. Klik **Edit Project MCP** (atau Edit Global MCP)
3. Paste konfigurasi → simpan
4. Cek daftar server — tools `save_memory`, `search_memory`, dll. harus muncul
5. Di Windows, jika error -32000, pakai varian `cmd /c npx` di atas

**Opsional** — auto-approve tools:

```json
"alwaysAllow": ["search_memory", "get_memory", "list_projects", "list_tags"]
```

---

## Cline (VS Code extension)

| | |
|---|---|
| **Config** | Buka via UI → **MCP Servers** → **Configure MCP Servers** |
| **File** | `cline_mcp_settings.json` (VS Code globalStorage) |
| **CLI** | `~/.cline/mcp.json` (jika pakai Cline CLI) |

Path file Windows (referensi):

```
%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Langkah:**
1. Panel Cline → ikon **MCP Servers** (stacked servers) → tab **Configure**
2. Klik **Configure MCP Servers** → JSON terbuka
3. Tambahkan entry `ai-memory-cloud` di bawah `mcpServers`
4. Simpan — cek panel MCP, tools harus ter-list
5. Windows: gunakan `cmd /c npx` jika connection closed

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"],
      "env": { "...": "..." },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Debug:** `Ctrl+Shift+P` → **Developer: Toggle Developer Tools** → lihat Console saat MCP gagal connect.

---

## Gemini CLI

| Scope | File |
|-------|------|
| Project | `.gemini/settings.json` |
| User | `~/.gemini/settings.json` |
| **Template** | `docs/examples/gemini-settings.json.example` |

```bash
mkdir -p .gemini
cp docs/examples/gemini-settings.json.example .gemini/settings.json
# Edit credential D1
```

**Via CLI:**

```bash
cd D:/Apps/ai-brain
gemini mcp add ai-memory-cloud npx -y tsx D:/Apps/ai-brain/src/mcp/stdio.ts
# Lalu tambahkan env vars manual di settings.json
```

**Langkah:**
1. Pastikan folder project di-mark **Trusted** (Gemini CLI kadang mengabaikan config di folder untrusted)
2. Jalankan `gemini mcp list` — `ai-memory-cloud` harus muncul
3. Di session: `/mcp` untuk lihat server aktif
4. Uji: minta Gemini simpan atau cari memory

> Nama server: gunakan **hyphen** (`ai-memory-cloud`), hindari underscore.

---

## ChatGPT (Developer Mode)

**Penting:** ChatGPT hanya mendukung MCP **remote** (HTTPS — SSE atau streaming HTTP). Server ai-memory-cloud saat ini adalah **stdio lokal**, jadi **tidak bisa** langsung di-plug sebagai connector ChatGPT tanpa bridge HTTP.

### Opsi A — REST API (disarankan)

Pakai deploy Vercel atau server lokal + API key `aic_...`:

```bash
# Cari memory
curl "https://ai-brain-beryl.vercel.app/api/v1/search?q=mangrove" \
  -H "Authorization: Bearer aic_YOUR_KEY"

# Simpan memory
curl -X POST "https://ai-brain-beryl.vercel.app/api/v1/memory" \
  -H "Authorization: Bearer aic_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"...","content":"...","project":"chatgpt"}'
```

Untuk ChatGPT:
- Buat **Custom GPT** dengan **Actions** (OpenAPI) yang mengarah ke REST API Anda, atau
- Tempel hasil `search` / export manual saat butuh konteks

Swagger spec: `https://ai-brain-beryl.vercel.app/docs` (jika di-enable di production)

### Opsi B — MCP HTTP bridge (lanjutan)

Jika Anda punya MCP server HTTP (mis. via `mcp-remote`, tunnel ngrok + gateway):

1. **Settings → Apps & Connectors → Advanced → Developer Mode** ON
2. **Create** connector → URL `https://your-host/mcp`
3. Server harus advertise tools yang sama

Ini memerlukan komponen tambahan di luar repo ini — belum disertakan.

---

## AI lain yang mendukung MCP stdio

| Client | Lokasi config |
|--------|----------------|
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` (Win) |
| **Windsurf** | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |
| **VS Code** (Copilot MCP) | `.vscode/mcp.json` di workspace |
| **Continue** | `~/.continue/config.json` → `experimental.modelContextProtocolServers` |
| **Zed** | Settings → MCP Servers (JSON) |

Format `mcpServers` sama — salin blok konfigurasi dasar di atas.

**Claude Desktop** contoh:

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "npx",
      "args": ["-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "...",
        "D1_DATABASE_ID": "...",
        "D1_API_TOKEN": "..."
      }
    }
  }
}
```

Setelah edit → **restart Claude Desktop**.

---

## Verifikasi koneksi

| Cek | Cara |
|-----|------|
| Credential D1 | `npm run test:integration` |
| MCP process | `npm run mcp` (tidak crash) |
| Tools terdaftar | Lihat panel MCP client — 9 tools |
| Fungsi search | Prompt: *"Pakai search_memory untuk cari 'test'"* |
| Data sama | Memory yang disimpan dari Cursor muncul di Claude Code (DB sama) |

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|--------|-------------------|
| Connection closed (-32000) | PATH tidak ada `npx` → pakai `cmd /c npx` atau path absolut `node.exe` |
| Server tidak muncul | Path `tsx`/`stdio.ts` salah — harus **absolut** |
| Tools kosong | Env D1 kosong/salah — cek `CLOUDFLARE_*`, `D1_*` |
| MCP hijau tapi search gagal | Token D1 expired — buat token baru di Cloudflare |
| Memory kosong | `D1_DATABASE_ID` beda dengan laptop lain |
| ChatGPT tidak bisa connect | Normal untuk stdio — pakai REST API (Opsi A) |
| Gemini: No MCP servers | Folder belum trusted; cek `.gemini/settings.json` syntax |
| Roo/Cline Windows | Gunakan varian `command: "cmd"` |

---

## Ringkasan lokasi file

```
ai-brain/
├── .cursor/mcp.json          ← Cursor (project)
├── .mcp.json                 ← Claude Code (project)
├── .roo/mcp.json             ← Roo Code (project)
├── .gemini/settings.json     ← Gemini CLI (project)
├── .vscode/mcp.json          ← VS Code Copilot MCP
├── mcp.json.example          ← template Claude Code
├── .cursor/mcp.json.example  ← template Cursor
└── .roo/mcp.json.example     ← template Roo Code
```

**Global (semua project):**

| OS | Client | Path |
|----|--------|------|
| Windows | Cursor | `%USERPROFILE%\.cursor\mcp.json` |
| Windows | Claude Code | `%USERPROFILE%\.claude.json` |
| Windows | Gemini CLI | `%USERPROFILE%\.gemini\settings.json` |
| Windows | Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |
| Windows | Windsurf | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |

---

## MCP vs REST API

| | MCP (stdio) | REST API |
|---|-------------|----------|
| Auth | Credential D1 di env | `Authorization: Bearer aic_...` |
| Client | Cursor, Claude Code, Cline, Roo, Gemini CLI, … | curl, ChatGPT Actions, script |
| Deploy | Tidak perlu server jalan | Vercel / `npm run dev` |
| ChatGPT | Butuh bridge HTTP | Langsung pakai |

Keduanya menulis ke **database D1 yang sama** — memory yang disimpan lewat MCP terlihat di REST, dan sebaliknya.
