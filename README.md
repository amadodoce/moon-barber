# Moon Barber

Barbershop booking platform built with Next.js 16 App Router, Prisma, and Zarinpal payments.

## Stack

- Next.js 16, React 19, TypeScript 5
- Tailwind CSS v4
- Prisma 7.8 + Neon Postgres
- next-auth v4, Zustand, react-hook-form + Zod

## Setup

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

npm install
npx prisma db push
npm run db:seed          # or: npm run db:setup (push + comments table + seed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # Development server (Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run test       # Vitest unit tests
npm run db:push    # Sync Prisma schema to Postgres
npm run db:seed    # Seed demo data (users, services, appointments)
npm run db:setup   # db:push + comments table + seed
```

## Environment variables

See [.env.example](.env.example) for required variables:

- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — Authentication
- `ZARINPAL_*`, `CALLBACK_URL` — Payment gateway
- `NEXT_PUBLIC_BASE_URL` — Public app URL (mock gateway in dev)

## Project structure

```
app/           # App Router pages, actions, API routes
components/    # Shared UI components
lib/           # Utilities, auth, Prisma client, validations
stores/        # Zustand client state
prisma/        # Database schema
__tests__/     # Vitest unit tests
```

## Bug audit

See [docs/AUDIT_BACKLOG.md](docs/AUDIT_BACKLOG.md) for the living defect checklist and verification gates.
