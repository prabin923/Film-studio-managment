import { accountsRegistryKey } from "./seed";
import { DEFAULT_STUDIO_BRANDING, normalizeStudioBranding } from "./studio-branding";
import type { Account, Role, StoredAccount } from "./types";

export function normalizeRole(role: string): Role {
  if (role === "owner") return "owner";
  return "manager";
}

export function normalizeAccount(account: Partial<Account> & Pick<Account, "email">): Account {
  const branding = normalizeStudioBranding({
    logoData: account.logoData,
    brandColor: account.brandColor,
    brandTextColor: account.brandTextColor,
    brandShape: account.brandShape,
  });

  return {
    workspaceId: String(account.workspaceId || "").trim(),
    name: String(account.name || "").trim() || account.email.split("@")[0] || "Studio member",
    email: account.email.trim().toLowerCase(),
    studioName: String(account.studioName || "").trim() || "Your Wedding Film Studio",
    phone: String(account.phone || "").trim(),
    location: String(account.location || "").trim(),
    tagline: String(account.tagline || "").trim(),
    role: normalizeRole(account.role || "owner"),
    currency: String(account.currency || "NPR").trim(),
    locale: String(account.locale || "en-NP").trim(),
    ...branding,
  };
}

export function accountWithDefaultBranding(account: Account): Account {
  return normalizeAccount({
    ...account,
    logoData: account.logoData || DEFAULT_STUDIO_BRANDING.logoData,
    brandColor: account.brandColor || DEFAULT_STUDIO_BRANDING.brandColor,
    brandTextColor: account.brandTextColor || DEFAULT_STUDIO_BRANDING.brandTextColor,
    brandShape: account.brandShape || DEFAULT_STUDIO_BRANDING.brandShape,
  });
}

export function loadAccountsRegistry(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(accountsRegistryKey);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

export function getStoredAccount(email: string): StoredAccount | null {
  const key = email.trim().toLowerCase();
  if (!key) return null;
  const registry = loadAccountsRegistry();
  const stored = registry[key];
  if (!stored?.email) return null;
  return { ...normalizeAccount(stored), password: stored.password };
}

export function getOwnerAccount(workspaceId: string): StoredAccount | null {
  return (
    Object.values(loadAccountsRegistry()).find(
      (account) => account.workspaceId === workspaceId && account.role === "owner",
    ) ?? null
  );
}

export function saveAccountToRegistry(account: StoredAccount) {
  const normalized = normalizeAccount(account);
  const registry = loadAccountsRegistry();
  registry[normalized.email] = {
    ...normalized,
    password: account.password,
  };
  window.localStorage.setItem(accountsRegistryKey, JSON.stringify(registry));
}

const DEFAULT_STUDIO_NAME = "Your Wedding Film Studio";

export function isStudioProfileComplete(account: Pick<Account, "studioName" | "location" | "phone">) {
  const studioName = account.studioName.trim();
  if (!studioName || studioName === DEFAULT_STUDIO_NAME) return false;
  if (!account.location.trim()) return false;
  if (!account.phone.trim()) return false;
  return true;
}

export function studioInitials(studioName: string) {
  const parts = studioName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}
