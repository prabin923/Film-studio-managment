"use client";

import Link from "next/link";
import { MERCURY_STEPS } from "../lib/mercury-landing-content";

function StepIcon({ id }: { id: (typeof MERCURY_STEPS)[number]["id"] }) {
  if (id === "register") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeLinecap="round" />
        <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "invite") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="m-how m-reveal">
      <div className="m-how__grid">
        <div className="m-how__intro">
          <p className="m-how__eyebrow">How it works</p>
          <h2>Up and running in three steps</h2>
          <p>
            No spreadsheets to migrate on day one. Register, invite your manager, and start logging
            work in a workspace built for wedding film studios.
          </p>
          <div className="m-how__actions">
            <Link href="/login?mode=register" className="btn btn--primary">
              Create workspace
            </Link>
            <Link href="/login" className="m-how__link">
              Already have an account?
            </Link>
          </div>
        </div>

        <ol className="m-how__timeline">
          {MERCURY_STEPS.map((item, index) => (
            <li key={item.id} className="m-how__item">
              <div className="m-how__marker" aria-hidden>
                <span className="m-how__icon">
                  <StepIcon id={item.id} />
                </span>
                {index < MERCURY_STEPS.length - 1 ? <span className="m-how__line" /> : null}
              </div>
              <div className="m-how__content">
                <span className="m-how__step-num">{item.step}</span>
                <p className="m-how__tagline">{item.tagline}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
