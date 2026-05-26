"use client";

import { FormEvent, useMemo, useState } from "react";
import { Field, FormPanel } from "./ui";
import { money, getGlobalCurrency } from "../lib/format";
import type { InventoryItem } from "../lib/types";
import { today } from "../lib/seed";

export type RentalLineInput = {
  itemId: string;
  amount: number;
};

export type NewRentalPayload = {
  renter: string;
  phone: string;
  startDate: string;
  endDate: string;
  deposit: number;
  paidAmount: number;
  lines: RentalLineInput[];
};

type LineState = {
  key: string;
  itemId: string;
  amount: string;
};

function rentalDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

function suggestRent(item: InventoryItem | undefined, startDate: string, endDate: string) {
  if (!item) return "";
  const days = rentalDays(startDate, endDate);
  return String(Math.round((item.dayRate * days) / 100));
}

let lineKey = 0;
function newLine(): LineState {
  lineKey += 1;
  return { key: `line-${lineKey}`, itemId: "", amount: "" };
}

export function RentalForm({
  inventory,
  onSubmit,
}: {
  inventory: InventoryItem[];
  onSubmit: (payload: NewRentalPayload) => void;
}) {
  const currency = getGlobalCurrency();
  const rentableItems = useMemo(() => inventory.filter((item) => item.status === "Available"), [inventory]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [lines, setLines] = useState<LineState[]>([newLine()]);

  const itemsById = useMemo(() => new Map(inventory.map((item) => [item.id, item])), [inventory]);

  const usedItemIds = useMemo(() => new Set(lines.map((line) => line.itemId).filter(Boolean)), [lines]);

  const lineTotal = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [lines],
  );

  function updateLine(key: string, patch: Partial<LineState>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function handleItemChange(key: string, itemId: string) {
    const item = itemsById.get(itemId);
    setLines((current) =>
      current.map((line) => {
        if (line.key !== key) return line;
        return {
          ...line,
          itemId,
          amount: line.amount || suggestRent(item, startDate, endDate),
        };
      }),
    );
  }

  function addLine() {
    setLines((current) => [...current, newLine()]);
  }

  function removeLine(key: string) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.key !== key)));
  }

  function refreshSuggestedAmounts() {
    setLines((current) =>
      current.map((line) => {
        if (!line.itemId || line.amount) return line;
        const item = itemsById.get(line.itemId);
        return { ...line, amount: suggestRent(item, startDate, endDate) };
      }),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload: NewRentalPayload = {
      renter: String(data.get("renter") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      startDate: String(data.get("startDate") || today),
      endDate: String(data.get("endDate") || today),
      deposit: Math.round(Number(data.get("deposit") || 0) * 100),
      paidAmount: Math.round(Number(data.get("paidAmount") || 0) * 100),
      lines: lines
        .filter((line) => line.itemId)
        .map((line) => ({
          itemId: line.itemId,
          amount: Math.round(Number(line.amount || 0) * 100),
        })),
    };

    if (!payload.renter || !payload.phone || payload.lines.length === 0) return;

    onSubmit(payload);
    form.reset();
    setStartDate(today);
    setEndDate(today);
    setLines([newLine()]);
  }

  return (
    <FormPanel
      title="New rental"
      onSubmit={handleSubmit}
      submitLabel={lines.filter((l) => l.itemId).length > 1 ? "Create rentals" : "Create rental"}
    >
      <Field label="Renter name">
        <input name="renter" required />
      </Field>
      <Field label="Phone">
        <input name="phone" required />
      </Field>
      <Field label="Start date">
        <input
          name="startDate"
          type="date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
            setTimeout(refreshSuggestedAmounts, 0);
          }}
          required
        />
      </Field>
      <Field label="End date">
        <input
          name="endDate"
          type="date"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value);
            setTimeout(refreshSuggestedAmounts, 0);
          }}
          required
        />
      </Field>

      <div className="rental-lines field--wide">
        <div className="rental-lines__head">
          <span className="field__label">Gear items</span>
          {lineTotal > 0 ? <span className="rental-lines__total">Rent total · {currency} {lineTotal.toLocaleString()}</span> : null}
        </div>

        {rentableItems.length === 0 ? (
          <p className="rental-lines__empty">No available gear to rent right now.</p>
        ) : (
          <div className="rental-lines__list">
            {lines.map((line, index) => {
              const options = rentableItems.filter(
                (item) => item.id === line.itemId || !usedItemIds.has(item.id),
              );

              return (
                <div className="rental-line" key={line.key}>
                  <div className="rental-line__top">
                    <span className="rental-line__index">Item {index + 1}</span>
                    {lines.length > 1 ? (
                      <button className="text-btn text-btn--danger" type="button" onClick={() => removeLine(line.key)}>
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <label className="rental-line__field">
                    <span>Gear</span>
                    <select
                      value={line.itemId}
                      onChange={(event) => handleItemChange(line.key, event.target.value)}
                      required={index === 0}
                    >
                      <option value="">Select item</option>
                      {options.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} · {money(item.dayRate)}/day
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="rental-line__field">
                    <span>Rent ({currency})</span>
                    <input
                      min="0"
                      type="number"
                      value={line.amount}
                      onChange={(event) => updateLine(line.key, { amount: event.target.value })}
                      placeholder="Auto from day rate"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        )}

        <button className="btn btn--ghost rental-lines__add" type="button" onClick={addLine} disabled={rentableItems.length === 0}>
          + Add another item
        </button>
      </div>

      <Field label={`Deposit (${currency})`}>
        <input name="deposit" min="0" type="number" placeholder="Once per booking" />
      </Field>
      <Field label={`Paid (${currency})`}>
        <input name="paidAmount" min="0" type="number" placeholder="Split across items" />
      </Field>
    </FormPanel>
  );
}
