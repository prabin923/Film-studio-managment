import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { requestPasswordReset } from "@/lib/server/password-reset";
import { sendPasswordResetEmail } from "@/lib/server/email";
import { databaseErrorMessage } from "@/lib/server/db-error";
import { getAppUrl } from "@/lib/server/app-url";
import { checkRateLimit, requestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Enter your email." }, { status: 400 });
    }

    const ip = requestIp(request);
    const ipOk = await checkRateLimit(`reset:ip:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
    if (!ipOk) {
      return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
    }

    const token = await requestPasswordReset(email);
    if (token) {
      const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we've sent a password reset link.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}
