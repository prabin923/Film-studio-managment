import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { loginWithPassword } from "@/lib/server/auth";
import { databaseErrorMessage } from "@/lib/server/db-error";
import { applySessionCookie } from "@/lib/server/session";
import { checkRateLimit, requestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const ip = requestIp(request);
    const ipOk = await checkRateLimit(`login:ip:${ip}`, { max: 20, windowMs: 15 * 60 * 1000 });
    if (!ipOk) {
      return NextResponse.json({ error: "Too many login attempts. Try again in a few minutes." }, { status: 429 });
    }

    const emailOk = await checkRateLimit(`login:email:${email}`, { max: 8, windowMs: 15 * 60 * 1000 });
    if (!emailOk) {
      return NextResponse.json(
        { error: "Too many attempts for this account. Try again later or reset your password." },
        { status: 429 },
      );
    }

    const result = await loginWithPassword(email, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ account: result.account, store: result.store });
    applySessionCookie(response, {
      email: result.account.email,
      workspaceId: result.account.workspaceId,
      role: result.account.role,
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}
