import { LANDING_IMAGES } from "./landing-content";

export const MERCURY_HERO_IMAGE =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2400&q=80";

export const MERCURY_PRODUCTS = [
  {
    id: "clients",
    title: "Clients & projects",
    description:
      "Every wedding booking becomes a living project card — deposits, crew, delivery status, and paid vs due in one view.",
    visual: "clients" as const,
  },
  {
    id: "payroll",
    title: "Payroll & crew",
    description:
      "Monthly salary, advances, and deductions with pending vs paid totals that roll into your dashboard cash flow.",
    visual: "payroll" as const,
  },
  {
    id: "gear",
    title: "Gear & rentals",
    description:
      "Inventory with availability tied to rental bookings — multi-item rentals, deposits, and return status in sync.",
    visual: "gear" as const,
  },
  {
    id: "reports",
    title: "Reports & ledger",
    description:
      "Revenue charts, month-wise net, and owner-only financial views — one ledger instead of scattered spreadsheets.",
    visual: "reports" as const,
  },
] as const;

export type MercuryProductId = (typeof MERCURY_PRODUCTS)[number]["id"];

export const MERCURY_SHOWCASE = [
  {
    id: "book",
    title: "Book a new couple",
    description:
      "Add the project with package amount and deposit. Track delivery from shoot through edit — mark Paid when the final installment lands.",
    image: LANDING_IMAGES.workflowBook,
    imageAlt: "Wedding couple portrait",
  },
  {
    id: "payroll",
    title: "Pay the crew on time",
    description:
      "Enter monthly salary, advances, and deductions. Mark paid when you transfer — payroll due surfaces on the dashboard.",
    image: LANDING_IMAGES.workflowPayroll,
    imageAlt: "Film crew collaborating",
  },
  {
    id: "rent",
    title: "Rent gear out",
    description:
      "Build a multi-item rental, take a deposit, and watch inventory flip to Rented. On return, gear becomes Available again.",
    image: LANDING_IMAGES.workflowRent,
    imageAlt: "Professional cinema camera",
  },
  {
    id: "report",
    title: "Close the month with clarity",
    description:
      "Revenue vs expenses, client onboarding trends, and net cash — owner reports without reconciling three tools.",
    image: LANDING_IMAGES.built,
    imageAlt: "Wedding videographer at work",
  },
] as const;

export type MercuryShowcaseId = (typeof MERCURY_SHOWCASE)[number]["id"];

export const MERCURY_TESTIMONIALS = [
  {
    tag: "Studio owner",
    quote:
      "We stopped juggling spreadsheets for every wedding. Deposits, crew, and gear rentals finally live in one calm workspace.",
    name: "Priya K.",
    role: "Infinity Creations",
  },
  {
    tag: "Operations",
    quote:
      "Our manager logs payroll and rentals daily while I keep full reports owner-only. Same data, different permissions — exactly what we needed.",
    name: "Manager view",
    role: "Shared workspace",
  },
  {
    tag: "Wedding film",
    quote:
      "Project cards mirror how we actually work: couples first, people and gear attached to those projects, money in and out with clear balances.",
    name: "WedStudio OS",
    role: "Built for film teams",
  },
] as const;

export const MERCURY_STATS = [
  { value: "6", label: "Core modules", suffix: "" },
  { value: "2", label: "Team roles", suffix: "" },
  { value: "NPR", label: "Local currency", suffix: "" },
  { value: "1", label: "Shared workspace", suffix: "" },
] as const;

export const MERCURY_STEPS = [
  {
    id: "register",
    step: "01",
    title: "Register in minutes",
    tagline: "Create your workspace",
    description:
      "Add your studio name, city, and contact details. Your branding shows on the dashboard and sidebar right away.",
  },
  {
    id: "invite",
    step: "02",
    title: "Invite your manager",
    tagline: "One ledger, two logins",
    description:
      "They sign up with their own email plus yours to join the same workspace — clients, payroll, and rentals stay in sync.",
  },
  {
    id: "run",
    step: "03",
    title: "Run the studio daily",
    tagline: "Work from anywhere",
    description:
      "Log clients, payroll, gear, and expenses from any browser. Owners get full reports; managers handle day-to-day ops.",
  },
] as const;

export const MERCURY_TRUST = [
  {
    title: "Role-based access",
    description:
      "Owners get full reports; managers handle day-to-day clients, payroll, inventory, and rentals without exposing sensitive totals.",
  },
  {
    title: "Secure cloud data",
    description:
      "Workspace data stored in Postgres — sign in from any device and pick up where you left off with your team.",
  },
  {
    title: "Controls you expect",
    description:
      "Separate accounts, shared ledger, and owner-only financial views so permissions stay clear as you grow.",
  },
] as const;
