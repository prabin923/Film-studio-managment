import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { newId } from "@/app/lib/format";
import { hashPassword } from "./password";

export const TOKEN_TTL_MS = 60 * 60 * 1000;
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string, ttlMs: number = TOKEN_TTL_MS): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await prisma.account.findUnique({ where: { email: normalizedEmail } });
  if (!account) return null;

  const token = randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      id: newId("reset"),
      accountId: account.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });

  return token;
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
  }

  await prisma.$transaction([
    prisma.account.update({
      where: { id: record.accountId },
      data: { passwordHash: hashPassword(newPassword) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { accountId: record.accountId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
