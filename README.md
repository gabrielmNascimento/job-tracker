# Job Tracker

A small full-stack app for tracking job applications — company, role, status, notes — built to demonstrate a React/TypeScript/Node stack end to end.

**Live:** https://job-tracker-gabriel.vercel.app · API: https://server-production-8388.up.railway.app

## Architecture

Monorepo with two npm workspaces:

- **`client/`** — React 19 + TypeScript + Vite, Tailwind CSS, TanStack Query, React Router
- **`server/`** — Node + Express + TypeScript, Prisma ORM, PostgreSQL, JWT auth

REST API, stateless auth via JWT, Postgres as the source of truth. No framework magic beyond what's needed — chosen to be legible in a code review, not to look clever.

Field limits (enforced client- and server-side): company/role/location max 120 chars, notes max 1000, salary numbers only up to 6 digits, job URL auto-prefixed with `https://` if you type a bare domain.

## Local development

Requires Node 20+ and Docker (for local Postgres).

```bash
# 1. install everything
npm install

# 2. start local Postgres
docker compose up -d

# 3. configure the server
cp server/.env.example server/.env
# edit server/.env if needed

# 4. run migrations
npm run prisma:migrate -w server

# 5. run both apps (in separate terminals)
npm run dev:server
npm run dev:client
```

Client runs at http://localhost:5173, API at http://localhost:4000.

## Deployment

- **Client** → Vercel (static build of `client/`), auto-deploys on push to `main`
- **Server + DB** → Railway (Express service + managed Postgres), auto-deploys on push to `main`

## Status

Work in progress — see commit history for what's built so far.
