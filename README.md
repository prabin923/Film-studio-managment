# WedStudio OS

Operations app for wedding and film studios — client projects, expenses, payroll, gear inventory, rental bookings, and monthly reports in NPR.

Built for [Infinity Creations](https://github.com/prabin923/Film-studio-managment).

## Tech stack

- **Next.js 14** (App Router) + React 18 + TypeScript
- **Prisma 7** with Postgres (`@prisma/adapter-pg`)
- Session auth via HTTP-only cookies; amounts stored as integer paisa

## Run locally

```bash
npm install
cp .env.example .env
# Set DATABASE_URL in .env (see Database below)
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register a new studio account — new signups start with an empty workspace (no demo/sample data).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string (Prisma Postgres or self-hosted) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Reserved for future Clerk auth |
| `CLERK_SECRET_KEY` | No | Reserved for future Clerk auth |

Copy `.env.example` to `.env` and fill in `DATABASE_URL` before running migrations.

## Database (Prisma Postgres)

1. Link your Prisma Postgres database (writes `DATABASE_URL` to `.env`):

```bash
PRISMA_API_KEY="<your-api-key>" npx prisma postgres link --database "<DATABASE_ID>"
```

Or paste any Postgres URL into `.env` as `DATABASE_URL`.

2. Apply migrations and verify:

```bash
npm run db:migrate
npm run db:verify
```

Schema reference: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## Features

- Register / login with persisted workspaces (owner and manager roles)
- Dashboard with role-aware navigation
- Clients and projects — package, paid, and due amounts
- Expense ledger, salary records, inventory, and rental bookings
- Return tracking; rentals mark gear as rented, returns mark it available
- Monthly reports and charts; money entered in rupees, stored in paisa

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (cleans `.next`, syncs styles) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Prisma Studio |
| `npm run db:verify` | Check DB connectivity |

## Verification

```bash
npm run lint
npm run build
npm run db:verify
```
