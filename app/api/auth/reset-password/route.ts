import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { resetPassword } from "@/lib/server/password-reset";
import { databaseErrorMessage } from "@/lib/server/db-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!token) {
      return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
    }

    const result = await resetPassword(token, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}
