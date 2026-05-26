"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter, Manrope } from "next/font/google";
import { useEffect, useRef } from "react";
import { initLandingAnimations } from "../lib/anime-motion";
import {
  MERCURY_HERO_IMAGE,
  MERCURY_TRUST,
} from "../lib/mercury-landing-content";
import { LandingCardStack } from "./landing-card-stack";
import { LandingHeroDevice } from "./landing-hero-device";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingProductTabs } from "./landing-product-tabs";
import { LandingShimmerButton } from "./landing-shimmer-button";
import { LandingStatsSection } from "./landing-stats-section";
import { LandingTestimonials } from "./landing-testimonials";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const FAQ = [
  {
    q: "Is my data stored in the cloud?",
    a: "Yes. Your workspace is saved to a secure Postgres database. Sign in from any device — owner and manager share the same studio ledger.",
  },
  {
    q: "Can the owner and manager use different emails?",
    a: "Yes. The owner registers first. The manager signs up with their own email and the owner's email to join the same shared workspace.",
  },
  {
    q: "What currency does it use?",
    a: "Amounts are in Nepalese Rupees (NPR), stored in paisa internally so totals stay precise.",
  },
  {
    q: "What can the manager access?",
    a: "Managers can use clients, expenses, payroll, inventory, and rentals. Full financial reports remain owner-only.",
  },
] as const;

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return initLandingAnimations(root);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`landing landing--mercury ${inter.variable} ${manrope.variable}`}
    >
      <header className="landing-nav">
        <Link href="/" className="landing-brand">
          <span className="landing-brand__mark" aria-hidden>
            WS
          </span>
          <span>
            <strong>WedStudio OS</strong>
            <small>Infinity Creations</small>
          </span>
        </Link>
        <nav className="landing-nav__links" aria-label="Primary">
          <a href="#products">Products</a>
          <a href="#workflows">Workflows</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <Link href="/login">Log in</Link>
          <Link href="/login?mode=register" className="btn btn--primary landing-nav__cta">
            Open account
          </Link>
        </nav>
      </header>

      <section className="m-hero">
        <div className="m-hero__bg" aria-hidden>
          <div data-parallax style={{ position: "absolute", inset: 0 }}>
            <Image
              src={MERCURY_HERO_IMAGE}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="m-hero__overlay" />
          <div className="m-hero__grain" />
        </div>
        <div className="m-hero__layout">
          <div className="m-hero__copy-zone">
            <div className="m-hero__inner">
            <p className="m-hero__eyebrow m-hero__anim">Wedding film studio operations</p>
            <h1 className="m-hero__anim">
              Radically clearer
              <br />
              studio finance
            </h1>
            <p className="m-hero__lead m-hero__anim">
              Apply in minutes to experience operations unlike scattered spreadsheets — clients,
              payroll, gear, rentals, and reports in one calm workspace.
            </p>
            <div className="m-hero__cta-group m-hero__anim">
              <input
                type="email"
                className="m-hero__input"
                placeholder="Your work email"
                aria-label="Work email"
                autoComplete="email"
              />
              <Link href="/login?mode=register" className="m-hero__cta-btn">
                Open account
              </Link>
            </div>
            <p className="m-hero__fine m-hero__anim">
              Cloud workspace for owners and managers. NPR amounts with paisa precision.
            </p>
            <div className="m-hero__secondary-actions m-hero__anim">
              <LandingShimmerButton href="/login" variant="ghost">
                Log in
              </LandingShimmerButton>
              <LandingShimmerButton href="#products" variant="ghost">
                Explore modules
              </LandingShimmerButton>
            </div>
            </div>
          </div>
          <div className="m-hero__device-zone">
            <LandingHeroDevice />
          </div>
        </div>
      </section>

      <section id="products" className="m-section m-section--wide">
        <div className="m-section__head m-reveal">
          <h2>Everything you run in a studio. All in one place.</h2>
          <p>
            Clients, payroll, gear, rentals, and reports — connected to the same ledger so balances
            stay aligned without reconciling separate tools.
          </p>
        </div>
        <LandingProductTabs />
      </section>

      <section className="m-section">
        <div className="m-section__head m-reveal">
          <h2>Loved by wedding film teams who need clarity</h2>
          <p>Owners and managers on one workspace — permissions where you need them.</p>
        </div>
        <LandingTestimonials />
      </section>

      <LandingCardStack />

      <section id="workflows" className="m-section m-section--wide">
        <div className="m-section__head m-reveal">
          <h2>Typical workflows, already wired in</h2>
          <p>How studios use WedStudio OS week to week — hover to zoom, scroll to explore.</p>
        </div>
        <div className="m-workflows m-reveal">
          <article className="m-workflow-card">
            <div className="m-workflow-card__media">
              <Image
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80"
                alt="Wedding couple"
                fill
                sizes="(max-width: 900px) 100vw, 360px"
              />
            </div>
            <div className="m-workflow-card__body">
              <h3>Book a new couple</h3>
              <p>Package value, deposits, crew, and delivery status on one project card.</p>
            </div>
          </article>
          <article className="m-workflow-card">
            <div className="m-workflow-card__media">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80"
                alt="Film crew"
                fill
                sizes="(max-width: 900px) 100vw, 360px"
              />
            </div>
            <div className="m-workflow-card__body">
              <h3>Pay the crew</h3>
              <p>Monthly salary, advances, and pending vs paid totals on the dashboard.</p>
            </div>
          </article>
          <article className="m-workflow-card">
            <div className="m-workflow-card__media">
              <Image
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80"
                alt="Cinema camera"
                fill
                sizes="(max-width: 900px) 100vw, 360px"
              />
            </div>
            <div className="m-workflow-card__body">
              <h3>Rent gear out</h3>
              <p>Multi-item rentals with deposits and inventory that updates on return.</p>
            </div>
          </article>
        </div>
      </section>

      <LandingHowItWorks />

      <LandingStatsSection />

      <section className="m-section">
        <div className="m-section__head m-reveal">
          <h2>Standard spreadsheets stop short. WedStudio goes further.</h2>
        </div>
        <div className="m-trust m-reveal">
          {MERCURY_TRUST.map((item) => (
            <article key={item.title} className="m-trust__item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="m-section">
        <div className="m-section__head m-reveal">
          <h2>Before you sign up</h2>
        </div>
        <div className="m-faq m-reveal">
          {FAQ.map((item) => (
            <details key={item.q} className="m-faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="m-cta-final m-reveal">
        <div className="m-cta-final__glow" aria-hidden />
        <h2>Studio operations — redesigned from the ground up.</h2>
        <p>
          Set up your workspace in minutes. Cloud-backed ledger with CSV export and team roles.
        </p>
        <div className="m-cta-final__actions">
          <Link href="/login?mode=register" className="btn btn--primary">
            Open account
          </Link>
          <Link href="/login" className="btn btn--secondary">
            Log in
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>
          <strong>WedStudio OS</strong> — operations ledger for wedding film studios.
        </p>
        <Link href="/login">Sign in</Link>
      </footer>
    </div>
  );
}
