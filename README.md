# WedStudio OS

A Next.js operations app for wedding film studios, covering client projects, expenses, staff salary records, gear inventory, rental bookings, and simple reports in NPR.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database (Prisma Postgres)

1. Link your Prisma Postgres database (writes `DATABASE_URL` to `.env`):

```bash
PRISMA_API_KEY="<your-api-key>" npx prisma postgres link --database "<DATABASE_ID>"
```

2. Apply migrations and seed demo data:

```bash
npm run db:migrate
npm run db:seed
npm run db:verify
```

Demo sign-in after seed: `owner@infinitycreations.com` / `demo12345`

## Current Implementation

- Register/login with HTTP-only session cookies and Postgres persistence via Prisma.
- Operations dashboard with role-aware owner/manager navigation.
- Client and project tracking with package, paid, and due amounts.
- Expense ledger, salary records, inventory, rental booking, return tracking, and reports.
- Rental bookings automatically mark inventory as rented; returns mark items available.
- Money is entered in rupees and stored internally as integer paisa.

## Verification

Validated with:

```bash
npm run lint
npm run build
curl -I http://localhost:3000
```
# Film-studio-managment
