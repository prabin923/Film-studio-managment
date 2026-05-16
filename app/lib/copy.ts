import type { View } from "./types";

export const pageCopy: Record<View, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of active work, balances, and gear currently out.",
  },
  clients: {
    title: "Clients & projects",
    description: "Bookings, payments, crew assignment, and delivery status.",
  },
  expenses: {
    title: "Expenses",
    description: "Operating costs logged against the studio ledger.",
  },
  salary: {
    title: "Payroll",
    description: "Monthly salary, advances, deductions, and payment status.",
  },
  inventory: {
    title: "Inventory",
    description: "Gear availability, condition, serials, and day rates.",
  },
  rentals: {
    title: "Rentals",
    description: "Bookings, deposits, balances, and return tracking.",
  },
  reports: {
    title: "Reports",
    description: "Month-wise income, expenses, charts, and ledger totals.",
  },
  profile: {
    title: "Studio profile",
    description: "Your studio identity, contact details, and account settings.",
  },
};
