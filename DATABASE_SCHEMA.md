# Suggested Production Schema

Use this as the starting point when moving from local browser storage to Postgres.

```sql
create type user_role as enum ('owner', 'staff');
create type project_status as enum ('Inquiry', 'Booked', 'Editing', 'Delivered');
create type inventory_status as enum ('Available', 'Rented', 'Maintenance');
create type rental_status as enum ('Reserved', 'Out', 'Returned');
create type pay_status as enum ('Pending', 'Paid');

create table staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text unique,
  name text not null,
  role_title text not null,
  app_role user_role not null default 'staff',
  monthly_salary_paisa integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  project_type text not null,
  event_date date not null,
  location text not null default '',
  package_amount_paisa integer not null default 0,
  assigned_staff_id uuid references staff(id),
  status project_status not null default 'Inquiry',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  rental_id uuid,
  paid_on date not null,
  amount_paisa integer not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  spent_on date not null,
  category text not null,
  vendor text not null,
  amount_paisa integer not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table salary_records (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  salary_month date not null,
  salary_paisa integer not null,
  advance_paisa integer not null default 0,
  deduction_paisa integer not null default 0,
  status pay_status not null default 'Pending',
  paid_on date,
  created_at timestamptz not null default now()
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  serial text not null default '',
  condition text not null default 'Good',
  day_rate_paisa integer not null default 0,
  status inventory_status not null default 'Available',
  created_at timestamptz not null default now()
);

create table rental_bookings (
  id uuid primary key default gen_random_uuid(),
  renter text not null,
  phone text not null,
  item_id uuid not null references inventory_items(id),
  start_date date not null,
  end_date date not null,
  deposit_paisa integer not null default 0,
  amount_paisa integer not null default 0,
  status rental_status not null default 'Reserved',
  return_condition text not null default '',
  created_at timestamptz not null default now()
);

alter table payments
  add constraint payments_project_or_rental
  check (project_id is not null or rental_id is not null);
```
