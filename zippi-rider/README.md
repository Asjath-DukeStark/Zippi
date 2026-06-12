# Zippi Rider App

Mobile-first PWA for delivery riders: go online/offline (with GPS ping), see assigned deliveries, advance order status (picked up → arriving → delivered), call customers, navigate via Google Maps, and review delivery history and stats. Installable on riders' phones from the browser.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS v4 · React Router · lucide-react

## Setup

1. `npm install`
2. (Optional) copy `.env.example` → `.env` to point at a remote API. In development the Vite proxy forwards `/api` to `http://localhost:3001`.
3. `npm run dev` → http://localhost:3003

Sign in with a **rider** account (default seed: `0500000002` / `rider123`).

## Build

`npm run build` → static files in `dist/`. Deploy to any static host; set `VITE_API_BASE_URL` to your production API.
