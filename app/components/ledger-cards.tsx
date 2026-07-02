import { Badge, PhoneLink } from "./ui";
import { money, statusTone } from "../lib/format";
import type { Expense, InventoryItem, Rental, Staff } from "../lib/types";

function RecordMetrics({
  items,
  columns = 4,
}: {
  items: { label: string; value: string; highlight?: boolean }[];
  columns?: 2 | 4;
}) {
  return (
    <dl className={columns === 2 ? "record-card__metrics record-card__metrics--2" : "record-card__metrics"}>
      {items.map((item) => (
        <div key={item.label} className={item.highlight ? "is-highlight" : undefined}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StaffCard({
  person,
  onMarkPaid,
  onEdit,
  onRemove,
}: {
  person: Staff;
  onMarkPaid: () => void;
  onEdit?: () => void;
  onRemove: () => void;
}) {
  const netDue = person.monthlySalary - person.advance - person.deduction;

  return (
    <article className="record-card">
      <header className="record-card__head">
        <div>
          <h3 className="record-card__title">{person.name}</h3>
          <p className="record-card__subtitle">{person.role}</p>
        </div>
        <Badge tone={statusTone(person.status)}>{person.status}</Badge>
      </header>
      <RecordMetrics
        items={[
          { label: "Salary", value: money(person.monthlySalary) },
          { label: "Advance", value: money(person.advance) },
          { label: "Deduction", value: money(person.deduction) },
          { label: "Net due", value: money(netDue), highlight: netDue > 0 && person.status === "Pending" },
        ]}
      />
      {person.createdBy ? <p className="record-card__meta">Added by {person.createdBy}</p> : null}
      <footer className="record-card__foot">
        <div className="record-card__actions">
          {person.status !== "Paid" ? (
            <button className="btn btn--primary" type="button" onClick={onMarkPaid}>
              Mark paid
            </button>
          ) : null}
          {onEdit ? (
            <button className="text-btn" type="button" onClick={onEdit}>
              Edit
            </button>
          ) : null}
          <button className="text-btn text-btn--danger" type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </footer>
    </article>
  );
}

export function ExpenseCard({
  expense,
  onEdit,
  onRemove,
}: {
  expense: Expense;
  onEdit?: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="record-card record-card--compact">
      <header className="record-card__head">
        <div>
          <h3 className="record-card__title">{expense.vendor}</h3>
          <p className="record-card__subtitle">
            {expense.category} · {expense.date}
          </p>
        </div>
        <span className="record-card__amount">{money(expense.amount)}</span>
      </header>
      {expense.notes ? <p className="record-card__note">{expense.notes}</p> : null}
      {expense.createdBy ? <p className="record-card__meta">Added by {expense.createdBy}</p> : null}
      <footer className="record-card__foot record-card__foot--split">
        {onEdit ? (
          <button className="text-btn" type="button" onClick={onEdit}>
            Edit
          </button>
        ) : null}
        <button className="text-btn text-btn--danger" type="button" onClick={onRemove}>
          Remove
        </button>
      </footer>
    </article>
  );
}

export function InventoryCard({
  item,
  onSetAvailable,
  onSetMaintenance,
  onEdit,
  onRemove,
}: {
  item: InventoryItem;
  onSetAvailable: () => void;
  onSetMaintenance: () => void;
  onEdit?: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="record-card">
      <header className="record-card__head">
        <div>
          <h3 className="record-card__title">{item.name}</h3>
          <p className="record-card__subtitle">
            {item.category}
            {item.serial ? ` · ${item.serial}` : ""}
          </p>
        </div>
        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
      </header>
      <RecordMetrics
        columns={2}
        items={[
          { label: "Condition", value: item.condition },
          { label: "Day rate", value: money(item.dayRate) },
        ]}
      />
      {item.createdBy ? <p className="record-card__meta">Added by {item.createdBy}</p> : null}
      <footer className="record-card__foot">
        <div className="record-card__actions">
          {item.status !== "Available" ? (
            <button className="btn btn--ghost" type="button" onClick={onSetAvailable}>
              Mark available
            </button>
          ) : null}
          {item.status !== "Maintenance" ? (
            <button className="btn btn--ghost" type="button" onClick={onSetMaintenance}>
              Maintenance
            </button>
          ) : null}
          {onEdit ? (
            <button className="text-btn" type="button" onClick={onEdit}>
              Edit
            </button>
          ) : null}
          <button className="text-btn text-btn--danger" type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </footer>
    </article>
  );
}

export function RentalCard({
  rental,
  itemName,
  onMarkOut,
  onMarkReturned,
  onRemove,
}: {
  rental: Rental;
  itemName: string;
  onMarkOut: () => void;
  onMarkReturned: () => void;
  onRemove: () => void;
}) {
  const balanceDue = rental.amount - rental.paidAmount;

  return (
    <article className="record-card">
      <header className="record-card__head">
        <div>
          <h3 className="record-card__title">{rental.renter}</h3>
          <p className="record-card__subtitle">
            <PhoneLink phone={rental.phone} /> · {itemName}
          </p>
        </div>
        <Badge tone={statusTone(rental.status)}>{rental.status}</Badge>
      </header>
      <RecordMetrics
        items={[
          { label: "Dates", value: `${rental.startDate} – ${rental.endDate}` },
          { label: "Deposit", value: money(rental.deposit) },
          { label: "Rent", value: money(rental.amount) },
          { label: "Balance", value: money(balanceDue), highlight: balanceDue > 0 },
        ]}
      />
      {rental.createdBy ? <p className="record-card__meta">Added by {rental.createdBy}</p> : null}
      <footer className="record-card__foot">
        <div className="record-card__actions">
          {rental.status === "Reserved" ? (
            <button className="btn btn--primary" type="button" onClick={onMarkOut}>
              Mark out
            </button>
          ) : null}
          {rental.status !== "Returned" ? (
            <button className="btn btn--ghost" type="button" onClick={onMarkReturned}>
              Mark returned
            </button>
          ) : null}
          <button className="text-btn text-btn--danger" type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </footer>
    </article>
  );
}
