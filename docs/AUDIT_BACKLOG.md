# Bug Audit Backlog

Living checklist for the full codebase audit. Each row maps to an isolated branch/PR when fixed.

| ID | Severity | Finding | Status | Branch |
|----|----------|---------|--------|--------|
| P0-1 | P0 | Payment callback redirects to `/dashboard/payment/result` (404) | open | fix/payment-routing |
| P0-2 | P0 | Prisma `Decimal` passed to client components on `/book` | open | fix/decimal-serialization |
| P0-3 | P0 | Font files redirected to login via proxy | open | fix/proxy-static-assets |
| P0-4 | P0 | Payment callback API requires auth | open | fix/proxy-static-assets |
| P1-1 | P1 | Barber cannot update appointment status (ADMIN-only action) | open | fix/barber-status-auth |
| P1-2 | P1 | Login ignores `callbackUrl` for CUSTOMER role | open | fix/login-callback-url |
| P1-3 | P1 | Double-booking race (overlap check outside transaction) | open | fix/booking-concurrency |
| P1-4 | P1 | No server-side slot validation on create | open | fix/slot-validation |
| P1-5 | P1 | Stale time after service/barber change in Zustand | open | fix/booking-state |
| P1-6 | P1 | Booking reset + success toast before payment completes | open | fix/booking-state |
| P1-7 | P1 | Past same-day slots still bookable | open | fix/past-slots |
| P1-8 | P1 | `revalidatePath("/dashboard")` targets non-existent route | open | fix/payment-routing |
| P2-1 | P2 | `getMyAppointments` missing `payment` relation | open | fix/appointment-queries |
| P2-2 | P2 | Cancel appointment does not sync payment status | open | fix/cancel-payment-sync |
| P2-3 | P2 | Inactive barber not checked on create | open | fix/slot-validation |
| P2-4 | P2 | BARBER can mutate shop-wide working hours | open | fix/working-hour-auth |
| P2-5 | P2 | Proxy allows BARBER on `/admin` but layout requires ADMIN | open | fix/role-policy |
| P2-6 | P2 | No booking step guards on deep links | open | fix/booking-guards |
| P2-7 | P2 | Accessibility gaps in booking selectors | open | fix/booking-a11y |
| P3-1 | P3 | ESLint setState-in-effect in admin sidebar | open | fix/admin-sidebar-lint |
| P3-2 | P3 | Availability tests duplicate production logic | open | fix/availability-tests |

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
