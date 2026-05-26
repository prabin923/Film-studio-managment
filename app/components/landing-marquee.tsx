"use client";

const ITEMS = [
  "Client projects",
  "Payroll",
  "Gear inventory",
  "Rentals",
  "Expenses",
  "Monthly reports",
  "Multi-currency ledger",
  "Owner + manager",
  "Cloud sync",
  "CSV export",
] as const;

export function LandingMarquee() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div
      className="landing-marquee landing-reveal"
      aria-hidden
      onMouseEnter={(e) => e.currentTarget.classList.add("is-paused")}
      onMouseLeave={(e) => e.currentTarget.classList.remove("is-paused")}
    >
      <div className="landing-marquee__fade landing-marquee__fade--left" />
      <div className="landing-marquee__fade landing-marquee__fade--right" />
      <div className="landing-marquee__track">
        {track.map((label, index) => (
          <span key={`${label}-${index}`} className="landing-marquee__pill">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
