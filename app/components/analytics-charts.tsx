"use client";

import { useMemo } from "react";
import { buildClientsOnboardedByMonth, buildRevenueByMonth } from "../lib/chart-data";
import type { Store } from "../lib/types";
import { BarChart, RevenueBarChart } from "./charts";

export function AnalyticsCharts({ store }: { store: Store }) {
  const revenuePoints = useMemo(
    () => buildRevenueByMonth(store.clients, store.rentals),
    [store.clients, store.rentals],
  );
  const onboardedPoints = useMemo(() => buildClientsOnboardedByMonth(store.clients), [store.clients]);

  return (
    <section className="charts-grid">
      <RevenueBarChart
        title="Revenue generated"
        description="Client and rental payments recorded per month (last 6 months)."
        points={revenuePoints}
      />
      <BarChart
        title="Clients onboarded"
        description="New projects added per month (last 6 months)."
        points={onboardedPoints}
        formatValue={(value) => String(value)}
        emptyLabel="No new clients in this period yet."
      />
    </section>
  );
}
