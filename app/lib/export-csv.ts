import { buildMonthlyReports, sumMonthlyReportTotals } from "./chart-data";
import { money } from "./format";
import type { Store } from "./types";

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function downloadMonthlyReportCsv(store: Store, monthCount = 6) {
  const rows = buildMonthlyReports(store, monthCount);
  const totals = sumMonthlyReportTotals(rows);
  const header = ["Month", "Clients onboarded", "Client pay", "Rental pay", "Total in", "Expenses", "Net"];

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.month,
        row.clientsOnboarded,
        money(row.clientRevenue),
        money(row.rentalRevenue),
        money(row.totalIn),
        money(row.expenses),
        money(row.net),
      ]
        .map(escapeCsv)
        .join(","),
    ),
    [
      totals.month,
      totals.clientsOnboarded,
      money(totals.clientRevenue),
      money(totals.rentalRevenue),
      money(totals.totalIn),
      money(totals.expenses),
      money(totals.net),
    ]
      .map(escapeCsv)
      .join(","),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wedstudio-monthly-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
