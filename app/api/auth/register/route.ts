import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/server/auth";
import { setSessionCookie } from "@/lib/server/session";
import type { RegisterAs } from "@/app/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registerAs = (body.registerAs === "manager" ? "manager" : "owner") as RegisterAs;

    const result = await registerAccount({
      registerAs,
      email: String(body.email || ""),
      password: String(body.password || ""),
      name: String(body.name || ""),
      studioName: String(body.studioName || ""),
      phone: String(body.phone || ""),
      location: String(body.location || ""),
      tagline: String(body.tagline || ""),
      ownerEmail: String(body.ownerEmail || ""),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    setSessionCookie({
      email: result.account.email,
      workspaceId: result.account.workspaceId,
      role: result.account.role,
    });

    return NextResponse.json({ account: result.account, store: result.store });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed. Check DATABASE_URL and run db:push." }, { status: 500 });
  }
}
