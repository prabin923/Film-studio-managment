import { nav, today } from "./seed";
import type { View } from "./types";

const VALID_VIEWS = new Set<View>([
  "dashboard",
  "clients",
  "expenses",
  "salary",
  "inventory",
  "rentals",
  "bills",
  "reports",
  "profile",
]);

export function isValidView(value: string | null): value is View {
  return value !== null && VALID_VIEWS.has(value as View);
}

export function parseViewFromSearch(search: string): View | null {
  const view = new URLSearchParams(search).get("view");
  return isValidView(view) ? view : null;
}

export function confirmRemove(label: string): boolean {
  return window.confirm(`Remove ${label}? This cannot be undone.`);
}

export function daysUntil(date: string, anchor = today): number {
  const ms = new Date(`${date}T12:00:00`).getTime() - new Date(`${anchor}T12:00:00`).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function isEventSoon(eventDate: string, withinDays = 14): boolean {
  const days = daysUntil(eventDate);
  return days >= 0 && days <= withinDays;
}

export function sortClientsByEventDate<T extends { eventDate: string }>(clients: T[]): T[] {
  return [...clients].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}

export function filterNavForRole(role: "owner" | "manager") {
  return nav.filter((item) => role === "owner" || !item.ownerOnly);
}
