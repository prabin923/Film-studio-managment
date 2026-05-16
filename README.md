# WedStudio OS

A Next.js operations app for wedding film studios, covering client projects, expenses, staff salary records, gear inventory, rental bookings, and simple reports in NPR.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current Implementation

- Register/login screen with local studio workspace onboarding.
- Operations dashboard with role-aware owner/staff navigation.
- Client and project tracking with package, paid, and due amounts.
- Expense ledger, salary records, inventory, rental booking, return tracking, and reports.
- Rental bookings automatically mark inventory as rented; returns mark items available.
- Studio profile and records persist in browser `localStorage` for the current device.
- Money is entered in rupees and stored internally as integer paisa.

## Production Upgrade Path

The UI is ready to connect to hosted services. For a full cloud multi-user release, replace the browser `localStorage` store with a Postgres-backed data layer and add real authentication:

- Auth: Clerk or another Next.js-compatible auth provider.
- Database: Neon Postgres.
- ORM: Drizzle.
- Authorization: map authenticated users to `owner` or `staff` roles and guard owner-only finance routes server-side.

## Verification

Validated with:

```bash
npm run lint
npm run build
curl -I http://localhost:3000
```
# Film-studio-managment
