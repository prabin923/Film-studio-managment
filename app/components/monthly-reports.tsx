"use client";

import { useMemo } from "react";
import { buildMonthlyReports, sumMonthlyReportTotals, type MonthlyReportRow } from "../lib/chart-data";
import { money } from "../lib/format";
import type { Store } from "../lib/types";
import { EmptyState, Panel, PanelHead } from "./ui";

function MonthlyReportTableRow({
  row,
  bold = false,
}: {
  row: Pick<
    MonthlyReportRow,
    "month" | "clientsOnboarded" | "clientRevenue" | "rentalRevenue" | "totalIn" | "expenses" | "net"
  >;
  bold?: boolean;
}) {
  const netClass = row.net >= 0 ? "is-positive" : "is-negative";

  return (
    <tr className={bold ? "monthly-report__row monthly-report__row--total" : "monthly-report__row"}>
      <th scope="row">{row.month}</th>
      <td>{row.clientsOnboarded}</td>
      <td>{money(row.clientRevenue)}</td>
      <td>{money(row.rentalRevenue)}</td>
      <td>{money(row.totalIn)}</td>
      <td>{money(row.expenses)}</td>
      <td className={netClass}>{money(row.net)}</td>
    </tr>
  );
}

export function MonthlyReports({ store, monthCount = 6 }: { store: Store; monthCount?: number }) {
  const rows = useMemo(() => buildMonthlyReports(store, monthCount), [store, monthCount]);
  const totals = useMemo(() => sumMonthlyReportTotals(rows), [rows]);
  const hasActivity = rows.some(
    (row) =>
      row.clientsOnboarded > 0 ||
      row.clientRevenue > 0 ||
      row.rentalRevenue > 0 ||
      row.expenses > 0,
  );

  return (
    <Panel>
      <PanelHead
        title="Month-wise reports"
        description={`Income, expenses, and client onboarding for the last ${monthCount} months.`}
      />
      {!hasActivity ? (
        <EmptyState>No monthly activity recorded in this period yet.</EmptyState>
      ) : (
        <div className="monthly-report-wrap">
          <table className="monthly-report">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Clients</th>
                <th scope="col">Client pay</th>
                <th scope="col">Rental pay</th>
                <th scope="col">Total in</th>
                <th scope="col">Expenses</th>
                <th scope="col">Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <MonthlyReportTableRow key={row.key} row={row} />
              ))}
            </tbody>
            <tfoot>
              <MonthlyReportTableRow row={totals} bold />
            </tfoot>
          </table>
        </div>
      )}
    </Panel>
  );
}
