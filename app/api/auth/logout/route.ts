import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { clearSessionCookie } from "@/lib/server/session";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
