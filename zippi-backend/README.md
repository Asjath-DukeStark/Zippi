# Zippi Backend v2

Production-grade REST API powering the Zippi web app, Admin Panel, Rider App and future Android/iOS clients.

**Stack:** Node.js · Express · Supabase (Postgres + Storage) · JWT · express-validator · Helmet

## Setup

1. `npm install`
2. Copy `.env.example` → `.env` and fill in your Supabase credentials (already done if migrating).
3. Run `migration.sql` once in the Supabase SQL Editor (idempotent, preserves existing data). `schema.sql` is the full-schema reference for fresh installs.
4. `npm run setup:storage` — creates the public `zippi-uploads` image bucket.
5. `npm run seed` — creates default admin (`0500000001` / `admin123`) and demo rider (`0500000002` / `rider123`). **Change these in production.**
6. `npm run dev` → http://localhost:3001

## Response envelope

Every endpoint returns camelCase JSON:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "...", "error": "CODE" }
```

Authenticated requests use `Authorization: Bearer <token>`.

## Endpoints

### Public (web + mobile)
| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/register | customer signup |
| POST | /api/auth/login | all roles |
| GET/PATCH | /api/auth/me | profile (auth) |
| GET | /api/products | `?category&search&popular=true&flash=true&page&limit` → `{products, pagination}` |
| GET | /api/products/:id | |
| GET | /api/categories | active categories |
| GET | /api/banners | active banners |
| GET | /api/settings | store + delivery config |
| POST | /api/orders | place order (auth) — server computes prices, fees, stock |
| GET | /api/orders/my | own orders (auth) |
| GET | /api/orders/:id | owner / rider / admin |
| POST | /api/orders/:id/cancel | pending orders only |

### Rider (`role=rider`)
| Method | Path | Notes |
|---|---|---|
| GET | /api/rider/me | profile + today's stats |
| PATCH | /api/rider/status | `{isOnline, latitude, longitude, vehicleType}` |
| GET | /api/rider/orders | active; `?history=true` for completed |
| PATCH | /api/rider/orders/:id/status | `dispatched→arriving→delivered` enforced |

### Admin (`role=admin`, prefix `/api/admin`)
- `GET /analytics/summary`, `/analytics/orders-by-day?days=14`, `/analytics/top-products`
- Products / Categories / Banners: `GET`, `POST`, `PATCH /:id`, `DELETE /:id` (soft delete; `?hard=true` to purge)
- Orders: `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `PATCH /orders/:id/assign` (`{riderId}`)
- Users: `GET`, `GET /:id`, `POST` (create rider/admin), `PATCH /:id`, `DELETE /:id` (disables)
- Riders: `GET /riders` — profiles + live workload
- Settings: `PUT /settings/store`, `PUT /settings/delivery`
- Uploads: `POST /uploads?folder=products|banners|categories` (multipart field `image`, ≤5 MB) → `{url, path}`; `DELETE /uploads` `{path}`

## Order lifecycle

`pending → preparing → dispatched → arriving → delivered` (or `cancelled`).
Admin may set any status; riders only `dispatched→arriving→delivered` on their own orders. Every change is recorded in `order_events`.

## Compatibility

The existing Zippi web app contract is preserved: `GET /api/products`, `/api/categories`, `/api/banners` return the same `{success, data}` shapes as v1.
