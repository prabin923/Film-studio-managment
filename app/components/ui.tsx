import type { FormEvent, ReactNode } from "react";
import type { StatusTone } from "../lib/format";
import { statusTone } from "../lib/format";
import {
  PROJECT_PAYMENT_STATUSES,
  PROJECT_STATUSES,
  type ProjectPaymentStatus,
  type ProjectStatus,
} from "../lib/types";

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  const classes = className ? `badge badge--${tone} ${className}` : `badge badge--${tone}`;
  return <span className={classes}>{children}</span>;
}

export function StatusSelect({
  value,
  onChange,
  label = "Project status",
}: {
  value: ProjectStatus;
  onChange: (status: ProjectStatus) => void;
  label?: string;
}) {
  return (
    <select
      className={`status-select status-select--${statusTone(value)}`}
      value={value}
      onChange={(event) => onChange(event.target.value as ProjectStatus)}
      aria-label={label}
    >
      {PROJECT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

export function PaymentSelect({
  value,
  onChange,
  label = "Payment status",
}: {
  value: ProjectPaymentStatus;
  onChange: (status: ProjectPaymentStatus) => void;
  label?: string;
}) {
  return (
    <select
      className={`status-select status-select--${statusTone(value)}`}
      value={value}
      onChange={(event) => onChange(event.target.value as ProjectPaymentStatus)}
      aria-label={label}
    >
      {PROJECT_PAYMENT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={className ? `panel ${className}` : "panel"}>{children}</section>;
}

export function PanelHead({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="panel-head">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-tile">
      <span className="metric-tile__label">{label}</span>
      <strong className="metric-tile__value">{value}</strong>
    </article>
  );
}

export function SplitLayout({ main, aside, className }: { main: ReactNode; aside: ReactNode; className?: string }) {
  return (
    <div className={className ? `split-layout ${className}` : "split-layout"}>
      {main}
      {aside}
    </div>
  );
}

export function FormPanel({
  title,
  onSubmit,
  children,
  className,
  submitLabel = "Save",
}: {
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
}) {
  return (
    <form className={className ? `form-panel ${className}` : "form-panel"} onSubmit={onSubmit}>
      <h2 className="form-panel__title">{title}</h2>
      <div className="form-grid">{children}</div>
      <div className="form-panel__actions">
        <button className="btn btn--primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function Field({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: ReactNode;
  span?: 1 | 2;
}) {
  return (
    <label className={span === 2 ? "field field--wide" : "field"}>
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p className="page-header__desc">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const href = `tel:${trimmed.replace(/\s/g, "")}`;
  return (
    <a className={className ? `phone-link ${className}` : "phone-link"} href={href}>
      {trimmed}
    </a>
  );
}

export function TextButton({
  children,
  onClick,
  label,
  variant = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      className={variant === "danger" ? "text-btn text-btn--danger" : "text-btn"}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}
