"use client";

import { studioInitials } from "../lib/accounts";
import { brandMarkRadius } from "../lib/studio-branding";
import type { StudioBranding } from "../lib/types";

export function StudioBrandMark({
  studioName,
  branding,
  className,
}: {
  studioName: string;
  branding: StudioBranding;
  className?: string;
}) {
  const radius = brandMarkRadius(branding.brandShape);
  const style = {
    background: branding.logoData ? "transparent" : branding.brandColor,
    color: branding.brandTextColor,
    borderRadius: radius,
  } as const;

  const classes = className ? `brand-mark ${className}` : "brand-mark";

  if (branding.logoData) {
    return (
      <div className={classes} style={{ borderRadius: radius, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={branding.logoData} alt="" className="brand-mark__img" />
      </div>
    );
  }

  return (
    <div className={classes} style={style} aria-hidden>
      {studioInitials(studioName)}
    </div>
  );
}

export function StudioSidebarBrand({
  studioName,
  branding,
}: {
  studioName: string;
  branding: StudioBranding;
}) {
  return (
    <div className="brand brand--sidebar">
      <StudioBrandMark studioName={studioName} branding={branding} className="brand-mark--sidebar" />
      <div className="brand__text">
        <div className="brand-title" title={studioName}>
          {studioName}
        </div>
        <div className="brand-subtitle">WedStudio OS</div>
      </div>
    </div>
  );
}
