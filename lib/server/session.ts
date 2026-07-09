import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "wedstudio_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type SessionPayload = {
  email: string;
  workspaceId: string;
  role: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionPayload;
    if (!parsed?.email || !parsed?.workspaceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

/** Prefer this in route handlers so Set-Cookie is on the returned response. */
export function applySessionCookie(response: NextResponse, payload: SessionPayload) {
  response.cookies.set(SESSION_COOKIE, JSON.stringify(payload), sessionCookieOptions());
  return response;
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
