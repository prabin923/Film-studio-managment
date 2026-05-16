import { today } from "./seed";
import type { Client, Expense, Rental, Store } from "./types";

export type ChartMonthPoint = {
  key: string;
  label: string;
  value: number;
};

export type RevenueMonthPoint = ChartMonthPoint & {
  clientRevenue: number;
  rentalRevenue: number;
};

export function clientCreatedAt(client: Client) {
  return client.createdAt ?? client.eventDate;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

export function lastMonthKeys(count: number, anchor = today) {
  const end = new Date(`${anchor}T12:00:00`);
  const keys: string[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(end.getFullYear(), end.getMonth() - index, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    keys.push(`${year}-${month}`);
  }

  return keys;
}

export function formatMonthLabel(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-NP", { month: "short" });
}

export function formatMonthHeading(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-NP", { month: "short", year: "numeric" });
}

export type MonthlyReportRow = {
  key: string;
  month: string;
  clientsOnboarded: number;
  clientRevenue: number;
  rentalRevenue: number;
  totalIn: number;
  expenses: number;
  net: number;
};

export type MonthlyReportTotals = Omit<MonthlyReportRow, "key" | "month"> & {
  month: string;
};

function sumExpensesByMonth(expenses: Expense[], key: string) {
  return expenses.filter((expense) => monthKey(expense.date) === key).reduce((sum, expense) => sum + expense.amount, 0);
}

export function buildMonthlyReports(store: Store, monthCount = 6): MonthlyReportRow[] {
  const revenue = buildRevenueByMonth(store.clients, store.rentals, monthCount);
  const onboarded = buildClientsOnboardedByMonth(store.clients, monthCount);

  return revenue.map((point) => {
    const clientsOnboarded = onboarded.find((row) => row.key === point.key)?.value ?? 0;
    const expenses = sumExpensesByMonth(store.expenses, point.key);
    const totalIn = point.value;

    return {
      key: point.key,
      month: formatMonthHeading(point.key),
      clientsOnboarded,
      clientRevenue: point.clientRevenue,
      rentalRevenue: point.rentalRevenue,
      totalIn,
      expenses,
      net: totalIn - expenses,
    };
  });
}

export function sumMonthlyReportTotals(rows: MonthlyReportRow[]): MonthlyReportTotals {
  return rows.reduce(
    (totals, row) => ({
      month: "Period total",
      clientsOnboarded: totals.clientsOnboarded + row.clientsOnboarded,
      clientRevenue: totals.clientRevenue + row.clientRevenue,
      rentalRevenue: totals.rentalRevenue + row.rentalRevenue,
      totalIn: totals.totalIn + row.totalIn,
      expenses: totals.expenses + row.expenses,
      net: totals.net + row.net,
    }),
    {
      month: "Period total",
      clientsOnboarded: 0,
      clientRevenue: 0,
      rentalRevenue: 0,
      totalIn: 0,
      expenses: 0,
      net: 0,
    },
  );
}

export function buildRevenueByMonth(clients: Client[], rentals: Rental[], monthCount = 6): RevenueMonthPoint[] {
  return lastMonthKeys(monthCount).map((key) => {
    const clientRevenue = clients
      .filter((client) => monthKey(clientCreatedAt(client)) === key)
      .reduce((sum, client) => sum + client.paidAmount, 0);
    const rentalRevenue = rentals
      .filter((rental) => monthKey(rental.startDate) === key)
      .reduce((sum, rental) => sum + rental.paidAmount, 0);

    return {
      key,
      label: formatMonthLabel(key),
      clientRevenue,
      rentalRevenue,
      value: clientRevenue + rentalRevenue,
    };
  });
}

export function buildClientsOnboardedByMonth(clients: Client[], monthCount = 6): ChartMonthPoint[] {
  return lastMonthKeys(monthCount).map((key) => ({
    key,
    label: formatMonthLabel(key),
    value: clients.filter((client) => monthKey(clientCreatedAt(client)) === key).length,
  }));
}
