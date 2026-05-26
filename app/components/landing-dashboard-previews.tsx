"use client";

import { useMemo, type ReactNode } from "react";
import { AdminRevenueChart } from "./admin-dashboard";
import { AnalyticsCharts } from "./analytics-charts";
import { InventoryCard, RentalCard, StaffCard } from "./ledger-cards";
import { ProjectCard } from "./project-card";
import { money } from "../lib/format";
import { seed } from "../lib/seed";
import type { MercuryProductId } from "../lib/mercury-landing-content";
import type { Stats, Store } from "../lib/types";
import { EmptyState, Panel, PanelHead } from "./ui";

const noop = () => {};

function useLandingStats(store: Store): Stats {
  return useMemo(() => {
    const clientRevenue = store.clients.reduce((sum, item) => sum + item.paidAmount, 0);
    const clientDue = store.clients.reduce((sum, item) => sum + item.packageAmount - item.paidAmount, 0);
    const rentalRevenue = store.rentals.reduce((sum, item) => sum + item.paidAmount, 0);
    const rentalDue = store.rentals.reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
    const expenses = store.expenses.reduce((sum, item) => sum + item.amount, 0);
    const payrollDue = store.staff
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.monthlySalary - item.advance - item.deduction, 0);
    return {
      activeProjects: store.clients.filter((item) => item.status !== "Delivered").length,
      activeRentals: store.rentals.filter((item) => item.status !== "Returned").length,
      availableItems: store.inventory.filter((item) => item.status === "Available").length,
      clientRevenue,
      clientDue,
      rentalRevenue,
      rentalDue,
      expenses,
      payrollDue,
      netCash: clientRevenue + rentalRevenue - expenses,
    };
  }, [store]);
}

function PreviewFrame({
  active,
  children,
  label,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className={`m-products__panel${active ? " is-active" : ""}`}
      aria-hidden={!active}
      role="tabpanel"
      aria-label={label}
    >
      <div className="m-dashboard-preview">
        <div className="m-dashboard-preview__chrome" aria-hidden>
          <span className="m-dashboard-preview__dot" />
          <span className="m-dashboard-preview__dot" />
          <span className="m-dashboard-preview__dot" />
          <span className="m-dashboard-preview__title">WedStudio OS</span>
        </div>
        <div className="m-dashboard-preview__inner">{children}</div>
      </div>
    </div>
  );
}

function ClientsPreview({ active }: { active: boolean }) {
  const clients = seed.clients.filter((c) => c.status !== "Delivered").slice(0, 2);

  return (
    <PreviewFrame active={active} label="Clients and projects preview">
      <Panel className="admin-panel m-dashboard-preview__panel">
        <PanelHead
          title="Upcoming work"
          description={`${seed.clients.length} projects in the workspace`}
        />
        {clients.length === 0 ? (
          <EmptyState>No active projects.</EmptyState>
        ) : (
          <div className="project-list">
            {clients.map((client) => (
              <ProjectCard key={client.id} compact client={client} />
            ))}
          </div>
        )}
      </Panel>
    </PreviewFrame>
  );
}

function PayrollPreview({ active }: { active: boolean }) {
  const staff = seed.staff.slice(0, 2);

  return (
    <PreviewFrame active={active} label="Payroll preview">
      <Panel className="admin-panel m-dashboard-preview__panel">
        <PanelHead title="Payroll" description="Monthly salary, advances, and deductions" />
        <div className="record-list">
          {staff.map((person) => (
            <StaffCard
              key={person.id}
              person={person}
              onMarkPaid={noop}
              onRemove={noop}
            />
          ))}
        </div>
      </Panel>
    </PreviewFrame>
  );
}

function GearPreview({ active }: { active: boolean }) {
  const items = seed.inventory.slice(0, 2);
  const rental = seed.rentals[0];
  const itemName =
    seed.inventory.find((item) => item.id === rental?.itemId)?.name || "Sony FX3";

  return (
    <PreviewFrame active={active} label="Gear and rentals preview">
      <div className="m-dashboard-preview__stack">
        <Panel className="admin-panel m-dashboard-preview__panel">
          <PanelHead title="Gear inventory" description="Availability tied to rentals" />
          <div className="record-list">
            {items.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onSetAvailable={noop}
                onSetMaintenance={noop}
                onRemove={noop}
              />
            ))}
          </div>
        </Panel>
        {rental ? (
          <Panel className="admin-panel m-dashboard-preview__panel">
            <PanelHead title="Rentals out" description="Gear currently with clients" />
            <div className="record-list">
              <RentalCard
                rental={rental}
                itemName={itemName}
                onMarkOut={noop}
                onMarkReturned={noop}
                onRemove={noop}
              />
            </div>
          </Panel>
        ) : null}
      </div>
    </PreviewFrame>
  );
}

function ReportsPreview({ active }: { active: boolean }) {
  const stats = useLandingStats(seed);
  const reportRows = [
    ["Client payments", money(stats.clientRevenue)],
    ["Client balance due", money(stats.clientDue)],
    ["Rental payments", money(stats.rentalRevenue)],
    ["Net cash", money(stats.netCash)],
  ] as const;

  return (
    <PreviewFrame active={active} label="Reports preview">
      <div className="m-dashboard-preview__stack">
        <section className="admin-metrics m-dashboard-preview__metrics" aria-label="Key metrics">
          <article className="admin-metric">
            <span className="admin-metric__label">Active projects</span>
            <strong className="admin-metric__value">{stats.activeProjects}</strong>
          </article>
          <article className="admin-metric">
            <span className="admin-metric__label">Client balance due</span>
            <strong className="admin-metric__value">{money(stats.clientDue)}</strong>
          </article>
          <article className="admin-metric admin-metric--accent">
            <span className="admin-metric__label">Net cash recorded</span>
            <strong className="admin-metric__value">{money(stats.netCash)}</strong>
          </article>
        </section>
        <AdminRevenueChart store={seed} />
        <section className="admin-charts-detail m-dashboard-preview__charts">
          <AnalyticsCharts store={seed} />
        </section>
        <Panel className="admin-panel m-dashboard-preview__panel">
          <PanelHead title="Financial snapshot" description="Recorded totals in your selected currency." />
          <div className="report-grid">
            {reportRows.map((row) => (
              <div className="report-cell" key={row[0]}>
                <span>{row[0]}</span>
                <strong>{row[1]}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PreviewFrame>
  );
}

export function LandingDashboardPreview({
  moduleId,
  active,
}: {
  moduleId: MercuryProductId;
  active: boolean;
}) {
  switch (moduleId) {
    case "clients":
      return <ClientsPreview active={active} />;
    case "payroll":
      return <PayrollPreview active={active} />;
    case "gear":
      return <GearPreview active={active} />;
    case "reports":
      return <ReportsPreview active={active} />;
    default:
      return null;
  }
}
