import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getGoogleAuthUrl } from "@/lib/server/google-oauth";
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/server/google-session";

export async function GET(request: Request) {
  try {
    const state = randomBytes(16).toString("hex");
    const redirectUri = googleRedirectUri();

    const response = NextResponse.redirect(getGoogleAuthUrl(state, redirectUri));
    response.cookies.set(GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }
}
