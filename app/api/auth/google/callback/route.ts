import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { loginOrRegisterWithGoogle } from "@/lib/server/auth";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/server/google-oauth";
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/server/google-session";
import { applySessionCookie } from "@/lib/server/session";

function failureRedirect(request: Request, reason?: string) {
  const url = new URL("/login?error=google", request.url);
  if (reason) url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = cookies().get(GOOGLE_STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    const response = failureRedirect(request);
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    return response;
  }

  try {
    const redirectUri = googleRedirectUri();
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!profile.email || !profile.email_verified) {
      const response = failureRedirect(request);
      response.cookies.delete(GOOGLE_STATE_COOKIE);
      return response;
    }

    const result = await loginOrRegisterWithGoogle({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || "",
    });

    if (!result.ok) {
      const response = failureRedirect(request, result.error);
      response.cookies.delete(GOOGLE_STATE_COOKIE);
      return response;
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    applySessionCookie(response, {
      email: result.account.email,
      workspaceId: result.account.workspaceId,
      role: result.account.role,
    });
    return response;
  } catch (error) {
    console.error(error);
    const response = failureRedirect(request);
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    return response;
  }
}
