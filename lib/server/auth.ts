import { prisma } from "@/lib/prisma";
import { newId } from "@/app/lib/format";
import type { Account, RegisterAs, Store } from "@/app/lib/types";
import { hashPassword, verifyPassword } from "./password";
import { accountFromWorkspaceRow, loadStore } from "./store";

export type AuthResult =
  | { ok: true; account: Account; store: Store }
  | { ok: false; error: string };

export type ManagerInviteResult =
  | { ok: true; manager: Account }
  | { ok: false; error: string };

async function createManagerForWorkspace(input: {
  workspaceId: string;
  email: string;
  password: string;
  name: string;
}): Promise<ManagerInviteResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "Enter the manager's full name." };
  }

  if (!email) {
    return { ok: false, error: "Enter the manager's email." };
  }

  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "This email is already registered. Use a different email." };
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: input.workspaceId } });
  if (!workspace) {
    return { ok: false, error: "Workspace not found." };
  }

  const managerExists = await prisma.account.findFirst({
    where: { workspaceId: input.workspaceId, role: "manager" },
  });

  if (managerExists) {
    return {
      ok: false,
      error: "This studio already has a manager. Remove them first or use their login.",
    };
  }

  await prisma.account.create({
    data: {
      id: newId("account"),
      workspaceId: input.workspaceId,
      email,
      passwordHash: hashPassword(input.password),
      name,
      role: "manager",
    },
  });

  const manager = accountFromWorkspaceRow(workspace, { name, email, role: "manager" });
  return { ok: true, manager };
}

export async function createManagerByOwner(
  ownerWorkspaceId: string,
  input: { email: string; password: string; name: string },
): Promise<ManagerInviteResult> {
  return createManagerForWorkspace({
    workspaceId: ownerWorkspaceId,
    email: input.email,
    password: input.password,
    name: input.name,
  });
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const row = await prisma.account.findUnique({
    where: { email: normalizedEmail },
    include: { workspace: true },
  });

  if (!row) {
    return { ok: false, error: "No account found for this email. Sign up first." };
  }

  if (!row.passwordHash) {
    return { ok: false, error: "This account signs in with Google. Use \"Continue with Google\" below." };
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

    const invited = await createManagerForWorkspace({
      workspaceId: owner.workspaceId,
      email,
      password: input.password,
      name: input.name,
    });

    if (!invited.ok) {
      return { ok: false, error: invited.error };
    }

    const store = await loadStore(owner.workspaceId);
    return { ok: true, account: invited.manager, store };
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

  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
  const account = accountFromWorkspaceRow(workspace, {
    name: input.name,
    email,
    role: "owner",
  });
  const store = await loadStore(workspaceId);

  return { ok: true, account, store };
}

export async function loginOrRegisterWithGoogle(profile: {
  googleId: string;
  email: string;
  name: string;
}): Promise<AuthResult> {
  const email = profile.email.trim().toLowerCase();

  const byGoogleId = await prisma.account.findUnique({
    where: { googleId: profile.googleId },
    include: { workspace: true },
  });

  if (byGoogleId) {
    const account = accountFromWorkspaceRow(byGoogleId.workspace, {
      name: byGoogleId.name,
      email: byGoogleId.email,
      role: byGoogleId.role as Account["role"],
    });
    const store = await loadStore(byGoogleId.workspaceId);
    return { ok: true, account, store };
  }

  const byEmail = await prisma.account.findUnique({ where: { email } });
  if (byEmail) {
    return {
      ok: false,
      error: "An account already exists for this email. Log in with your password instead.",
    };
  }

  const workspaceId = newId("workspace");
  const accountId = newId("account");
  const name = profile.name.trim() || email;

  await prisma.workspace.create({
    data: {
      id: workspaceId,
      studioName: "Your Wedding Film Studio",
      ownerEmail: email,
    },
  });

  await prisma.account.create({
    data: {
      id: accountId,
      workspaceId,
      email,
      googleId: profile.googleId,
      name,
      role: "owner",
    },
  });

  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
  const account = accountFromWorkspaceRow(workspace, { name, email, role: "owner" });
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
  profile: {
    studioName: string;
    phone: string;
    location: string;
    tagline: string;
    currency?: string;
    locale?: string;
  },
) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: profile,
  });
}

export async function updateWorkspaceBranding(
  workspaceId: string,
  branding: {
    logoData: string;
    brandColor: string;
    brandTextColor: string;
    brandShape: string;
  },
) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: branding,
  });
}
