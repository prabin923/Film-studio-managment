/** Unsplash stock imagery — wedding film / studio ops (free to use per Unsplash license). */
export const LANDING_IMAGES = {
  heroPrimary:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  heroSecondary:
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80",
  heroTertiary:
    "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80",
  built:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  workflowBook:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80",
  workflowPayroll:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80",
  workflowRent:
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80",
} as const;

export type OrbitModuleId =
  | "clients"
  | "payroll"
  | "gear"
  | "rentals"
  | "expenses"
  | "reports";

export type OrbitModule = {
  id: OrbitModuleId;
  label: string;
  tone: string;
  blurb: string;
  href: string;
};

export const ORBIT_MODULES: OrbitModule[] = [
  {
    id: "clients",
    label: "Clients",
    tone: "indigo",
    blurb: "Project cards with deposits, crew, and delivery status.",
    href: "#features",
  },
  {
    id: "payroll",
    label: "Payroll",
    tone: "violet",
    blurb: "Monthly salary, advances, and pending vs paid totals.",
    href: "#features",
  },
  {
    id: "gear",
    label: "Gear",
    tone: "pink",
    blurb: "Inventory with availability tied to rental bookings.",
    href: "#features",
  },
  {
    id: "rentals",
    label: "Rentals",
    tone: "amber",
    blurb: "Multi-item bookings with deposits and return status.",
    href: "#features",
  },
  {
    id: "expenses",
    label: "Expenses",
    tone: "teal",
    blurb: "Operating costs in the same ledger as income.",
    href: "#features",
  },
  {
    id: "reports",
    label: "Reports",
    tone: "blue",
    blurb: "Revenue charts and month-wise net for owners.",
    href: "#features",
  },
];

export const ORBIT_RADIUS_PX = 158;

export function orbitPosition(index: number, total: number, radius = ORBIT_RADIUS_PX) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
  };
}
