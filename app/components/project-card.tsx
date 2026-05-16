import { Badge, PaymentSelect, StatusSelect } from "./ui";
import { money, statusTone } from "../lib/format";
import type { Client, ProjectPaymentStatus, ProjectStatus } from "../lib/types";

type ProjectCardProps = {
  client: Client;
  compact?: boolean;
  onRemove?: () => void;
  onStatusChange?: (status: ProjectStatus) => void;
  onPaymentStatusChange?: (status: ProjectPaymentStatus) => void;
};

export function ProjectCard({
  client,
  compact = false,
  onRemove,
  onStatusChange,
  onPaymentStatusChange,
}: ProjectCardProps) {
  const balanceDue = client.packageAmount - client.paidAmount;

  return (
    <article className={compact ? "project-card project-card--compact" : "project-card"}>
      <header className="project-card__head">
        <div>
          <h3>{client.name}</h3>
          <p>
            {client.phone}
            {` · ${client.projectType}`}
          </p>
        </div>
        <div className="project-card__status">
          {onStatusChange ? (
            <StatusSelect value={client.status} onChange={onStatusChange} />
          ) : (
            <Badge tone={statusTone(client.status)}>{client.status}</Badge>
          )}
          {onPaymentStatusChange ? (
            <PaymentSelect value={client.paymentStatus} onChange={onPaymentStatusChange} />
          ) : (
            <Badge tone={statusTone(client.paymentStatus)}>{client.paymentStatus}</Badge>
          )}
        </div>
      </header>

      <dl className="project-card__stats">
        <div>
          <dt>Event</dt>
          <dd>{client.eventDate}</dd>
        </div>
        <div>
          <dt>Package</dt>
          <dd>{money(client.packageAmount)}</dd>
        </div>
        <div>
          <dt>Paid</dt>
          <dd>{money(client.paidAmount)}</dd>
        </div>
        <div className={balanceDue > 0 ? "is-due" : undefined}>
          <dt>Balance</dt>
          <dd>{money(balanceDue)}</dd>
        </div>
      </dl>

      {!compact && (client.assignedStaff || client.location) ? (
        <p className="project-card__meta">
          {[client.assignedStaff || "Unassigned", client.location].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      {!compact && client.notes ? <p className="project-card__notes">{client.notes}</p> : null}

      {onRemove ? (
        <footer className="project-card__foot">
          <button className="text-btn text-btn--danger" type="button" onClick={onRemove} aria-label={`Remove ${client.name}`}>
            Remove project
          </button>
        </footer>
      ) : null}
    </article>
  );
}
