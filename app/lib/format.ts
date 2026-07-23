let currentCurrency = "NPR";
let currentLocale = "en-NP";

export function setGlobalCurrency(currency: string, locale: string) {
  currentCurrency = currency || "NPR";
  currentLocale = locale || "en-NP";
}

export function getGlobalCurrency() {
  return currentCurrency;
}

export function money(paisa: number) {
  return new Intl.NumberFormat(currentLocale, {
    style: "currency",
    currency: currentCurrency,
    maximumFractionDigits: 0,
  }).format(Math.round(paisa / 100));
}

export function toPaisa(value: FormDataEntryValue | null) {
  return Math.round(Number(value || 0) * 100);
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type StatusTone = "neutral" | "positive" | "caution" | "negative";

export function statusTone(status: string): StatusTone {
  if (["Paid", "Available", "Returned", "Delivered", "Booked"].includes(status)) return "positive";
  if (["Unpaid", "Pending", "Maintenance", "Out", "Editing", "Inquiry"].includes(status)) return "caution";
  if (["Overdue", "Void"].includes(status)) return "negative";
  if (status === "Rented") return "negative";
  return "neutral";
}
