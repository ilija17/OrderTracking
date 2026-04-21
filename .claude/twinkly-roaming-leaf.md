# Sysadmin Order Tracker — Implementation Plan

## Context

The sysadmin department needs a simple internal web app to track hardware/software orders: what was ordered, from whom, when it's expected, and its current status. Today this is likely scattered across emails and spreadsheets. The app should centralize vendor contact info so orders can be linked to a known vendor via dropdown, and each sysadmin should have their own login so it's clear who placed or updated an order. The app will run inside a Docker container on a local machine, with the SQLite file and uploaded attachments persisted via mounted volumes. No email/push notifications — just visual indicators in the UI for overdue or upcoming deliveries.

## Stack

- **Nuxt 3** (Vue 3 + Nitro server) — file-based routing, server API routes, SSR templates feel close to plain HTML
- **SQLite** via `better-sqlite3` — single file, zero setup, perfect for local single-machine use
- **Drizzle ORM** — lightweight, TypeScript-friendly, simpler than Prisma for SQLite
- **Tailwind CSS** — quick clean UI via `@nuxtjs/tailwindcss`
- **nuxt-auth-utils** — simple session-based per-user auth (password hashed with built-in `hashPassword`)
- **Zod** — form validation on both client and server

## Data Model

Three tables in SQLite:

**`users`**
- `id` (pk), `username` (unique), `password_hash`, `display_name`, `created_at`

**`vendors`**
- `id` (pk), `name`, `contact_person`, `phone`, `email`, `website`, `notes`, `created_at`

**`orders`**
- `id` (pk)
- `item` (text, required) — what was ordered
- `vendor_id` (fk → vendors.id, nullable) — dropdown selection
- `quantity` (integer, default 1)
- `unit_price` (real, nullable) — stored in cents to avoid float issues (integer)
- `order_number` (text, nullable) — external PO/order reference
- `tracking_number` (text, nullable)
- `attachment_url` (text, nullable) — link to invoice/quote (local path or URL)
- `order_date` (date)
- `expected_date` (date, nullable)
- `received_date` (date, nullable)
- `status` (text: `pending` | `ordered` | `shipped` | `received` | `cancelled`)
- `notes` (text, nullable)
- `created_by` (fk → users.id)
- `created_at`, `updated_at`

## Routes (pages)

- `/login` — login form
- `/` — dashboard: list of active orders with status badges, filters (status, vendor, date range), overdue/upcoming visual indicators
- `/orders/new` — create order form (vendor dropdown populated from `/vendors`)
- `/orders/[id]` — view/edit single order
- `/vendors` — list of vendors
- `/vendors/new` — add vendor
- `/vendors/[id]` — view/edit vendor

## Server API routes (`server/api/`)

- `POST /api/auth/login`, `POST /api/auth/logout`
- `GET/POST /api/orders`, `GET/PATCH/DELETE /api/orders/[id]`
- `GET/POST /api/vendors`, `GET/PATCH/DELETE /api/vendors/[id]`
- Global middleware protects all non-auth routes via `nuxt-auth-utils` session check

## Visual Indicators Logic (dashboard)

For orders not yet `received` / `cancelled`:
- **Red badge** — `expected_date < today` (overdue)
- **Yellow badge** — `expected_date` within next 3 days
- **Neutral** — otherwise

Implemented as a computed class in a `<StatusBadge>` Vue component.

## File Layout

```
/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── nuxt.config.ts
├── package.json
├── tailwind.config.js
├── drizzle.config.ts
├── data/
│   ├── data.db                  # SQLite file (volume-mounted, gitignored)
│   └── uploads/                 # attachment files (volume-mounted, gitignored)
├── server/
│   ├── api/
│   │   ├── auth/
│   │   ├── orders/
│   │   └── vendors/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   └── index.ts             # db client
│   ├── middleware/
│   │   └── auth.ts              # session guard
│   └── utils/
│       └── seed.ts              # creates first admin user on startup if no users exist
├── pages/
│   ├── index.vue                # dashboard
│   ├── login.vue
│   ├── orders/
│   │   ├── new.vue
│   │   └── [id].vue
│   └── vendors/
│       ├── index.vue
│       ├── new.vue
│       └── [id].vue
├── components/
│   ├── OrderForm.vue
│   ├── OrderTable.vue
│   ├── StatusBadge.vue
│   ├── VendorForm.vue
│   └── VendorSelect.vue
└── composables/
    └── useOrders.ts
```

## Implementation Steps

1. **Scaffold** — `npx nuxi init`, install deps (`better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `@nuxtjs/tailwindcss`, `nuxt-auth-utils`, `zod`)
2. **DB setup** — Drizzle schema for all 3 tables, migration script, `data.db` creation
3. **Auth** — `nuxt-auth-utils` config, login page, logout, global middleware, bootstrap script to create first user on first run
4. **Vendors CRUD** — list, create, edit, delete pages + API
5. **Orders CRUD** — list (dashboard), create, edit, delete pages + API; vendor dropdown via `<VendorSelect>`
6. **Dashboard polish** — filters (status/vendor/date), `<StatusBadge>` overdue/upcoming logic, sortable columns
7. **Attachments** — file upload to `data/uploads/` via `h3` multipart, stored path saved on the order; download endpoint serves files with auth check
8. **Styling pass** — Tailwind tidy-up, responsive table
9. **Dockerization** — multi-stage `Dockerfile` (node:20-alpine builder + runner stage), `docker-compose.yml` with a named volume mounted at `/app/data` so `data.db` and `uploads/` survive container rebuilds; expose port 3000

## Verification

**Dev loop (fast iteration):**
- Run `npm run dev`, visit `http://localhost:3000`
- On first launch, should be prompted to create the initial admin user (or use a seeded default printed to console)
- Log in, create 2 vendors with full contact info
- Create 3 orders with different statuses, one with `expected_date` in the past (should show red), one within 3 days (yellow)
- Upload a PDF attachment to one order, confirm it downloads correctly
- Edit an order, mark it `received` — badge should disappear
- Log out, confirm all protected pages redirect to `/login`

**Docker (final target):**
- `docker compose build && docker compose up`
- Visit `http://localhost:3000`, repeat key flows above
- `docker compose down` then `docker compose up` again — data and uploads must persist (volume working)
- `docker compose down -v` resets to a clean install (verify the first-run admin bootstrap fires again)

## Out of Scope (future)

- Email notifications
- Multi-tenant / role-based permissions
- CSV export/import
- Audit log of edits
- Deployment to internal server (currently local-only)
