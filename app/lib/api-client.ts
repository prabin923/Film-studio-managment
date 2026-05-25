import type { Account, RegisterAs, Store } from "./types";

const fetchOpts = { credentials: "include" as const, cache: "no-store" as const };

const API_TIMEOUT_MS = 12_000;

async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Check that the dev server is running.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}).`);
    }
    throw new Error("Invalid server response.");
  }

  if (!response.ok) {
    throw new Error(String((data as { error?: string })?.error || "Request failed."));
  }
  return data as T;
}

export async function apiLogin(email: string, password: string) {
  return parseJson<{ account: Account; store: Store }>(
    await apiFetch("/api/auth/login", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function apiRegister(payload: {
  registerAs: RegisterAs;
  email: string;
  password: string;
  name: string;
  studioName?: string;
  phone?: string;
  location?: string;
  tagline?: string;
  ownerEmail?: string;
}) {
  return parseJson<{ account: Account; store: Store }>(
    await apiFetch("/api/auth/register", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function apiLogout() {
  await apiFetch("/api/auth/logout", { ...fetchOpts, method: "POST" });
}

export async function apiMe() {
  return parseJson<{ account: Account; store: Store }>(await apiFetch("/api/auth/me", fetchOpts));
}

export async function apiSaveStore(store: Store) {
  return parseJson<{ ok: boolean }>(
    await apiFetch("/api/store", {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(store),
    }),
  );
}

export async function apiUpdateProfile(payload: {
  name: string;
  email: string;
  studioName: string;
  phone: string;
  location: string;
  tagline: string;
  branding?: {
    logoData: string;
    brandColor: string;
    brandTextColor: string;
    brandShape: string;
  };
}) {
  return parseJson<{ account: Account }>(
    await apiFetch("/api/profile", {
      ...fetchOpts,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function apiGetWorkspaceTeam() {
  return parseJson<{ manager: Account | null; owner: Account | null }>(
    await apiFetch("/api/workspace/manager", fetchOpts),
  );
}

export async function apiCreateManager(payload: { name: string; email: string; password: string }) {
  return parseJson<{ manager: Account }>(
    await apiFetch("/api/workspace/manager", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}
