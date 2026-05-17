import { prisma } from "@/lib/prisma";
import { newId } from "@/app/lib/format";
import { seed } from "@/app/lib/seed";
import type { Account, RegisterAs, Store } from "@/app/lib/types";
import { hashPassword, verifyPassword } from "./password";
import { accountFromWorkspaceRow, loadStore, saveStore } from "./store";

export type AuthResult =
  | { ok: true; account: Account; store: Store }
  | { ok: false; error: string };

export async function loginWithPassword(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const row = await prisma.account.findUnique({
    where: { email: normalizedEmail },
    include: { workspace: true },
  });

  if (!row) {
    return { ok: false, error: "No account found for this email. Sign up first." };
  }

  if (!verifyPassword(password, row.passwordHash)) {
    return { ok: false, error: "Incorrect password. Try again." };
  }

  const account = accountFromWorkspaceRow(row.workspace, {
    name: row.name,
    email: row.email,
    role: row.role as Account["role"],
  });
  const store = await loadStore(row.workspaceId);

  return { ok: true, account, store };
}

export async function registerAccount(input: {
  registerAs: RegisterAs;
  email: string;
  password: string;
  name: string;
  studioName?: string;
  phone?: string;
  location?: string;
  tagline?: string;
  ownerEmail?: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "This email is already registered. Sign in instead." };
  }

  const passwordHash = hashPassword(input.password);

  if (input.registerAs === "manager") {
    const ownerEmail = input.ownerEmail?.trim().toLowerCase();
    if (!ownerEmail) {
      return { ok: false, error: "Enter the studio owner email." };
    }

    const owner = await prisma.account.findFirst({
      where: { email: ownerEmail, role: "owner" },
      include: { workspace: true },
    });

    if (!owner) {
      return { ok: false, error: "No owner workspace found for that email. Register the owner first." };
    }

    const managerExists = await prisma.account.findFirst({
      where: { workspaceId: owner.workspaceId, role: "manager" },
    });

    if (managerExists) {
      return { ok: false, error: "This studio already has a manager. Sign in with that manager email." };
    }

    const accountId = newId("account");
    await prisma.account.create({
      data: {
        id: accountId,
        workspaceId: owner.workspaceId,
        email,
        passwordHash,
        name: input.name,
        role: "manager",
      },
    });

    const account = accountFromWorkspaceRow(owner.workspace, {
      name: input.name,
      email,
      role: "manager",
    });
    const store = await loadStore(owner.workspaceId);
    return { ok: true, account, store };
  }

  const workspaceId = newId("workspace");
  const accountId = newId("account");

  await prisma.workspace.create({
    data: {
      id: workspaceId,
      studioName: input.studioName || "Your Wedding Film Studio",
      phone: input.phone || "",
      location: input.location || "",
      tagline: input.tagline || "",
      ownerEmail: email,
    },
  });

  await prisma.account.create({
    data: {
      id: accountId,
      workspaceId,
      email,
      passwordHash,
      name: input.name,
      role: "owner",
    },
  });

  await saveStore(workspaceId, seed);

  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
  const account = accountFromWorkspaceRow(workspace, {
    name: input.name,
    email,
    role: "owner",
  });
  const store = await loadStore(workspaceId);

  return { ok: true, account, store };
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  const row = await prisma.account.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { workspace: true },
  });
  if (!row) return null;
  return accountFromWorkspaceRow(row.workspace, {
    name: row.name,
    email: row.email,
    role: row.role as Account["role"],
  });
}

export async function updateWorkspaceProfile(
  workspaceId: string,
  profile: { studioName: string; phone: string; location: string; tagline: string },
) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: profile,
  });
}
