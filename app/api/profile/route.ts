import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { normalizeStudioBranding, validateLogoData } from "@/app/lib/studio-branding";
import { getAccountByEmail, updateWorkspaceBranding, updateWorkspaceProfile } from "@/lib/server/auth";
import { getSession } from "@/lib/server/session";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body.name || "");
    const email = String(body.email || session.email).trim().toLowerCase();
    const studioName = String(body.studioName || "");
    const phone = String(body.phone || "");
    const location = String(body.location || "");
    const tagline = String(body.tagline || "");
    const currency = body.currency ? String(body.currency).trim() : undefined;
    const locale = body.locale ? String(body.locale).trim() : undefined;

    const current = await prisma.account.findUnique({ where: { email: session.email } });
    if (!current) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (email !== session.email) {
      const taken = await prisma.account.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
      }
    }

    await prisma.account.update({
      where: { id: current.id },
      data: { name, email },
    });

    if (current.role === "owner") {
      await updateWorkspaceProfile(session.workspaceId, {
        studioName,
        phone,
        location,
        tagline,
        currency,
        locale,
      });
    }

    if (body.branding !== undefined) {
      const branding = normalizeStudioBranding(body.branding);
      const logoError = validateLogoData(branding.logoData);
      if (logoError) {
        return NextResponse.json({ error: logoError }, { status: 400 });
      }
      await updateWorkspaceBranding(session.workspaceId, branding);
    }

    const account = await getAccountByEmail(email);
    if (!account) {
      return NextResponse.json({ error: "Failed to load updated profile." }, { status: 500 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
