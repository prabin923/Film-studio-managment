import nodemailer from "nodemailer";
import { Resend } from "resend";

type EmailArgs = { to: string; subject: string; html: string };

// Delivery strategy, in priority order:
// 1. Gmail SMTP — set GMAIL_USER + GMAIL_APP_PASSWORD (a 16-char Google App
//    Password, requires 2FA on the account). Sends from your Gmail to ANY
//    recipient, no domain verification needed.
// 2. Resend — set RESEND_API_KEY + RESEND_FROM_EMAIL (from a verified domain).
// 3. Neither set — log the email instead of sending (local dev fallback).
async function sendEmail({ to, subject, html }: EmailArgs) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        // App passwords are shown with spaces (e.g. "abcd efgh ijkl mnop");
        // strip them so either format works.
        pass: gmailPassword.replace(/\s+/g, ""),
      },
    });
    await transporter.sendMail({ from: gmailUser, to, subject, html });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (apiKey && from) {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, html });
    return;
  }

  console.warn(
    `[email] No email provider configured (set GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY/RESEND_FROM_EMAIL) — logging email instead of sending to ${to}: ${html}`,
  );
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
