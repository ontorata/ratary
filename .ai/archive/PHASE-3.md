# Phase 3 — Authorization (JWT / OAuth / Permissions)

**Status:** ✅ Implemented  
**Prasyarat:** Phase 2.6 complete  
**Tests:** `tests/auth/phase3.test.ts`, `tests/auth/jwt.service.test.ts`

---

## Tujuan

1. **JWT** — short-lived access tokens (HS256, `AUTH_SECRET`)
2. **OAuth tokens** — long-lived `oac_*` bearer tokens (stored hashed seperti API key)
3. **Permission enforcement** — `memory.read` / `memory.write` di REST API
4. **Legacy routes dihapus** — `/memory`, `/search`, dll. (gunakan `/api/v1/*`)

---

## Auth providers (chain)

```
Request
  → ApiKeyProvider   (aic_*)
  → OAuthProvider    (oac_*)
  → JwtProvider      (JWT 3-part)
```

## Endpoints baru

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/v1/auth/token` | API key / OAuth / JWT | Issue JWT untuk identity saat ini |
| POST | `/api/v1/auth/identities` | + type `oauth`, `jwt` | OAuth → `oac_*`; JWT → tanpa secret |

## Permissions

| Permission | Routes |
|------------|--------|
| `memory.read` | GET (memory, search, projects, tags, knowledge, backup export) |
| `memory.write` | POST, PUT, PATCH, DELETE |

Auth routes (`/api/v1/auth/*`) tidak memerlukan permission tambahan — cukup terautentikasi.

Default identity metadata: `["memory.read", "memory.write"]`.

## JWT claims

```json
{
  "sub": "<identity-id>",
  "owner_id": "<owner-uuid>",
  "client_id": "<client-uuid|null>",
  "permissions": ["memory.read", "memory.write"],
  "type": "jwt",
  "iat": 0,
  "exp": 0
}
```

## Timestamp

- Storage: UTC (`createdAt`, `updatedAt`)
- REST display: `createdAtWib`, `updatedAtWib` (Phase 2.6 optional, sudah ada)

## Breaking changes

| Aspek | Perubahan |
|-------|-----------|
| `/memory`, `/search`, `/backup/*` | **Dihapus** — gunakan `/api/v1/*` |
| `/health`, `/` | Tetap di root (monitoring) |

## Verifikasi

```bash
npm run test
npm run typecheck
```

## Langkah berikutnya

- **Phase 4** — Memory Intelligence ([PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md))
