import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { loadStore, saveStore } from "@/lib/server/store";
import type { Store } from "@/app/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const store = await loadStore(session.workspaceId);
    return NextResponse.json({ store });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load store." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const store = (await request.json()) as Store;
    await saveStore(session.workspaceId, store);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save store." }, { status: 500 });
  }
}
