import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/server/auth";
import { setSessionCookie } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const result = await loginWithPassword(email, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    setSessionCookie({
      email: result.account.email,
      workspaceId: result.account.workspaceId,
      role: result.account.role,
    });

    return NextResponse.json({ account: result.account, store: result.store });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed. Check DATABASE_URL and run db:push." }, { status: 500 });
  }
}
