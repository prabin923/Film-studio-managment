import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createManagerByOwner, removeManager, renameManager } from "@/lib/server/auth";
import { databaseErrorMessage } from "@/lib/server/db-error";
import { accountFromWorkspaceRow } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { getAppUrl } from "@/lib/server/app-url";
import { sendManagerInviteEmail } from "@/lib/server/email";
import { INVITE_TTL_MS, requestPasswordReset } from "@/lib/server/password-reset";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const [managers, owner] = await Promise.all([
      prisma.account.findMany({
        where: { workspaceId: session.workspaceId, role: "manager" },
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.account.findFirst({
        where: { workspaceId: session.workspaceId, role: "owner" },
        include: { workspace: true },
      }),
    ]);

    return NextResponse.json({
      managers: managers.map((manager) =>
        accountFromWorkspaceRow(manager.workspace, {
          name: manager.name,
          email: manager.email,
          role: "manager",
        }),
      ),
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
    const email = String(body.email || "");
    const result = await createManagerByOwner(session.workspaceId, {
      name: String(body.name || ""),
      email,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // The manager account is already persisted. Sending the invite email is a
    // best-effort side-effect: if it fails (Resend outage, unverified domain,
    // bad RESEND_FROM_EMAIL, etc.) we must NOT fail the request, otherwise the
    // owner sees an error while the account exists and every retry hits the
    // "email already registered" check.
    try {
      const inviteToken = await requestPasswordReset(email, INVITE_TTL_MS);
      if (inviteToken) {
        const setupUrl = `${getAppUrl()}/reset-password?token=${inviteToken}`;
        await sendManagerInviteEmail(email, setupUrl, result.manager.studioName);
      }
    } catch (emailError) {
      console.error("Manager created but invite email failed to send:", emailError);
    }

    return NextResponse.json({ manager: result.manager });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (session.role !== "owner") {
      return NextResponse.json({ error: "Only the studio owner can edit a manager." }, { status: 403 });
    }

    const body = await request.json();
    const result = await renameManager(session.workspaceId, String(body.email || ""), String(body.name || ""));

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (session.role !== "owner") {
      return NextResponse.json({ error: "Only the studio owner can remove a manager." }, { status: 403 });
    }

    const body = await request.json();
    const result = await removeManager(session.workspaceId, String(body.email || ""));

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}
