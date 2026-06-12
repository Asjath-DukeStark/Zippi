# Zippi Admin Panel

Full-featured dashboard for managing the Zippi platform: analytics, orders, products, categories, banners, users, riders and store settings — with image uploads to Supabase Storage.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS v4 · React Router · lucide-react

## Setup

1. `npm install`
2. (Optional) copy `.env.example` → `.env` to point at a remote API. In development the Vite proxy forwards `/api` to `http://localhost:3001`.
3. `npm run dev` → http://localhost:3002

Sign in with an **admin** account (default seed: `0500000001` / `admin123`).

## Build

`npm run build` → static files in `dist/` (deploy to Vercel, Netlify, or any static host; set `VITE_API_BASE_URL` to your production API).
