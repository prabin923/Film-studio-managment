import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createManagerByOwner } from "@/lib/server/auth";
import { databaseErrorMessage } from "@/lib/server/db-error";
import { accountFromWorkspaceRow } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const [manager, owner] = await Promise.all([
      prisma.account.findFirst({
        where: { workspaceId: session.workspaceId, role: "manager" },
        include: { workspace: true },
      }),
      prisma.account.findFirst({
        where: { workspaceId: session.workspaceId, role: "owner" },
        include: { workspace: true },
      }),
    ]);

    return NextResponse.json({
      manager: manager
        ? accountFromWorkspaceRow(manager.workspace, {
            name: manager.name,
            email: manager.email,
            role: "manager",
          })
        : null,
      owner: owner
        ? accountFromWorkspaceRow(owner.workspace, {
            name: owner.name,
            email: owner.email,
            role: "owner",
          })
        : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (session.role !== "owner") {
      return NextResponse.json({ error: "Only the studio owner can add a manager." }, { status: 403 });
    }

    const body = await request.json();
    const result = await createManagerByOwner(session.workspaceId, {
      name: String(body.name || ""),
      email: String(body.email || ""),
      password: String(body.password || ""),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ manager: result.manager });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}
