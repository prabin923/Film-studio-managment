import { newId } from "./format";
import { accountsRegistryKey, seed, storageKey, workspaceStoreKey, workspacesRegistryKey } from "./seed";
import type { Account, Store, StoredAccount, Workspace } from "./types";
import { getStoredAccount, loadAccountsRegistry, normalizeAccount, saveAccountToRegistry } from "./accounts";
import { DEFAULT_STUDIO_BRANDING } from "./studio-branding";

export function loadWorkspacesRegistry(): Record<string, Workspace> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(workspacesRegistryKey);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Workspace>;
  } catch {
    return {};
  }
}

export function saveWorkspace(workspace: Workspace) {
  const registry = loadWorkspacesRegistry();
  registry[workspace.id] = workspace;
  window.localStorage.setItem(workspacesRegistryKey, JSON.stringify(registry));
}

export function getWorkspace(workspaceId: string): Workspace | null {
  return loadWorkspacesRegistry()[workspaceId] ?? null;
}

export function findWorkspaceByOwnerEmail(ownerEmail: string): Workspace | null {
  const email = ownerEmail.trim().toLowerCase();
  const workspaces = Object.values(loadWorkspacesRegistry());
  return workspaces.find((workspace) => workspace.ownerEmail === email) ?? null;
}

export function loadWorkspaceStore(workspaceId: string): Store | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(workspaceStoreKey(workspaceId));
    if (!raw) return null;
    return JSON.parse(raw) as Store;
  } catch {
    return null;
  }
}

export function saveWorkspaceStore(workspaceId: string, store: Store) {
  window.localStorage.setItem(workspaceStoreKey(workspaceId), JSON.stringify(store));
}

export function accountFromWorkspace(workspace: Workspace, account: Pick<Account, "name" | "email" | "role">): Account {
  return normalizeAccount({
    workspaceId: workspace.id,
    name: account.name,
    email: account.email,
    role: account.role,
    studioName: workspace.studioName,
    phone: workspace.phone,
    location: workspace.location,
    tagline: workspace.tagline,
    logoData: workspace.logoData,
    brandColor: workspace.brandColor,
    brandTextColor: workspace.brandTextColor,
    brandShape: workspace.brandShape,
    currency: workspace.currency,
    locale: workspace.locale,
  });
}

export function getWorkspaceMembers(workspaceId: string): StoredAccount[] {
  return Object.values(loadAccountsRegistry()).filter((account) => account.workspaceId === workspaceId);
}

export function getWorkspaceManager(workspaceId: string): StoredAccount | null {
  return getWorkspaceMembers(workspaceId).find((account) => account.role === "manager") ?? null;
}

export function createWorkspace(
  input: Pick<Workspace, "studioName" | "phone" | "location" | "tagline" | "ownerEmail"> &
    Partial<Pick<Workspace, "logoData" | "brandColor" | "brandTextColor" | "brandShape" | "currency" | "locale">>,
): Workspace {
  const workspace: Workspace = {
    id: newId("workspace"),
    ...DEFAULT_STUDIO_BRANDING,
    currency: "NPR",
    locale: "en-NP",
    ...input,
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
  };
  saveWorkspace(workspace);
  saveWorkspaceStore(workspace.id, seed);
  return workspace;
}

export function syncWorkspaceProfile(workspaceId: string, profile: Omit<Workspace, "id" | "ownerEmail">) {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) return;

  const updated: Workspace = {
    ...workspace,
    studioName: profile.studioName,
    phone: profile.phone,
    location: profile.location,
    tagline: profile.tagline,
    logoData: profile.logoData ?? workspace.logoData,
    brandColor: profile.brandColor ?? workspace.brandColor,
    brandTextColor: profile.brandTextColor ?? workspace.brandTextColor,
    brandShape: profile.brandShape ?? workspace.brandShape,
  };
  saveWorkspace(updated);

  const registry = loadAccountsRegistry();
  Object.values(registry).forEach((account) => {
    if (account.workspaceId !== workspaceId) return;
    registry[account.email] = {
      ...account,
      studioName: updated.studioName,
      phone: updated.phone,
      location: updated.location,
      tagline: updated.tagline,
    };
  });
  window.localStorage.setItem(accountsRegistryKey, JSON.stringify(registry));
}

export function ensureWorkspaceStore(workspaceId: string): Store {
  const existing = loadWorkspaceStore(workspaceId);
  if (existing) return existing;

  const legacyRaw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
  const store = legacyRaw ? (JSON.parse(legacyRaw) as Store) : seed;
  saveWorkspaceStore(workspaceId, store);
  if (legacyRaw) {
    window.localStorage.removeItem(storageKey);
  }
  return store;
}

