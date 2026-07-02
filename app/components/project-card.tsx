import { isEventSoon } from "../lib/dashboard-utils";
import { money, statusTone } from "../lib/format";
import type { Client, ProjectPaymentStatus, ProjectStatus } from "../lib/types";
import { Badge, PaymentSelect, PhoneLink, StatusSelect } from "./ui";

type ProjectCardProps = {
  client: Client;
  compact?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: ProjectStatus) => void;
  onPaymentStatusChange?: (status: ProjectPaymentStatus) => void;
};

export function ProjectCard({
  client,
  compact = false,
  onRemove,
  onEdit,
  onStatusChange,
  onPaymentStatusChange,
}: ProjectCardProps) {
  const balanceDue = client.packageAmount - client.paidAmount;
  const eventSoon = isEventSoon(client.eventDate);

  return (
    <article className={compact ? "project-card project-card--compact" : "project-card"}>
      <header className="project-card__head">
        <div>
          <h3>
            {client.name}
            {eventSoon ? (
              <Badge tone="caution" className="project-card__soon">
                Soon
              </Badge>
            ) : null}
          </h3>
          <p>
            <PhoneLink phone={client.phone} />
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

      {!compact && (client.assignedStaff || client.location || client.createdBy) ? (
        <p className="project-card__meta">
          {[client.assignedStaff || "Unassigned", client.location, client.createdBy && `Added by ${client.createdBy}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}

      {!compact && client.notes ? <p className="project-card__notes">{client.notes}</p> : null}

      {onEdit || onRemove ? (
        <footer className="project-card__foot">
          {onEdit ? (
            <button className="text-btn" type="button" onClick={onEdit}>
              Edit
            </button>
          ) : null}
          {onRemove ? (
            <button className="text-btn text-btn--danger" type="button" onClick={onRemove} aria-label={`Remove ${client.name}`}>
              Remove
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
