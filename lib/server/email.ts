import { Resend } from "resend";

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(`[email] RESEND_API_KEY/RESEND_FROM_EMAIL not set — logging email instead of sending to ${to}: ${html}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: "Reset your WedStudio OS password",
    html: `<p>Someone requested a password reset for this email.</p><p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}

export async function sendManagerInviteEmail(to: string, setupUrl: string, studioName: string) {
  await sendEmail({
    to,
    subject: `You've been invited to join ${studioName} on WedStudio OS`,
    html: `<p>You've been invited to join <strong>${studioName}</strong> as a manager on WedStudio OS.</p><p><a href="${setupUrl}">Click here to set your password and get started</a>. This link expires in 7 days.</p><p>If you weren't expecting this, you can ignore this email.</p>`,
  });
}
