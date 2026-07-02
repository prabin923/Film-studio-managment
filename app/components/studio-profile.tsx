"use client";

import { FormEvent, useState } from "react";
import type { Account } from "../lib/types";
import { Field, FormPanel } from "./ui";
import { StudioBrandMark } from "./studio-brand";
import { GoogleIcon } from "./google-icon";
import type { StudioBranding } from "../lib/types";

export function StudioProfileCard({
  account,
  compact = false,
}: {
  account: Pick<Account, "studioName" | "name" | "email" | "phone" | "location" | "tagline"> & StudioBranding;
  compact?: boolean;
}) {
  const meta = [account.location, account.phone].filter(Boolean).join(" · ");

  return (
    <article className={compact ? "studio-profile studio-profile--compact" : "studio-profile"}>
      <StudioBrandMark
        studioName={account.studioName}
        branding={account}
        className="studio-profile__avatar"
      />
      <div className="studio-profile__body">
        <p className="studio-profile__kicker">Studio profile</p>
        <h3>{account.studioName}</h3>
        {account.tagline ? <p className="studio-profile__tagline">{account.tagline}</p> : null}
        <p className="studio-profile__owner">
          {account.name}
          {account.email ? ` · ${account.email}` : ""}
        </p>
        {meta ? <p className="studio-profile__meta">{meta}</p> : null}
      </div>
    </article>
  );
}

export function RegisterRolePicker({
  value,
  onChange,
}: {
  value: "owner" | "manager";
  onChange: (value: "owner" | "manager") => void;
}) {
  return (
    <div className="register-role-picker" role="group" aria-label="Register as">
      <button
        className={value === "owner" ? "active" : ""}
        type="button"
        onClick={() => onChange("owner")}
      >
        Owner
      </button>
      <button
        className={value === "manager" ? "active" : ""}
        type="button"
        onClick={() => onChange("manager")}
      >
        Manager
      </button>
      <input name="registerAs" type="hidden" value={value} readOnly />
    </div>
  );
}

export function StudioProfileFields() {
  return (
    <div className="auth-form__fields">
      <p className="auth-form__legend">Studio</p>
      <Field label="Studio name">
        <input name="studioName" placeholder="EverAfter Films" required />
      </Field>
      <Field label="City">
        <input name="location" placeholder="Kathmandu" required />
      </Field>
      <Field label="Phone">
        <input name="phone" type="tel" placeholder="9800000000" required />
      </Field>
      <Field label="Tagline">
        <input name="tagline" placeholder="Optional" />
      </Field>

      <p className="auth-form__legend">Your account</p>
      <Field label="Full name">
        <input name="name" placeholder="Your name" required />
      </Field>
      <Field label="Email">
        <input name="email" type="email" placeholder="owner@studio.com" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
    </div>
  );
}

export function StudioProfileSetup({
  account,
  onSubmit,
  pending,
  error,
}: {
  account: Account;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending?: boolean;
  error?: string;
}) {
  const isOwner = account.role === "owner";

  return (
    <div className="studio-setup-overlay" role="dialog" aria-modal="true" aria-labelledby="studio-setup-title">
      <div className="studio-setup">
        <header className="studio-setup__head">
          <h2 id="studio-setup-title">Set up your studio profile</h2>
          <p>
            {isOwner
              ? "Add your studio name and contact details. This appears across your dashboard after you log in."
              : "Your studio owner needs to complete the studio profile before you can use the workspace."}
          </p>
        </header>

        {isOwner ? (
          <>
            {error ? (
              <p className="auth-form__error" role="alert">
                {error}
              </p>
            ) : null}
            <FormPanel title="Studio details" onSubmit={onSubmit} submitLabel={pending ? "Saving…" : "Save & continue"}>
            <Field label="Studio name">
              <input
                name="studioName"
                defaultValue={account.studioName === "Your Wedding Film Studio" ? "" : account.studioName}
                placeholder="Infinity Creations"
                required
              />
            </Field>
            <Field label="City">
              <input name="location" defaultValue={account.location} placeholder="Kathmandu" required />
            </Field>
            <Field label="Studio phone">
              <input name="phone" type="tel" defaultValue={account.phone} placeholder="9800000000" required />
            </Field>
            <Field label="Tagline" span={2}>
              <input name="tagline" defaultValue={account.tagline} placeholder="Optional" />
            </Field>
          </FormPanel>
          </>
        ) : (
          <p className="studio-setup__note">Ask the owner to sign in and complete the studio profile.</p>
        )}
      </div>
    </div>
  );
}

export function ManagerInviteForm({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending?: boolean;
  error?: string;
}) {
  return (
    <form className="manager-invite" onSubmit={onSubmit}>
      <h4 className="manager-invite__title">Add manager</h4>
      <p className="manager-invite__desc">
        Create a manager account for your studio. Set a starting password and share it with them — they can change it
        after they sign in.
      </p>
      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="manager-invite__fields">
        <Field label="Full name">
          <input name="name" placeholder="Manager name" required disabled={pending} />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            placeholder="manager@studio.com"
            required
            autoComplete="email"
            disabled={pending}
          />
        </Field>
        <Field label="Password" span={2}>
          <input
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
          />
        </Field>
      </div>
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add manager"}
      </button>
    </form>
  );
}

export function ChangePasswordForm({
  onSubmit,
  pending,
  error,
  success,
  hasPassword = true,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending?: boolean;
  error?: string;
  success?: string;
  hasPassword?: boolean;
}) {
  return (
    <form className="manager-invite" onSubmit={onSubmit}>
      <h4 className="manager-invite__title">{hasPassword ? "Change password" : "Set a password"}</h4>
      <p className="manager-invite__desc">
        {hasPassword
          ? "Update the password you use to sign in."
          : "Add a password so you can sign in without Google."}
      </p>
      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="auth-hint" role="status">
          {success}
        </p>
      ) : null}
      <div className="manager-invite__fields">
        {hasPassword ? (
          <Field label="Current password" span={2}>
            <input
              name="currentPassword"
              type="password"
              placeholder="Current password"
              required
              autoComplete="current-password"
              disabled={pending}
            />
          </Field>
        ) : null}
        <Field label="New password" span={2}>
          <input
            name="newPassword"
            type="password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
          />
        </Field>
      </div>
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
      </button>
    </form>
  );
}

export function ManagerJoinFields() {
  const [ownerEmail, setOwnerEmail] = useState("");
  const trimmedOwnerEmail = ownerEmail.trim().toLowerCase();

  return (
    <div className="auth-form__fields">
      <Field label="Owner email">
        <input
          name="ownerEmail"
          type="email"
          placeholder="owner@studio.com"
          required
          autoComplete="email"
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
        />
      </Field>

      {trimmedOwnerEmail ? (
        <a
          href={`/api/auth/google?join=${encodeURIComponent(trimmedOwnerEmail)}`}
          className="btn btn--secondary auth-google-btn"
        >
          <GoogleIcon />
          Continue with Google to join
        </a>
      ) : (
        <p className="auth-hint">Enter the owner&apos;s email above to join with Google instead.</p>
      )}

      <div className="auth-divider">
        <span>or set a password</span>
      </div>

      <p className="auth-form__legend">Your account</p>
      <Field label="Full name">
        <input name="name" placeholder="Your name" required />
      </Field>
      <Field label="Email">
        <input name="email" type="email" placeholder="manager@studio.com" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
    </div>
  );
}
