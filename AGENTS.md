<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16** App Router, **React 19.2**, **TypeScript 5**
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@theme inline` in CSS, NOT the old `@tailwind` directives
- **Prisma 7.8** with Neon serverless Postgres (`@prisma/adapter-neon`)
- **next-auth v4** for auth
- **Zustand** for client state
- **react-hook-form + zod** for forms/validation
- **ESLint 9 flat config** — `eslint.config.mjs`, not `.eslintrc`
- Package manager: **npm** (`package-lock.json`)

## Commands

```bash
npm run dev          # Start dev server (Turbopack is default in v16)
npm run build        # Production build (Turbopack by default)
npm run lint         # ESLint directly — `next lint` was removed in v16
npm run typecheck    # TypeScript check
npm run test         # Vitest unit tests
```

## Prisma

Schema at `prisma/schema.prisma`. Client output generated to `app/generated/prisma` (gitignored).

```bash
npx prisma generate   # Regenerate client after schema changes
npx prisma db push     # Push schema to database (no migration files)
```

The `prisma.config.ts` reads `DATABASE_URL` from `.env`. You need a `.env` with `DATABASE_URL` set to a Postgres connection string.

## Next.js 16 Breaking Changes (high-signal)

These are the traps that will bite an agent if not warned:

- **`middleware.ts` is renamed to `proxy.ts`**, and the exported function must be named `proxy`, not `middleware`. Config flag `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.
- **`next lint` removed** — run `eslint` directly. The `eslint` option in `next.config.ts` is also gone.
- **Async Request APIs are mandatory** — `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` are all async now. Synchronous access throws. `await` them.
- **`revalidateTag` requires a second argument** (`cacheLife` profile): `revalidateTag('key', 'max')`.
- **`cacheLife` and `cacheTag`** drop the `unstable_` prefix.
- **`next/legacy/image` removed** — use `next/image`.
- **`images.domains` deprecated** — use `images.remotePatterns`.
- **Turbopack is default** for both `dev` and `build`. No `--turbopack` flag needed. If you have a `webpack` config in `next.config.ts`, the build will fail unless you pass `--webpack`.
- **`experimental_ppr` route segment removed** — use `cacheComponents: true` in config instead.
- **`serverRuntimeConfig` / `publicRuntimeConfig` removed** — use env vars directly.
- **Parallel route slots** require explicit `default.js` files or builds fail.

Full reference: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

## Project Structure

```
app/           # App Router pages, actions, API routes
components/    # Shared React components
lib/           # Utilities, auth, Prisma client, validations
hooks/         # Custom React hooks
stores/        # Zustand stores
types/         # Shared TypeScript types
prisma/        # Prisma schema
__tests__/     # Vitest unit tests
docs/          # Audit backlog and project docs
```

Path alias: `@/*` maps to project root.

## Gotchas

- Tailwind v4 uses `@theme inline` blocks to define design tokens in CSS (see `app/globals.css`). Do not use the old `tailwind.config.js` approach — there is no config file.
- The Prisma client import path is `@/app/generated/prisma` (after `npx prisma generate`). This directory is gitignored.
- `.env` files are gitignored (`.env*` pattern). Never commit secrets.
- Dev and build now use separate output directories (`.next/dev` vs `.next`), so they can run concurrently.
- CI runs lint, typecheck, test, and build via `.github/workflows/ci.yml`.
- Bug audit backlog: `docs/AUDIT_BACKLOG.md`.

## Git workflow

- Use focused branches (`fix/`, `feat/`, `chore/`) for changes.
- When a task is verified, **merge into `main` and push `origin main`**, then **merge `main` into `master` and push `origin master`** — Vercel production deploys from `master`, not `main`.
- Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` before merging when the change affects build/runtime.
- Do not leave completed fixes unmerged on feature branches.
