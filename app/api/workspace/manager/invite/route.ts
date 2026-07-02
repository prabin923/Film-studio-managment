import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseErrorMessage } from "@/lib/server/db-error";
import { getSession } from "@/lib/server/session";
import { getAppUrl } from "@/lib/server/app-url";
import { sendManagerInviteEmail } from "@/lib/server/email";
import { INVITE_TTL_MS, requestPasswordReset } from "@/lib/server/password-reset";

export const dynamic = "force-dynamic";

// Generate a fresh invite (set-password) link for an existing manager so the
// owner can share it directly — onboarding no longer depends on email delivery.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (session.role !== "owner") {
      return NextResponse.json({ error: "Only the studio owner can create invite links." }, { status: 403 });
    }

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    const manager = await prisma.account.findFirst({
      where: { email, workspaceId: session.workspaceId, role: "manager" },
      include: { workspace: true },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found for this studio." }, { status: 400 });
    }

    const inviteToken = await requestPasswordReset(email, INVITE_TTL_MS);
    if (!inviteToken) {
      return NextResponse.json({ error: "Could not generate an invite link." }, { status: 400 });
    }

    const inviteUrl = `${getAppUrl()}/reset-password?token=${inviteToken}`;

    // Re-send the email too, but never let a mail failure fail the request.
    try {
      await sendManagerInviteEmail(email, inviteUrl, manager.workspace.studioName);
    } catch (emailError) {
      console.error("Failed to send manager invite email", emailError);
    }

    return NextResponse.json({ inviteUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: databaseErrorMessage(error) }, { status: 500 });
  }
}
