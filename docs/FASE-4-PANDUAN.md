# Fase 4 — Panduan Pemakaian (Untuk Semua Orang)

**Fase 4** membuat AI **lebih pintar memilih catatan yang relevan** sebelum menjawab.  
Anda **tidak perlu** belajar perintah baru atau mengubah setup jika MCP sudah jalan.

---

## Apa yang berubah?

| Dulu (Fase 1–3) | Sekarang (Fase 4) |
|-----------------|-------------------|
| AI mencari memory seperti pencarian biasa | AI bisa **mengambil cuplikan memory yang paling cocok** untuk tugas Anda |
| Hasil kadang terlalu banyak atau kurang fokus | Hasil **dirangkum** dalam batas ukuran yang aman untuk AI |
| Anda bilang "cari memory" | Anda bisa bilang **"lanjut kerja …"** — AI otomatis baca konteks yang tepat |

**Intinya:** memory Anda tetap di tempat yang sama (Cloudflare D1). Yang baru adalah cara AI **membaca** memory agar lebih tepat sasaran.

---

## Apa yang perlu Anda lakukan?

### Jika MCP sudah hijau di Cursor / Claude Code

**Tidak ada langkah tambahan.** Lanjutkan chat seperti biasa.

Pastikan sekali saja:

1. Repo `ai-brain` sudah di-update (`git pull`)
2. MCP `ai-memory-cloud` masih **hijau** (Settings → MCP)
3. Reload window jika baru update

### Jika belum pernah setup

Ikuti **[MULAI-DISINI.md](MULAI-DISINI.md)** dulu (3 langkah). Fase 4 otomatis ikut.

---

## Cara pakai — cukup bilang di chat

Anda **tidak perlu** mengetik nama tool (`get_context`, `build_prompt`, dll.). Cukup bicara natural:

### Mulai atau lanjut kerja

```
Lanjut kerja MangroveApps — fokus hydration bug
```

```
Baca dulu memory tentang auth-service sebelum kita coding
```

AI akan mengambil memory yang relevan, lalu melanjutkan tugas.

### Simpan untuk nanti (sama seperti sebelumnya)

```
Simpan handoff: branch main, selesai fix login, besok lanjut test E2E
```

```
Catat: keputusan pakai JWT HS256 untuk API internal
```

### Tanya ringkasan dari memory

```
Ringkas apa saja yang sudah kita putuskan untuk proyek ai-brain
```

```
Apa isu terbuka dari memory tentang deployment?
```

---

## Kapan pakai apa? (tanpa istilah teknis)

| Anda ingin… | Bilang di chat… |
|-------------|-----------------|
| AI baca konteks proyek sebelum coding | "Lanjut kerja [nama proyek]" atau "baca memory tentang X" |
| Cari satu catatan spesifik | "Cari memory tentang …" / "Ada catatan soal …?" |
| Simpan ringkasan akhir sesi | "Simpan handoff …" |
| AI pakai codename tertentu | "Buka memory NOTE-0042" (jika Anda tahu codenamenya) |

**Tips:** sebut **nama proyek** dan **topik** — misalnya `mangroveapps`, `hydration`, `auth`. Semakin jelas, semakin tepat memory yang diambil.

---

## Apa yang TIDAK perlu Anda lakukan

- Tidak perlu `npm start` untuk sehari-hari
- Tidak perlu API key di Cursor (MCP langsung ke D1)
- Tidak perlu curl atau Postman
- Tidak perlu menjalankan script `consolidate` atau `backfill` — itu untuk pengelola sistem, bukan pengguna biasa

---

## Contoh percakapan lengkap

**Anda (pagi):**
> Lanjut kerja ai-brain. Kemarin kita bahas Phase 4.

**AI:** Membaca memory terkait ai-brain / Phase 4, lalu melanjutkan dari situ.

---

**Anda (sore):**
> Simpan handoff: commit Phase 4 sudah push, besok review dokumentasi user.

**AI:** Menyimpan ringkasan ke memory dengan tag handoff.

---

**Anda (minggu depan):**
> Lanjut dari handoff terakhir ai-brain

**AI:** Mencari handoff + memory proyek, lalu melanjutkan.

---

## Masalah umum

| Gejala | Coba ini |
|--------|----------|
| AI seolah tidak ingat proyek | Sebut nama proyek jelas; pastikan pernah `save_memory` / handoff |
| Memory kosong | Normal di awal — simpan beberapa catatan dulu |
| MCP merah | `npm run setup` → reload Cursor |
| AI jawaban umum, tidak pakai memory | Tanya: "Cari dulu di memory cloud tentang X" |

---

## Istilah singkat (opsional)

| Istilah | Arti sederhana |
|---------|----------------|
| **Memory** | Catatan yang disimpan (judul, isi, proyek, tag) |
| **Handoff** | Ringkasan akhir sesi agar bisa dilanjut besok |
| **Proyek** | Label grup memory, misalnya `mangroveapps`, `ai-brain` |
| **MCP** | Jembatan antara Cursor/Claude dan database memory Anda |

---

## Dokumen lain

| Dokumen | Untuk siapa |
|---------|-------------|
| [MULAI-DISINI.md](MULAI-DISINI.md) | Setup pertama kali |
| [MCP-SETUP.md](MCP-SETUP.md) | Detail teknis MCP |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Developer |
| [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) | Aturan arsitektur (developer) |

---

**Ringkas:** Fase 4 = AI lebih pintar memilih memory yang relevan. Setup sama, cara pakai sama — cukup chat natural dengan menyebut proyek dan topik.
