"use client";

import type { MouseEvent } from "react";
import { MERCURY_STATS } from "../lib/mercury-landing-content";

function StatIcon({ id }: { id: (typeof MERCURY_STATS)[number]["id"] }) {
  if (id === "modules") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (id === "roles") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "currency") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      <path d="M12 12v3" strokeLinecap="round" />
    </svg>
  );
}

function handleSpotlight(e: MouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
  card.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
}

function clearSpotlight(e: MouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  card.style.removeProperty("--spot-x");
  card.style.removeProperty("--spot-y");
}

export function LandingStatsSection() {
  return (
    <section className="m-stats-section m-section m-section--wide">
      <div className="m-stats-section__glow" aria-hidden />
      <div className="m-section__head m-reveal">
        <p className="m-stats-section__eyebrow">Built for studios</p>
        <h2>You&apos;re building something lasting. So is your ledger.</h2>
        <p className="m-stats-section__lead">
          One workspace for bookings, crew, gear, and cash flow — no patchwork of spreadsheets.
        </p>
      </div>

      <div className="m-stats-bento m-reveal m-stats-bento--animate">
        {MERCURY_STATS.map((stat) => (
          <article
            key={stat.id}
            className={[
              "m-stat-card",
              stat.featured && "m-stat-card--featured",
            ]
              .filter(Boolean)
              .join(" ")}
            onMouseMove={handleSpotlight}
            onMouseLeave={clearSpotlight}
          >
            <span className="m-stat-card__beam" aria-hidden />
            <div className="m-stat-card__inner">
              <span className="m-stat-card__spotlight" aria-hidden />
              <span className="m-stat-card__icon">
                <StatIcon id={stat.id} />
              </span>
              <p className="m-stat-card__value m-stat__value" data-count-target={stat.value}>
                {stat.value}
              </p>
              <p className="m-stat-card__label m-stat__label">{stat.label}</p>
              <p className="m-stat-card__detail">{stat.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
