# Plan: Admin Dashboard

## Context

The backend is complete: Server Actions for Services, WorkingHours, Holidays, Appointments, Payments, Barbers. The frontend has customer booking flow. We need the full admin dashboard with CRUD management for all entities, plus a Landing Page Content editor.

**shadcn/ui is NOT installed** — needs `npx shadcn@latest init` + component installation.
**No admin pages exist** — the `app/admin/` directory is empty.
**No landing page actions exist** — need to create `app/actions/landing-page.ts`.

## Approach

### Prerequisites

1. Initialize shadcn/ui: `npx shadcn@latest init`
2. Install needed components: `npx shadcn@latest add table dialog form input label select textarea badge card tabs calendar dropdown-menu separator sheet`
3. Add `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-separator` (pulled in by shadcn)

### Route Structure

```
app/admin/
  layout.tsx              # Admin layout with sidebar + auth check
  page.tsx                # Dashboard overview (stats cards)
  services/
    page.tsx              # Services list + CRUD
  schedule/
    page.tsx              # Working hours + Holidays combined
  appointments/
    page.tsx              # Appointments list with filters
  payments/
    page.tsx              # Payments list
  content/
    page.tsx              # Landing page content editor
```

### Files to Create (28 total)

**New Server Actions:**
| File | Purpose |
|------|---------|
| `app/actions/landing-page.ts` | CRUD for LandingPageContent (getLandingContent, upsertLandingContent) |

**New Validations:**
| File | Purpose |
|------|---------|
| `lib/validations/landing-page.ts` | Zod schemas for landing page content |

**Admin Layout + Pages:**
| File | Purpose |
|------|---------|
| `app/admin/layout.tsx` | Sidebar nav + admin auth guard |
| `app/admin/page.tsx` | Dashboard overview with stats |
| `app/admin/services/page.tsx` | Services CRUD table |
| `app/admin/schedule/page.tsx` | Working hours + holidays |
| `app/admin/appointments/page.tsx` | Appointments list with filters |
| `app/admin/payments/page.tsx` | Payments list |
| `app/admin/content/page.tsx` | Landing page content editor |

**Admin Components:**
| File | Purpose |
|------|---------|
| `components/admin/Sidebar.tsx` | Navigation sidebar |
| `components/admin/StatsCard.tsx` | Dashboard stats card |
| `components/admin/DataTable.tsx` | Reusable data table wrapper |
| `components/admin/ServiceForm.tsx` | Service create/edit form |
| `components/admin/ServiceDialog.tsx` | Service create/edit dialog |
| `components/admin/WorkingHourForm.tsx` | Working hour form |
| `components/admin/HolidayForm.tsx` | Holiday form |
| `components/admin/AppointmentFilters.tsx` | Filter bar for appointments |
| `components/admin/AppointmentStatusBadge.tsx` | Status badge component |
| `components/admin/PaymentStatusBadge.tsx` | Payment status badge |
| `components/admin/ContentEditor.tsx` | Landing page content editor |

**shadcn/ui Components (installed via CLI):**
- `components/ui/table.tsx`
- `components/ui/dialog.tsx`
- `components/ui/form.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/select.tsx`
- `components/ui/textarea.tsx`
- `components/ui/badge.tsx`
- `components/ui/card.tsx`
- `components/ui/tabs.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/separator.tsx`
- `components/ui/sheet.tsx`

## Implementation Details

### 1. `app/admin/layout.tsx` — Admin Layout

- Server Component
- Calls `requireAdmin()` to verify role
- Renders sidebar + main content area
- Sidebar: logo, navigation links (Dashboard, Services, Schedule, Appointments, Payments, Content)
- Mobile: hamburger menu with slide-out sheet
- RTL layout

### 2. `app/admin/page.tsx` — Dashboard Overview

- Server Component fetching stats via direct Prisma queries:
  - Total appointments today
  - Total revenue (PAID payments)
  - Active services count
  - Pending appointments count
- Stats cards in a grid
- Recent appointments list (last 5)

### 3. `app/admin/services/page.tsx` — Services CRUD

- Uses `getAllServices()` action
- DataTable with columns: Name, Duration, Price, Status, Actions
- "Add Service" button opens ServiceDialog
- Edit/Delete actions per row
- Soft-delete with confirmation

### 4. `app/admin/schedule/page.tsx` — Working Hours + Holidays

- Tabs: "ساعات کاری" | "تعطیلات"
- Working Hours tab:
  - Filter by barber (dropdown)
  - Weekly schedule view (day cards with time ranges)
  - Add/Edit/Delete working hours via dialog
- Holidays tab:
  - Calendar view showing holidays
  - List of holidays with add/edit/delete
  - Support FULL_DAY and TIME_RANGE types

### 5. `app/admin/appointments/page.tsx` — Appointments

- Uses `getAllAppointments()` action (already exists)
- DataTable with columns: Customer, Barber, Date, Time, Services, Status, Payment, Actions
- Filters: status dropdown, date range, barber
- Status update via dropdown (PENDING → CONFIRMED → COMPLETED)
- Click to view details

### 6. `app/admin/payments/page.tsx` — Payments

- Query payments with appointment + user info
- DataTable: Customer, Amount, Status, Method, Date, Actions
- Filter by status
- View payment details

### 7. `app/admin/content/page.tsx` — Landing Page Editor

- Form-based editor for key-value content
- Fields: shop_name, hero_image, about_text, phone, address, working_hours_text
- Each field has appropriate input type (text, textarea, image URL)
- Save via upsert action

## Verification

1. `npx tsc --noEmit` — type-check passes
2. `npm run build` — build succeeds
3. Navigate to `/admin` — verify auth redirect for non-admin
4. Test each CRUD operation (create, edit, delete)
5. Verify responsive layout on mobile (sidebar collapses)
