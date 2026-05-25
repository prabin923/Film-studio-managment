"use client";

import { AdminRevenueChart } from "./admin-dashboard";
import { InventoryCard, RentalCard, StaffCard } from "./ledger-cards";
import { ProjectCard } from "./project-card";
import { seed } from "../lib/seed";
import type { MercuryShowcaseId } from "../lib/mercury-landing-content";
import { Panel, PanelHead } from "./ui";

const noop = () => {};

export function LandingShowcasePreview({
  id,
  active,
}: {
  id: MercuryShowcaseId;
  active: boolean;
}) {
  const rental = seed.rentals[0];
  const itemName =
    seed.inventory.find((item) => item.id === rental?.itemId)?.name || "Sony FX3";

  return (
    <div
      className={`m-showcase-preview${active ? " is-active" : ""}`}
      aria-hidden={!active}
      role="tabpanel"
    >
      {id === "book" ? (
        <div className="m-showcase-preview__body">
          <Panel className="admin-panel m-showcase-preview__panel">
            <PanelHead title="Upcoming work" description="New booking — deposit tracked" />
            <div className="project-list">
              <ProjectCard compact client={seed.clients[0]} />
            </div>
          </Panel>
        </div>
      ) : null}

      {id === "payroll" ? (
        <div className="m-showcase-preview__body">
          <Panel className="admin-panel m-showcase-preview__panel">
            <PanelHead title="Payroll" description="Pending vs paid this month" />
            <div className="record-list">
              <StaffCard person={seed.staff[1]} onMarkPaid={noop} onRemove={noop} />
            </div>
          </Panel>
        </div>
      ) : null}

      {id === "rent" ? (
        <div className="m-showcase-preview__body">
          <Panel className="admin-panel m-showcase-preview__panel">
            <PanelHead title="Rentals out" description="Gear status updates on return" />
            <div className="record-list">
              {rental ? (
                <RentalCard
                  rental={rental}
                  itemName={itemName}
                  onMarkOut={noop}
                  onMarkReturned={noop}
                  onRemove={noop}
                />
              ) : null}
              <InventoryCard
                item={seed.inventory[0]}
                onSetAvailable={noop}
                onSetMaintenance={noop}
                onRemove={noop}
              />
            </div>
          </Panel>
        </div>
      ) : null}

      {id === "report" ? (
        <div className="m-showcase-preview__body m-showcase-preview__body--charts">
          <AdminRevenueChart store={seed} />
        </div>
      ) : null}
    </div>
  );
}
