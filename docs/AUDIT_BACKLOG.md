# Bug Audit Backlog

Living checklist for the full codebase audit. Each row maps to an isolated branch/PR when fixed.

| ID | Severity | Finding | Status | Branch |
|----|----------|---------|--------|--------|
| P0-1 | P0 | Payment callback redirects to `/dashboard/payment/result` (404) | fixed | fix/payment-routing |
| P0-2 | P0 | Prisma `Decimal` passed to client components on `/book` | fixed | fix/decimal-serialization |
| P0-3 | P0 | Font files redirected to login via proxy | fixed | fix/payment-routing |
| P0-4 | P0 | Payment callback API requires auth | fixed | fix/payment-routing |
| P1-1 | P1 | Barber cannot update appointment status (ADMIN-only action) | fixed | fix/barber-status-and-login |
| P1-2 | P1 | Login ignores `callbackUrl` for CUSTOMER role | fixed | fix/barber-status-and-login |
| P1-3 | P1 | Double-booking race (overlap check outside transaction) | fixed | fix/booking-integrity |
| P1-4 | P1 | No server-side slot validation on create | fixed | fix/booking-integrity |
| P1-5 | P1 | Stale time after service/barber change in Zustand | fixed | fix/booking-integrity |
| P1-6 | P1 | Booking reset + success toast before payment completes | fixed | fix/booking-integrity |
| P1-7 | P1 | Past same-day slots still bookable | fixed | fix/booking-integrity |
| P1-8 | P1 | `revalidatePath("/dashboard")` targets non-existent route | fixed | fix/payment-routing |
| P2-1 | P2 | `getMyAppointments` missing `payment` relation | fixed | fix/booking-integrity |
| P2-2 | P2 | Cancel appointment does not sync payment status | fixed | fix/booking-integrity |
| P2-3 | P2 | Inactive barber not checked on create | fixed | fix/booking-integrity |
| P2-4 | P2 | BARBER can mutate shop-wide working hours | fixed | fix/booking-integrity |
| P2-5 | P2 | Proxy allows BARBER on `/admin` but layout requires ADMIN | fixed | fix/booking-integrity |
| P2-6 | P2 | No booking step guards on deep links | fixed | fix/booking-integrity |
| P2-7 | P2 | Accessibility gaps in booking selectors | fixed | fix/booking-integrity |
| P3-1 | P3 | ESLint setState-in-effect in admin sidebar | fixed | chore/baseline-gates |
| P3-2 | P3 | Availability tests duplicate production logic | fixed | fix/booking-integrity |

## Deferred (documented, not blocking release)

| ID | Severity | Finding | Rationale |
|----|----------|---------|-----------|
| D-1 | P2 | JWT role changes not reflected until re-login | Expected next-auth JWT behavior; document for admins |
| D-2 | P2 | In-memory rate limit resets on serverless cold start | Requires Redis/Upstash — separate infra task |
| D-3 | P3 | Raw `<img>` on landing/booking cards | Needs `remotePatterns` curation — cosmetic/perf |
| D-4 | P3 | Unused lint warnings in legacy components | Non-blocking warnings only |

## Verification gates

```bash
npm ci
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run test
npm run build
```

Last verified: 2026-08-11 on branch `fix/booking-integrity` (pre-merge to `main`).
