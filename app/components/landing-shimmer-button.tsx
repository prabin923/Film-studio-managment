"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type LandingShimmerButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "ghost" | "primary";
  className?: string;
};

export function LandingShimmerButton({
  href,
  children,
  variant = "ghost",
  className = "",
}: LandingShimmerButtonProps) {
  const classNames = `m-shimmer-btn m-shimmer-btn--${variant} ${className}`.trim();
  const content = (
    <>
      <span className="m-shimmer-btn__bg" aria-hidden />
      <span className="m-shimmer-btn__shine" aria-hidden />
      <span className="m-shimmer-btn__label">{children}</span>
    </>
  );

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classNames}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames}>
      {content}
    </Link>
  );
}
