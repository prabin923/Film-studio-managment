"use client";

import { FormEvent, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { money, newId, statusTone } from "../lib/format";
import { today } from "../lib/seed";
import type {
  Account,
  Bill,
  BillLine,
  BillSourceType,
  BillStatus,
  Client,
  InventoryItem,
  Rental,
} from "../lib/types";
import { StudioBrandMark } from "./studio-brand";
import { Badge, EmptyState, Field, Panel, PanelHead } from "./ui";

export type NewBillPayload = Omit<Bill, "id" | "createdBy">;

type DraftLine = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const blankLine = (): DraftLine => ({
  id: newId("bill-line"),
  description: "",
  quantity: "1",
  unitPrice: "",
});

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function toPaisa(value: string) {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

function fromPaisa(value: number) {
  return value > 0 ? String(Math.round(value / 100)) : "";
}

function nextBillNumber(bills: Array<Pick<Bill, "number">>) {
  const year = new Date().getFullYear();
  const prefix = `BILL-${year}-`;
  const sequence = bills.reduce((highest, bill) => {
    if (!bill.number.startsWith(prefix)) return highest;
    const value = Number(bill.number.slice(prefix.length));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}${String(sequence + 1).padStart(4, "0")}`;
}

function calculateBill(lines: DraftLine[], discountValue: string, taxRateValue: string) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Math.round((Number(line.quantity) || 0) * toPaisa(line.unitPrice)),
    0,
  );
  const discount = Math.min(subtotal, toPaisa(discountValue));
  const taxRate = Math.max(0, Number(taxRateValue) || 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100));
  return { subtotal, discount, taxRate, taxAmount, total: taxableAmount + taxAmount };
}

function formatBillDate(date: string, locale: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale || "en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function displayedStatus(bill: Bill) {
  if (bill.status !== "Paid" && bill.status !== "Draft" && bill.dueDate < today) return "Overdue";
  return bill.status;
}

export function Billing({
  account,
  bills,
  clients,
  rentals,
  inventory,
  addBill,
  updateBillStatus,
  deleteBill,
}: {
  account: Account;
  bills: Bill[];
  clients: Client[];
  rentals: Rental[];
  inventory: InventoryItem[];
  addBill: (payload: NewBillPayload) => void;
  updateBillStatus: (billId: string, status: BillStatus) => void;
  deleteBill: (billId: string, label: string) => void;
}) {
  const [number, setNumber] = useState(() => nextBillNumber(bills));
  const [source, setSource] = useState("custom:");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(addDays(today, 14));
  const [status, setStatus] = useState<BillStatus>("Unpaid");
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment is due by the date shown above. Thank you for your business.");
  const [lines, setLines] = useState<DraftLine[]>([blankLine()]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all" | "Overdue">("all");
  const [preview, setPreview] = useState<Bill | null>(null);

  const calculation = useMemo(() => calculateBill(lines, discount, taxRate), [lines, discount, taxRate]);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...bills]
      .filter((bill) => {
        if (statusFilter !== "all" && displayedStatus(bill) !== statusFilter) return false;
        if (!query) return true;
        return (
          bill.number.toLowerCase().includes(query) ||
          bill.customerName.toLowerCase().includes(query) ||
          bill.customerPhone.includes(query)
        );
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.number.localeCompare(a.number));
  }, [bills, search, statusFilter]);

  const totals = useMemo(
    () => ({
      issued: bills.filter((bill) => bill.status !== "Draft").reduce((sum, bill) => sum + bill.total, 0),
      collected: bills.reduce((sum, bill) => sum + bill.paidAmount, 0),
      outstanding: bills
        .filter((bill) => bill.status !== "Draft")
        .reduce((sum, bill) => sum + Math.max(0, bill.total - bill.paidAmount), 0),
    }),
    [bills],
  );

  const updateLine = (id: string, patch: Partial<DraftLine>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const chooseSource = (value: string) => {
    setSource(value);
    const separator = value.indexOf(":");
    const type = value.slice(0, separator) as BillSourceType;
    const id = value.slice(separator + 1);

    if (type === "client") {
      const client = clients.find((item) => item.id === id);
      if (!client) return;
      setCustomerName(client.name);
      setCustomerPhone(client.phone);
      setCustomerAddress(client.location);
      setLines([
        {
          id: newId("bill-line"),
          description: client.projectType,
          quantity: "1",
          unitPrice: fromPaisa(client.packageAmount),
        },
      ]);
      setPaidAmount(fromPaisa(client.paidAmount));
      setStatus(client.paidAmount >= client.packageAmount ? "Paid" : "Unpaid");
      setNotes(client.notes);
      return;
    }

    if (type === "rental") {
      const rental = rentals.find((item) => item.id === id);
      if (!rental) return;
      const itemName = inventory.find((item) => item.id === rental.itemId)?.name || "Equipment rental";
      setCustomerName(rental.renter);
      setCustomerPhone(rental.phone);
      setCustomerAddress("");
      setLines([
        {
          id: newId("bill-line"),
          description: `${itemName} rental · ${rental.startDate} to ${rental.endDate}`,
          quantity: "1",
          unitPrice: fromPaisa(rental.amount),
        },
      ]);
      setPaidAmount(fromPaisa(rental.paidAmount));
      setStatus(rental.paidAmount >= rental.amount ? "Paid" : "Unpaid");
      setNotes(rental.deposit > 0 ? `Security deposit received: ${money(rental.deposit)}.` : "");
      return;
    }

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setPaidAmount("");
    setStatus("Unpaid");
    setNotes("");
    setLines([blankLine()]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validLines = lines.filter(
      (line) => line.description.trim() && Number(line.quantity) > 0 && Number(line.unitPrice) >= 0,
    );
    if (!validLines.length) return;

    const totalsForSave = calculateBill(validLines, discount, taxRate);
    const requestedPaid =
      status === "Draft" ? 0 : status === "Paid" ? totalsForSave.total : Math.min(toPaisa(paidAmount), totalsForSave.total);
    const resolvedStatus: BillStatus =
      status !== "Draft" && totalsForSave.total > 0 && requestedPaid >= totalsForSave.total ? "Paid" : status;
    const separator = source.indexOf(":");
    const sourceType = source.slice(0, separator) as BillSourceType;
    const sourceId = source.slice(separator + 1);
    const lineItems: BillLine[] = validLines.map((line) => ({
      id: line.id,
      description: line.description.trim(),
      quantity: Number(line.quantity),
      unitPrice: toPaisa(line.unitPrice),
    }));

    addBill({
      number: number.trim(),
      sourceType,
      sourceId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      issueDate,
      dueDate,
      status: resolvedStatus,
      lineItems,
      ...totalsForSave,
      paidAmount: requestedPaid,
      notes: notes.trim(),
      terms: terms.trim(),
    });

    setNumber(nextBillNumber([...bills, { number }]));
    setSource("custom:");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setIssueDate(today);
    setDueDate(addDays(today, 14));
    setStatus("Unpaid");
    setPaidAmount("");
    setDiscount("");
    setTaxRate("");
    setNotes("");
    setLines([blankLine()]);
  };

  return (
    <>
      <section className="bill-metrics" aria-label="Billing totals">
        <article className="bill-metric">
          <span>Total issued</span>
          <strong>{money(totals.issued)}</strong>
        </article>
        <article className="bill-metric">
          <span>Collected</span>
          <strong>{money(totals.collected)}</strong>
        </article>
        <article className="bill-metric bill-metric--due">
          <span>Outstanding</span>
          <strong>{money(totals.outstanding)}</strong>
        </article>
      </section>

      <div className="billing-layout">
        <Panel>
          <PanelHead
            title="Bill register"
            description="Saved bills are shared with everyone in this workspace."
            action={<span className="panel-head__meta">{filteredBills.length} shown</span>}
          />
          <div className="list-toolbar">
            <input
              className="list-toolbar__search"
              type="search"
              placeholder="Search bill, customer, phone…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search bills"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              aria-label="Filter bills by status"
            >
              <option value="all">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {bills.length === 0 ? (
            <EmptyState>Create your first bill using the form on the right.</EmptyState>
          ) : filteredBills.length === 0 ? (
            <EmptyState>No bills match your filters.</EmptyState>
          ) : (
            <div className="bill-list">
              {filteredBills.map((bill) => {
                const billStatus = displayedStatus(bill);
                const balance = Math.max(0, bill.total - bill.paidAmount);
                return (
                  <article className="bill-card" key={bill.id}>
                    <header className="bill-card__head">
                      <div>
                        <span className="bill-card__number">{bill.number}</span>
                        <h3>{bill.customerName}</h3>
                        <p>Issued {formatBillDate(bill.issueDate, account.locale)} · Due {formatBillDate(bill.dueDate, account.locale)}</p>
                      </div>
                      <Badge tone={statusTone(billStatus)}>{billStatus}</Badge>
                    </header>
                    <dl className="bill-card__totals">
                      <div>
                        <dt>Total</dt>
                        <dd>{money(bill.total)}</dd>
                      </div>
                      <div className={balance > 0 ? "is-due" : ""}>
                        <dt>Balance</dt>
                        <dd>{money(balance)}</dd>
                      </div>
                    </dl>
                    <footer className="bill-card__foot">
                      <div className="bill-card__status-control">
                        <label htmlFor={`bill-status-${bill.id}`}>Status</label>
                        <select
                          id={`bill-status-${bill.id}`}
                          className={`status-select status-select--${statusTone(bill.status)}`}
                          value={bill.status}
                          onChange={(event) => updateBillStatus(bill.id, event.target.value as BillStatus)}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                      <div className="bill-card__actions">
                        <button className="btn btn--ghost" type="button" onClick={() => setPreview(bill)}>
                          Preview
                        </button>
                        <button
                          className="text-btn text-btn--danger"
                          type="button"
                          onClick={() => deleteBill(bill.id, bill.number)}
                        >
                          Remove
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </Panel>

        <form className="form-panel bill-form" onSubmit={handleSubmit}>
          <header className="bill-form__head">
            <div>
              <h2>Generate a bill</h2>
              <p>Start from a project, rental, or blank bill.</p>
            </div>
          </header>

          <div className="form-grid">
            <Field label="Start from" span={2}>
              <select value={source} onChange={(event) => chooseSource(event.target.value)}>
                <option value="custom:">Blank bill</option>
                {clients.length ? <optgroup label="Projects">
                  {clients.map((client) => (
                    <option key={client.id} value={`client:${client.id}`}>
                      {client.name} — {client.projectType}
                    </option>
                  ))}
                </optgroup> : null}
                {rentals.length ? <optgroup label="Rentals">
                  {rentals.map((rental) => (
                    <option key={rental.id} value={`rental:${rental.id}`}>
                      {rental.renter} — {inventory.find((item) => item.id === rental.itemId)?.name || "Gear"}
                    </option>
                  ))}
                </optgroup> : null}
              </select>
            </Field>
            <Field label="Bill number">
              <input value={number} onChange={(event) => setNumber(event.target.value)} required />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(event) => setStatus(event.target.value as BillStatus)}>
                <option value="Draft">Draft</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </Field>
            <Field label="Customer name" span={2}>
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
            </Field>
            <Field label="Phone">
              <input type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
            </Field>
            <Field label="Address">
              <input value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} />
            </Field>
            <Field label="Issue date">
              <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required />
            </Field>
            <Field label="Due date">
              <input type="date" min={issueDate} value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </Field>
          </div>

          <section className="bill-lines">
            <div className="bill-lines__head">
              <h3>Line items</h3>
              <button className="text-btn" type="button" onClick={() => setLines((current) => [...current, blankLine()])}>
                + Add item
              </button>
            </div>
            <div className="bill-lines__list">
              {lines.map((line, index) => (
                <div className="bill-line" key={line.id}>
                  <div className="bill-line__label">
                    <span>Item {index + 1}</span>
                    {lines.length > 1 ? (
                      <button
                        className="text-btn text-btn--danger"
                        type="button"
                        onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <input
                    aria-label={`Item ${index + 1} description`}
                    placeholder="Description"
                    value={line.description}
                    onChange={(event) => updateLine(line.id, { description: event.target.value })}
                    required
                  />
                  <div className="bill-line__values">
                    <label>
                      <span>Qty</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={line.quantity}
                        onChange={(event) => updateLine(line.id, { quantity: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Unit price ({account.currency})</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(event) => updateLine(line.id, { unitPrice: event.target.value })}
                        required
                      />
                    </label>
                    <div className="bill-line__amount">
                      <span>Amount</span>
                      <strong>{money(Math.round((Number(line.quantity) || 0) * toPaisa(line.unitPrice)))}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="form-grid">
            <Field label={`Discount (${account.currency})`}>
              <input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} />
            </Field>
            <Field label="Tax rate (%)">
              <input type="number" min="0" step="0.01" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} />
            </Field>
            {status !== "Paid" ? (
              <Field label={`Already paid (${account.currency})`} span={2}>
                <input type="number" min="0" step="0.01" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} />
              </Field>
            ) : null}
            <Field label="Notes" span={2}>
              <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            <Field label="Payment terms" span={2}>
              <textarea rows={2} value={terms} onChange={(event) => setTerms(event.target.value)} />
            </Field>
          </div>

          <div className="bill-form__summary" aria-live="polite">
            <div><span>Subtotal</span><strong>{money(calculation.subtotal)}</strong></div>
            {calculation.discount > 0 ? <div><span>Discount</span><strong>− {money(calculation.discount)}</strong></div> : null}
            {calculation.taxAmount > 0 ? <div><span>Tax ({calculation.taxRate}%)</span><strong>{money(calculation.taxAmount)}</strong></div> : null}
            <div className="bill-form__total"><span>Total</span><strong>{money(calculation.total)}</strong></div>
          </div>

          <button className="btn btn--primary" type="submit">Generate bill</button>
        </form>
      </div>

      {preview ? <BillPreview account={account} bill={preview} onClose={() => setPreview(null)} /> : null}
    </>
  );
}

function BillPreview({ account, bill, onClose }: { account: Account; bill: Bill; onClose: () => void }) {
  const balance = Math.max(0, bill.total - bill.paidAmount);
  const billStatus = displayedStatus(bill);
  const printBill = () => {
    const previousTitle = document.title;
    document.title = `${bill.number}-${bill.customerName.replace(/[^a-z0-9]+/gi, "-")}`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 500);
  };

  return createPortal(
    <div className="bill-preview-backdrop" role="presentation" onClick={onClose}>
      <section
        className="bill-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bill-preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bill-preview-actions">
          <div>
            <strong id="bill-preview-title">Bill preview</strong>
            <span>Choose “Save as PDF” in the print dialog to download.</span>
          </div>
          <div>
            <button className="btn btn--secondary" type="button" onClick={onClose}>Close</button>
            <button className="btn btn--primary" type="button" onClick={printBill}>Print / save PDF</button>
          </div>
        </header>

        <article className="bill-paper" style={{ "--bill-accent": account.brandColor } as CSSProperties}>
          <header className="bill-paper__head">
            <div className="bill-paper__studio">
              <StudioBrandMark studioName={account.studioName} branding={account} className="bill-brand-mark" />
              <div>
                <h1>{account.studioName}</h1>
                {account.tagline ? <p>{account.tagline}</p> : null}
              </div>
            </div>
            <div className="bill-paper__title">
              <span>BILL</span>
              <strong>{bill.number}</strong>
            </div>
          </header>

          <div className="bill-paper__meta-grid">
            <section>
              <span className="bill-paper__eyebrow">Bill from</span>
              {account.location ? <p>{account.location}</p> : null}
              {account.phone ? <p>{account.phone}</p> : null}
              <p>{account.email}</p>
            </section>
            <section>
              <span className="bill-paper__eyebrow">Bill to</span>
              <strong>{bill.customerName}</strong>
              {bill.customerAddress ? <p>{bill.customerAddress}</p> : null}
              {bill.customerPhone ? <p>{bill.customerPhone}</p> : null}
            </section>
            <section className="bill-paper__dates">
              <div><span>Issue date</span><strong>{formatBillDate(bill.issueDate, account.locale)}</strong></div>
              <div><span>Due date</span><strong>{formatBillDate(bill.dueDate, account.locale)}</strong></div>
              <div><span>Status</span><strong className={`bill-paper__status bill-paper__status--${billStatus.toLowerCase()}`}>{billStatus}</strong></div>
            </section>
          </div>

          <div className="bill-paper__table-wrap">
            <table className="bill-paper__table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {bill.lineItems.map((line) => (
                  <tr key={line.id}>
                    <td>{line.description}</td>
                    <td>{line.quantity}</td>
                    <td>{money(line.unitPrice)}</td>
                    <td>{money(Math.round(line.quantity * line.unitPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bill-paper__closing">
            <div className="bill-paper__notes">
              {bill.notes ? <section><span className="bill-paper__eyebrow">Notes</span><p>{bill.notes}</p></section> : null}
              {bill.terms ? <section><span className="bill-paper__eyebrow">Payment terms</span><p>{bill.terms}</p></section> : null}
            </div>
            <dl className="bill-paper__totals">
              <div><dt>Subtotal</dt><dd>{money(bill.subtotal)}</dd></div>
              {bill.discount > 0 ? <div><dt>Discount</dt><dd>− {money(bill.discount)}</dd></div> : null}
              {bill.taxAmount > 0 ? <div><dt>Tax ({bill.taxRate}%)</dt><dd>{money(bill.taxAmount)}</dd></div> : null}
              <div className="bill-paper__grand-total"><dt>Total</dt><dd>{money(bill.total)}</dd></div>
              {bill.paidAmount > 0 ? <div><dt>Paid</dt><dd>− {money(bill.paidAmount)}</dd></div> : null}
              <div className="bill-paper__balance"><dt>Balance due</dt><dd>{money(balance)}</dd></div>
            </dl>
          </div>

          <footer className="bill-paper__footer">
            <span>Generated by {account.studioName}</span>
            <span>{bill.number}</span>
          </footer>
        </article>
      </section>
    </div>,
    document.body,
  );
}
