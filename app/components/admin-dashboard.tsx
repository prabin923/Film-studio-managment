"use client";

import { useMemo } from "react";
import { buildRevenueByMonth } from "../lib/chart-data";
import { isEventSoon, sortClientsByEventDate } from "../lib/dashboard-utils";
import { money, statusTone } from "../lib/format";
import type { ProjectPaymentStatus, ProjectStatus, Role, Stats, Store, View } from "../lib/types";
import { AnalyticsCharts } from "./analytics-charts";
import { Badge, EmptyState, Panel, PanelHead } from "./ui";
import { ProjectCard } from "./project-card";

const PREVIEW_BAR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6", "#3b82f6"] as const;

export function AdminRevenueChart({ store }: { store: Store }) {
  const points = useMemo(() => buildRevenueByMonth(store.clients, store.rentals), [store.clients, store.rentals]);
  const peak = Math.max(...points.map((p) => p.value), 1);
  const hasData = points.some((p) => p.value > 0);

  return (
    <section className="admin-chart-panel" aria-label="Revenue overview">
      <header className="admin-chart-panel__head">
        <div>
          <h2>Revenue overview</h2>
          <p>Client and rental payments — last 6 months</p>
        </div>
      </header>
      {!hasData ? (
        <p className="admin-chart-panel__empty">No revenue recorded in this period yet.</p>
      ) : (
        <div className="admin-chart-panel__bars" role="img" aria-label="Monthly revenue bars">
          {points.map((point, index) => {
            const heightPct = point.value > 0 ? Math.max((point.value / peak) * 100, 8) : 4;
            return (
              <div key={point.key} className="admin-chart-panel__col">
                <div
                  className="admin-chart-panel__bar"
                  style={{
                    height: `${heightPct}%`,
                    background: PREVIEW_BAR_COLORS[index % PREVIEW_BAR_COLORS.length],
                  }}
                  title={`${point.label}: ${money(point.value)}`}
                />
                <span className="admin-chart-panel__label">{point.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function AdminDashboardHome({
  stats,
  store,
  role,
  setView,
  updateClientStatus,
  updateClientPaymentStatus,
}: {
  stats: Stats;
  store: Store;
  role: Role;
  setView: (view: View) => void;
  updateClientStatus: (clientId: string, status: ProjectStatus) => void;
  updateClientPaymentStatus: (clientId: string, status: ProjectPaymentStatus) => void;
}) {
  const activeRentals = store.rentals.filter((rental) => rental.status !== "Returned");
  const activeClients = sortClientsByEventDate(store.clients.filter((c) => c.status !== "Delivered"));
  const shootsSoon = store.clients.filter(
    (c) => c.status !== "Delivered" && isEventSoon(c.eventDate),
  ).length;

  return (
    <div className="admin-home">
      <section className="admin-metrics" aria-label="Key metrics">
        <article className="admin-metric">
          <span className="admin-metric__label">Active projects</span>
          <strong className="admin-metric__value">{stats.activeProjects}</strong>
          {shootsSoon > 0 ? (
            <span className="admin-metric__hint">{shootsSoon} shoot{shootsSoon === 1 ? "" : "s"} in 14 days</span>
          ) : null}
        </article>
        <article className="admin-metric">
          <span className="admin-metric__label">Client balance due</span>
          <strong className="admin-metric__value">{money(stats.clientDue)}</strong>
        </article>
        <article className="admin-metric admin-metric--accent">
          <span className="admin-metric__label">{role === "owner" ? "Net cash recorded" : "Gear available"}</span>
          <strong className="admin-metric__value">
            {role === "owner" ? money(stats.netCash) : String(stats.availableItems)}
          </strong>
        </article>
      </section>

      {role === "owner" ? (
        <>
          <AdminRevenueChart store={store} />
          <section className="admin-charts-detail">
            <AnalyticsCharts store={store} />
          </section>
        </>
      ) : null}

      <section className="admin-panels">
        <Panel className="admin-panel">
          <PanelHead
            title="Upcoming work"
            description={`${activeClients.length} projects in progress`}
            action={
              <button className="btn btn--ghost" type="button" onClick={() => setView("clients")}>
                View all
              </button>
            }
          />
          {activeClients.length === 0 ? (
            <EmptyState>No active projects.</EmptyState>
          ) : (
            <div className="project-list">
              {activeClients.slice(0, 4).map((client) => (
                <ProjectCard
                  compact
                  key={client.id}
                  client={client}
                  onStatusChange={(status) => updateClientStatus(client.id, status)}
                  onPaymentStatusChange={(status) => updateClientPaymentStatus(client.id, status)}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel className="admin-panel">
          <PanelHead
            title="Rentals out"
            description="Gear currently with clients"
            action={
              <button className="btn btn--ghost" type="button" onClick={() => setView("rentals")}>
                View all
              </button>
            }
          />
          {activeRentals.length === 0 ? (
            <EmptyState>No active rentals.</EmptyState>
          ) : (
            <div className="simple-list">
              {activeRentals.slice(0, 5).map((rental) => (
                <div className="simple-list__item" key={rental.id}>
                  <strong>{store.inventory.find((item) => item.id === rental.itemId)?.name || "Unknown item"}</strong>
                  <span>
                    {rental.renter} · {rental.startDate} – {rental.endDate}
                  </span>
                  <div className="row">
                    <Badge tone={statusTone(rental.status)}>{rental.status}</Badge>
                    <Badge tone="neutral">Due {money(rental.amount - rental.paidAmount)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
