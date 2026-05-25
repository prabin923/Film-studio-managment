"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { initLandingAnimations } from "../lib/anime-motion";
import { ThemeToggle } from "./theme-toggle";

const STATS = [
  { value: "6", label: "Core modules", detail: "Clients, payroll, gear, rentals, expenses, reports" },
  { value: "2", label: "Team roles", detail: "Owner and manager on one workspace" },
  { value: "NPR", label: "Local currency", detail: "Amounts stored in paisa for accuracy" },
  { value: "1", label: "Shared workspace", detail: "Owner and manager on secure cloud data" },
] as const;

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    clients: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
    payroll: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h2" strokeLinecap="round" />
      </svg>
    ),
    gear: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M14.5 4h-5L7 7H4v10h3l2.5 3h5l2.5-3H20V7h-3l-2.5-3z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3.25" />
      </svg>
    ),
    rentals: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M8 2v4M16 2v4" strokeLinecap="round" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
      </svg>
    ),
    expenses: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
        <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
      </svg>
    ),
    reports: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[name] ?? icons.clients;
}

const FEATURES = [
  {
    title: "Clients & projects",
    description: "Every wedding booking becomes a living project card — not a scattered spreadsheet row.",
    tone: "indigo",
    icon: "clients",
    bullets: [
      "Package value, deposits, and paid vs due balances",
      "Project status from booked through delivered",
      "Paid / Unpaid payment tracking separate from workflow",
      "Crew assignment and event date on each card",
    ],
  },
  {
    title: "Payroll",
    description: "Know what you owe the team before month-end surprises.",
    tone: "violet",
    icon: "payroll",
    bullets: [
      "Monthly salary with advances and deductions",
      "Pending vs paid at a glance",
      "Manager access for day-to-day payroll updates",
      "Rolls into dashboard cash-flow totals",
    ],
  },
  {
    title: "Gear inventory",
    description: "Your kit list with availability that updates when gear goes out on rental.",
    tone: "pink",
    icon: "gear",
    bullets: [
      "Serial numbers, condition, and day rates",
      "Available, rented, or maintenance status",
      "Quick scan of what is free for the next shoot",
      "Tied to rental bookings automatically",
    ],
  },
  {
    title: "Rentals",
    description: "Multi-item rental bookings with deposits split fairly across gear lines.",
    tone: "amber",
    icon: "rentals",
    bullets: [
      "Add several gear lines in one booking",
      "Deposit on first row, balance tracked per rental",
      "Paid amounts split by each item's rent share",
      "Return status updates inventory when gear is back",
    ],
  },
  {
    title: "Expenses",
    description: "Operating costs logged against the same ledger as your income.",
    tone: "teal",
    icon: "expenses",
    bullets: [
      "Category, vendor, and date on every entry",
      "Feeds month-wise net reports",
      "Manager can log expenses alongside the owner",
      "Keeps profit picture honest week to week",
    ],
  },
  {
    title: "Reports & charts",
    description: "See trends instead of guessing from memory at tax time.",
    tone: "blue",
    icon: "reports",
    bullets: [
      "Colorful revenue chart — client vs rental pay",
      "Clients onboarded per month",
      "Six-month table: income, expenses, net",
      "Owner-only reports for full financial view",
    ],
  },
] as const;

const WORKFLOWS = [
  {
    title: "Book a new couple",
    description:
      "Add the project with package amount and deposit. Track delivery status as you shoot and edit. Mark Paid when the final installment lands.",
  },
  {
    title: "Pay the crew",
    description:
      "Enter monthly salary, advances, and deductions for editors and assistants. Mark paid when you transfer — payroll due shows on the dashboard.",
  },
  {
    title: "Rent gear out",
    description:
      "Build a multi-item rental, take a deposit, and watch inventory flip to Rented. On return, gear becomes Available again.",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Owner registers",
    description:
      "Create your studio workspace with name, city, phone, and tagline. Your profile appears across the dashboard and sidebar.",
  },
  {
    step: "02",
    title: "Manager joins",
    description:
      "A second email joins the same workspace using the owner email. Both see the same clients, payroll, and rentals.",
  },
  {
    step: "03",
    title: "Run the studio",
    description:
      "Log work daily from any browser. Your studio data is stored securely in the cloud with owner and manager access.",
  },
] as const;

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

