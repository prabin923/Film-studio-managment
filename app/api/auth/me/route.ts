import { NextResponse } from "next/server";
import { getAccountByEmail } from "@/lib/server/auth";
import { getSession } from "@/lib/server/session";
import { loadStore } from "@/lib/server/store";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const account = await getAccountByEmail(session.email);
    if (!account || account.workspaceId !== session.workspaceId) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }

    const store = await loadStore(account.workspaceId);
    return NextResponse.json({ account, store });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load session." }, { status: 500 });
  }
}
