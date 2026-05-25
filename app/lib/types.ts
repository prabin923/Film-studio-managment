export type Role = "owner" | "manager";
export type View =
  | "dashboard"
  | "clients"
  | "expenses"
  | "salary"
  | "inventory"
  | "rentals"
  | "reports"
  | "profile";
export type ProjectStatus = "Inquiry" | "Booked" | "Editing" | "Delivered";

export const PROJECT_STATUSES: ProjectStatus[] = ["Inquiry", "Booked", "Editing", "Delivered"];
export type ProjectPaymentStatus = "Paid" | "Unpaid";

export const PROJECT_PAYMENT_STATUSES: ProjectPaymentStatus[] = ["Paid", "Unpaid"];
export type ItemStatus = "Available" | "Rented" | "Maintenance";
export type RentalStatus = "Reserved" | "Out" | "Returned";
export type PayStatus = "Pending" | "Paid";
export type AuthMode = "login" | "register";
export type RegisterAs = "owner" | "manager";

import type { StudioBranding } from "./studio-branding";

export type { BrandShape, StudioBranding } from "./studio-branding";

export type Workspace = {
  id: string;
  studioName: string;
  phone: string;
  location: string;
  tagline: string;
  ownerEmail: string;
} & StudioBranding;

export type Account = {
  workspaceId: string;
  name: string;
  email: string;
  studioName: string;
  phone: string;
  location: string;
  tagline: string;
  role: Role;
} & StudioBranding;

export type StoredAccount = Account & {
  password?: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  projectType: string;
  eventDate: string;
  createdAt?: string;
  location: string;
  packageAmount: number;
  paidAmount: number;
  paymentStatus: ProjectPaymentStatus;
  assignedStaff: string;
  status: ProjectStatus;
  notes: string;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  vendor: string;
  amount: number;
  notes: string;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  monthlySalary: number;
  advance: number;
  deduction: number;
  status: PayStatus;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  serial: string;
  condition: string;
  dayRate: number;
  status: ItemStatus;
};

export type Rental = {
  id: string;
  renter: string;
  phone: string;
  itemId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  amount: number;
  paidAmount: number;
  status: RentalStatus;
  returnCondition: string;
};

export type Store = {
  clients: Client[];
  expenses: Expense[];
  staff: Staff[];
  inventory: InventoryItem[];
  rentals: Rental[];
};

export type Stats = {
  activeProjects: number;
  activeRentals: number;
  availableItems: number;
  clientRevenue: number;
  clientDue: number;
  rentalRevenue: number;
  rentalDue: number;
  expenses: number;
  payrollDue: number;
  netCash: number;
};
