import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/session";
import { accountFromWorkspaceRow } from "@/lib/server/store";

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
    return NextResponse.json({ error: "Failed to load manager." }, { status: 500 });
  }
}
