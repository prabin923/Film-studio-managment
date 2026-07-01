import { Resend } from "resend";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY/RESEND_FROM_EMAIL not set — logging reset link instead of emailing ${to}: ${resetUrl}`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to,
    subject: "Reset your WedStudio OS password",
    html: `<p>Someone requested a password reset for this email.</p><p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
