import { NextResponse } from "next/server";
import { changePassword } from "@/lib/server/auth";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = body.currentPassword ? String(body.currentPassword) : undefined;
    const newPassword = String(body.newPassword || "");

    const result = await changePassword(session.email, currentPassword, newPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
