# Zippi Platform — Setup Guide (v2 rebuild)

Four projects in this folder:

| Project | What it is | Dev port |
|---|---|---|
| `zippi-web` | Customer web app (untouched, finalized) | 3000 |
| `zippi-backend` | REST API — powers web, admin, rider & future mobile apps | 3001 |
| `zippi-admin` | Admin Panel (dashboard, catalog, orders, users, riders, settings) | 3002 |
| `zippi-rider` | Rider App (mobile-first PWA) | 3003 |

## First-time setup (one time)

1. **Database** — open the Supabase SQL Editor and run `zippi-backend/migration.sql`. It is idempotent and preserves all existing data.
2. **Backend**
   ```bash
   cd zippi-backend
   npm install
   npm run setup:storage   # creates the public image bucket
   npm run seed            # admin 0500000001/admin123 · rider 0500000002/rider123
   npm run dev
   ```
3. **Admin Panel**
   ```bash
   cd zippi-admin && npm install && npm run dev   # http://localhost:3002
   ```
4. **Rider App**
   ```bash
   cd zippi-rider && npm install && npm run dev   # http://localhost:3003
   ```

The web app keeps working unchanged — the API contract for `/api/products`, `/api/categories` and `/api/banners` is preserved.

> ⚠️ Change the seeded admin/rider passwords before going live.

## Tests

`cd zippi-backend && npm test` — runs a 34-check smoke suite against an in-memory database stub (no Supabase needed): auth, role guards, catalog contract, admin CRUD, full order lifecycle, rider transitions.

## Mobile (Android/iOS) readiness

The API is stateless (JWT Bearer), returns camelCase JSON with a uniform `{success, data}` envelope, computes prices/fees server-side, and enforces role-based access — a future React Native/Flutter app can use the exact same endpoints as the web app and rider PWA. The rider PWA is installable from the browser today.

## Production notes

- Set `CORS_ORIGINS`, a strong `JWT_SECRET`, and `NODE_ENV=production` on the backend host.
- Frontends are static builds (`npm run build` → `dist/`); set `VITE_API_BASE_URL` to your production API URL.
- Uploaded images are served from Supabase Storage's public CDN.
