import type { Account, RegisterAs, Store } from "./types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(String((data as { error?: string }).error || "Request failed."));
  }
  return data as T;
}

export async function apiLogin(email: string, password: string) {
  return parseJson<{ account: Account; store: Store }>(
    await fetch("/api/auth/login", {
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
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function apiLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function apiMe() {
  return parseJson<{ account: Account; store: Store }>(await fetch("/api/auth/me", { cache: "no-store" }));
}

export async function apiSaveStore(store: Store) {
  return parseJson<{ ok: boolean }>(
    await fetch("/api/store", {
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
}) {
  return parseJson<{ account: Account }>(
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function apiGetWorkspaceTeam() {
  return parseJson<{ manager: Account | null; owner: Account | null }>(
    await fetch("/api/workspace/manager", { cache: "no-store" }),
  );
}
