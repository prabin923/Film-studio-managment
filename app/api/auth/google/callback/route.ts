import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { loginOrRegisterWithGoogle } from "@/lib/server/auth";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/server/google-oauth";
import { GOOGLE_JOIN_COOKIE, GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/server/google-session";
import { applySessionCookie } from "@/lib/server/session";

function failureRedirect(request: Request, reason?: string) {
  const url = new URL("/login?error=google", request.url);
  if (reason) url.searchParams.set("reason", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  response.cookies.delete(GOOGLE_JOIN_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = cookies().get(GOOGLE_STATE_COOKIE)?.value;
  const joinOwnerEmail = cookies().get(GOOGLE_JOIN_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return failureRedirect(request);
  }

  try {
    const redirectUri = googleRedirectUri();
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!profile.email || !profile.email_verified) {
      return failureRedirect(request);
    }

    const result = await loginOrRegisterWithGoogle({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || "",
      joinOwnerEmail,
    });

    if (!result.ok) {
      return failureRedirect(request, result.error);
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_JOIN_COOKIE);
    applySessionCookie(response, {
      email: result.account.email,
      workspaceId: result.account.workspaceId,
      role: result.account.role,
    });
    return response;
  } catch (error) {
    console.error(error);
    return failureRedirect(request);
  }
}