export function repairStoredAccount(stored: StoredAccount): StoredAccount | null {
  if (!stored.password) return null;

  let workspaceId = stored.workspaceId;
  let workspace = workspaceId ? getWorkspace(workspaceId) : null;

  if (!workspace && stored.role === "owner") {
    workspace = findWorkspaceByOwnerEmail(stored.email);
    workspaceId = workspace?.id ?? "";
  }

  if (!workspace && stored.role === "manager" && workspaceId) {
    workspace = getWorkspace(workspaceId);
  }

  if (!workspace && stored.role === "manager") {
    const owner = Object.values(loadAccountsRegistry()).find(
      (member) => member.role === "owner" && member.studioName === stored.studioName,
    );
    if (owner?.workspaceId) {
      workspaceId = owner.workspaceId;
      workspace = getWorkspace(workspaceId);
    }
  }

  if (!workspace && stored.role === "owner") {
    workspace = createWorkspace({
      studioName: stored.studioName,
      phone: stored.phone,
      location: stored.location,
      tagline: stored.tagline,
      ownerEmail: stored.email,
    });
    workspaceId = workspace.id;
    const legacyRaw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (legacyRaw) {
      saveWorkspaceStore(workspace.id, JSON.parse(legacyRaw) as Store);
      window.localStorage.removeItem(storageKey);
    }
  }

  if (!workspace || !workspaceId) return null;

  ensureWorkspaceStore(workspaceId);

  const repaired: StoredAccount = {
    ...normalizeAccount({ ...stored, workspaceId }),
    password: stored.password,
  };
  saveAccountToRegistry(repaired);
  return repaired;
}

export function migrateRegistryAccounts() {
  if (typeof window === "undefined") return;

  const registry = loadAccountsRegistry();
  Object.values(registry).forEach((account) => {
    if (!account.password) return;
    if (!account.workspaceId || !getWorkspace(account.workspaceId) || !loadWorkspaceStore(account.workspaceId)) {
      repairStoredAccount(account);
    }
  });
}

export type LoginResult =
  | { ok: true; account: Account; store: Store }
  | { ok: false; error: string };

export function authenticateLogin(email: string, password: string): LoginResult {
  const normalizedEmail = email.trim().toLowerCase();
  let stored = getStoredAccount(normalizedEmail);

  if (!stored?.email) {
    return { ok: false, error: "No account found for this email. Sign up first." };
  }

  const repaired = repairStoredAccount(stored);
  if (repaired) {
    stored = repaired;
  }

  if (!stored.password) {
    return { ok: false, error: "This account has no password set. Sign up again to reset access." };
  }

  if (stored.password !== password) {
    return { ok: false, error: "Incorrect password. Try again." };
  }

  if (!stored.workspaceId) {
    return { ok: false, error: "Could not load your studio workspace. Contact the owner to re-register." };
  }

  const workspace = getWorkspace(stored.workspaceId);
  if (!workspace) {
    return { ok: false, error: "Studio workspace not found on this device." };
  }

  const store = ensureWorkspaceStore(stored.workspaceId);
  const account = normalizeAccount(stored);

  return { ok: true, account, store };
}

export function migrateLegacySession(): { account: Account | null; store: Store | null } {
  if (typeof window === "undefined") return { account: null, store: null };

  const legacyStoreRaw = window.localStorage.getItem(storageKey);
  const legacyAccountRaw = window.localStorage.getItem("wedstudio-os-account-v1");
  if (!legacyStoreRaw || !legacyAccountRaw) {
    return { account: null, store: null };
  }

  try {
    const parsedAccount = JSON.parse(legacyAccountRaw) as Account;
    if (parsedAccount.workspaceId) {
      return { account: null, store: null };
    }

    const normalized = normalizeAccount(parsedAccount);
    const store = JSON.parse(legacyStoreRaw) as Store;
    const workspace = createWorkspace({
      studioName: normalized.studioName,
      phone: normalized.phone,
      location: normalized.location,
      tagline: normalized.tagline,
      ownerEmail: normalized.email,
    });

    saveWorkspaceStore(workspace.id, store);
    window.localStorage.removeItem(storageKey);

    return {
      account: accountFromWorkspace(workspace, {
        name: normalized.name,
        email: normalized.email,
        role: normalized.role === "manager" ? "owner" : normalized.role,
      }),
      store,
    };
  } catch {
    return { account: null, store: null };
  }
}
