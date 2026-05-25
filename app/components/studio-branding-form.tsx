"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BRAND_SHAPES,
  DEFAULT_STUDIO_BRANDING,
  readImageFileAsDataUrl,
  type BrandShape,
} from "../lib/studio-branding";
import type { StudioBranding } from "../lib/types";
import { Field } from "./ui";
import { StudioBrandMark } from "./studio-brand";

export function StudioBrandingForm({
  branding,
  studioName,
  onSave,
  pending,
  error,
}: {
  branding: StudioBranding;
  studioName: string;
  onSave: (branding: StudioBranding) => void;
  pending?: boolean;
  error?: string;
}) {
  const [draft, setDraft] = useState<StudioBranding>(branding);
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    setDraft(branding);
  }, [branding]);

  const handleLogoChange = async (file: File | undefined) => {
    if (!file) return;
    setLogoError("");
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setDraft((current) => ({ ...current, logoData: dataUrl }));
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Could not load image.");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft);
  };

  return (
    <form className="studio-branding-form" onSubmit={handleSubmit}>
      <h3 className="studio-branding-form__title">Studio logo &amp; colors</h3>
      <p className="studio-branding-form__desc">
        Owner and manager can customize how your studio appears in the sidebar. Changes apply for everyone
        in this workspace.
      </p>

      <div className="studio-branding-form__preview">
        <StudioBrandMark studioName={studioName || "Studio"} branding={draft} className="brand-mark--preview" />
        <div className="studio-branding-form__preview-name">{studioName || "Your studio"}</div>
      </div>

      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {logoError ? (
        <p className="auth-form__error" role="alert">
          {logoError}
        </p>
      ) : null}

      <div className="studio-branding-form__grid">
        <Field label="Logo image">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={pending}
            onChange={(event) => void handleLogoChange(event.target.files?.[0])}
          />
          <p className="field__hint">PNG, JPG, or WebP under 350 KB.</p>
        </Field>
        <div className="studio-branding-form__logo-actions">
          {draft.logoData ? (
            <button
              className="btn btn--ghost"
              type="button"
              disabled={pending}
              onClick={() => setDraft((current) => ({ ...current, logoData: "" }))}
            >
              Remove logo
            </button>
          ) : null}
        </div>

        <Field label="Mark / background color">
          <input
            type="color"
            value={draft.brandColor}
            disabled={pending || Boolean(draft.logoData)}
            onChange={(event) => setDraft((current) => ({ ...current, brandColor: event.target.value }))}
          />
        </Field>
        <Field label="Initials text color">
          <input
            type="color"
            value={draft.brandTextColor}
            disabled={pending || Boolean(draft.logoData)}
            onChange={(event) => setDraft((current) => ({ ...current, brandTextColor: event.target.value }))}
          />
        </Field>
        <Field label="Shape" span={2}>
          <select
            value={draft.brandShape}
            disabled={pending}
            onChange={(event) =>
              setDraft((current) => ({ ...current, brandShape: event.target.value as BrandShape }))
            }
          >
            {BRAND_SHAPES.map((shape) => (
              <option key={shape} value={shape}>
                {shape.charAt(0).toUpperCase() + shape.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="studio-branding-form__actions">
        <button
          className="btn btn--ghost"
          type="button"
          disabled={pending}
          onClick={() => setDraft(DEFAULT_STUDIO_BRANDING)}
        >
          Reset style
        </button>
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save branding"}
        </button>
      </div>
    </form>
  );
}
