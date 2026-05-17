import { cookies } from "next/headers";

export const SESSION_COOKIE = "wedstudio_session";

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

export function setSessionCookie(payload: SessionPayload) {
  cookies().set(SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