const PREVIEW_BARS = [
  { height: "42%", className: "" },
  { height: "68%", className: "" },
  { height: "55%", className: "landing-preview__bar-col--violet" },
  { height: "80%", className: "landing-preview__bar-col--pink" },
  { height: "48%", className: "landing-preview__bar-col--amber" },
  { height: "62%", className: "landing-preview__bar-col--teal" },
] as const;

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return initLandingAnimations(root);
  }, []);

  return (
    <div className="landing" ref={rootRef}>
      <header className="landing-nav landing-nav--animate">
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
          <ThemeToggle className="landing-nav__theme" />
          <a href="#features">Features</a>
          <a href="#workflows">Workflows</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <Link href="/login">Log in</Link>
          <Link href="/login?mode=register" className="btn btn--primary landing-nav__cta">
            Get started
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="landing-eyebrow landing-hero__anim">Wedding film studio operations</p>
          <h1 className="landing-hero__anim">
            Run your studio
            <br />
            with clarity.
          </h1>
          <p className="landing-lead landing-hero__anim">
            A refined operations ledger for wedding film teams — clients, crew payroll, gear inventory,
            rentals, and cash flow in one calm workspace. Owners and managers collaborate securely from
            separate accounts.
          </p>
          <div className="landing-hero__actions landing-hero__anim">
            <Link href="/login?mode=register" className="btn btn--primary landing-hero__btn">
              Get started free
            </Link>
            <Link href="/login" className="btn btn--secondary landing-hero__btn">
              Log in
            </Link>
          </div>
          <ul className="landing-hero__points landing-hero__anim">
            <li>Cloud workspace — owner and manager stay in sync</li>
            <li>NPR amounts with paisa precision</li>
            <li>Colorful revenue &amp; onboarding charts</li>
            <li>Owner + manager with role-based access</li>
          </ul>
        </div>

        <div className="landing-hero__preview landing-hero__anim" aria-hidden>
          <div className="landing-preview landing-preview--float">
            <div className="landing-preview__bar">
              <span className="landing-preview__dot" />
              <span className="landing-preview__dot" />
              <span className="landing-preview__dot" />
            </div>
            <div className="landing-preview__body">
              <div className="landing-preview__sidebar">
                <div className="landing-preview__brand" />
                <div className="landing-preview__nav-item landing-preview__nav-item--active" />
                <div className="landing-preview__nav-item" />
                <div className="landing-preview__nav-item" />
                <div className="landing-preview__nav-item" />
              </div>
              <div className="landing-preview__main">
                <div className="landing-preview__metrics">
                  <div className="landing-preview__metric landing-preview__metric--pulse" />
                  <div className="landing-preview__metric" />
                  <div className="landing-preview__metric landing-preview__metric--accent" />
                </div>
                <div className="landing-preview__chart">
                  {PREVIEW_BARS.map((bar, index) => (
                    <div
                      key={index}
                      className={`landing-preview__bar-col landing-preview__bar-col--animate ${bar.className}`.trim()}
                      style={{ "--bar-height": bar.height } as CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats landing-reveal" aria-label="Product highlights">
        {STATS.map((stat, index) => (
          <article
            key={stat.label}
            className="landing-stat"
            style={{ transitionDelay: `${index * 0.06}s` }}
          >
            <p className="landing-stat__value">{stat.value}</p>
            <h3 className="landing-stat__label">{stat.label}</h3>
            <p className="landing-stat__detail">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section id="features" className="landing-section landing-reveal">
        <div className="landing-section__head">
          <p className="landing-eyebrow">Everything in one OS</p>
          <h2>Run the business side of your studio</h2>
          <p>
            From the first inquiry to final delivery — plus payroll, gear, and month-end reports. Each module
            connects to the same ledger so you are never reconciling three different tools.
          </p>
        </div>
        <div className="landing-features">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`landing-feature landing-feature--${feature.tone} landing-reveal`}
              style={{ transitionDelay: `${(index % 3) * 0.08}s` }}
            >
              <div className="landing-feature__glow" aria-hidden />
              <div className="landing-feature__head">
                <span className="landing-feature__icon">
                  <FeatureIcon name={feature.icon} />
                </span>
                <span className="landing-feature__tag">Module</span>
              </div>
              <h3>{feature.title}</h3>
              <p className="landing-feature__desc">{feature.description}</p>
              <ul className="landing-feature__list">
                {feature.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="workflows" className="landing-section landing-section--muted landing-reveal">
        <div className="landing-section__head">
          <p className="landing-eyebrow">Day in the studio</p>
          <h2>Typical workflows, already wired in</h2>
          <p>How wedding film teams use WedStudio OS week to week — without jumping between spreadsheets.</p>
        </div>
        <div className="landing-workflows">
          {WORKFLOWS.map((item, index) => (
            <article
              key={item.title}
              className="landing-workflow landing-reveal"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-built landing-reveal">
        <div className="landing-built__copy">
          <p className="landing-eyebrow">Made for your niche</p>
          <h2>Wedding film is a project business</h2>
          <p>
            You juggle couples, dates, second shooters, cinema cameras, and rental income — often in the same
            week. WedStudio OS mirrors how studios actually work: projects first, people and gear attached to
            those projects, money flowing in and out with clear balances.
          </p>
          <ul className="landing-built__list">
            <li>Studio profile with your name on the sidebar after setup</li>
            <li>Dashboard metrics: active projects, rentals out, payroll due, net cash</li>
            <li>Project cards with payment status, crew, and delivery pipeline</li>
            <li>Month-wise reports for owner review and tax prep</li>
          </ul>
        </div>
        <div className="landing-built__panel" aria-hidden>
          <div className="landing-built__row">
            <span>Active projects</span>
            <strong className="landing-built__chip landing-built__chip--indigo">12</strong>
          </div>
          <div className="landing-built__row">
            <span>Gear on rent</span>
            <strong className="landing-built__chip landing-built__chip--amber">5</strong>
          </div>
          <div className="landing-built__row">
            <span>Payroll pending</span>
            <strong className="landing-built__chip landing-built__chip--violet">NPR 84k</strong>
          </div>
          <div className="landing-built__row">
            <span>Net cash (month)</span>
            <strong className="landing-built__chip landing-built__chip--teal">+ NPR 2.4L</strong>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-reveal">
        <div className="landing-section__head">
          <p className="landing-eyebrow">Team access</p>
          <h2>Owner and manager, one workspace</h2>
          <p>
            Register once as owner, complete your studio profile, then invite a manager with a second email.
            Same clients, payroll, and rentals — different permissions for sensitive reports.
          </p>
        </div>
        <ol className="landing-steps">
          {STEPS.map((item, index) => (
            <li
              key={item.step}
              className="landing-step landing-reveal"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <span className="landing-step__num">{item.step}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="landing-section landing-section--muted landing-section--center landing-reveal">
        <div className="landing-section__head">
          <p className="landing-eyebrow">Questions</p>
          <h2>Before you sign up</h2>
        </div>
        <div className="landing-faq">
          {FAQ.map((item, index) => (
            <details
              key={item.q}
              className="landing-faq__item landing-reveal"
              style={{ transitionDelay: `${index * 0.06}s` }}
            >
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-cta landing-reveal">
        <div className="landing-cta__inner">
          <h2>Ready to organize your studio?</h2>
          <p>
            Set up your workspace in minutes. Cloud-backed ledger with CSV export and team roles —
            your pace.
          </p>
          <div className="landing-cta__actions">
            <Link href="/login?mode=register" className="btn btn--primary">
              Create studio workspace
            </Link>
            <Link href="/login" className="btn btn--secondary">
              I already have an account
            </Link>
          </div>
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
