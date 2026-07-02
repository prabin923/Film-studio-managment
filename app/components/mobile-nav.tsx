"use client";

import { useState } from "react";
import type { Account, View } from "../lib/types";
import { ThemeToggle } from "./theme-toggle";
import { StudioBrandMark } from "./studio-brand";

type NavItem = { view: View; label: string; icon: JSX.Element };

const I = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.3 5.5-5.3s5.5 2 5.5 5.3" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M17.5 14.9c2 .6 3.5 2.3 3.5 4.6" />
    </svg>
  ),
  rentals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
      <path d="M7.5 14h3M13.5 14h3M7.5 17.5h3" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5 12 3l9 4.5v9L12 21 3 16.5z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    </svg>
  ),
  expenses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21z" />
      <path d="M9.5 8h5M9.5 11.5h5" />
    </svg>
  ),
  salary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v16h16" />
      <path d="M8 15v-3M12.5 15V9M17 15v-6" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  ),
};

const PRIMARY: NavItem[] = [
  { view: "dashboard", label: "Home", icon: I.dashboard },
  { view: "clients", label: "Clients", icon: I.clients },
  { view: "rentals", label: "Rentals", icon: I.rentals },
  { view: "inventory", label: "Inventory", icon: I.inventory },
];

function moreItems(role: "owner" | "manager"): NavItem[] {
  return [
    { view: "expenses", label: "Expenses", icon: I.expenses },
    { view: "salary", label: "Payroll", icon: I.salary },
    ...(role === "owner" ? [{ view: "reports" as View, label: "Reports", icon: I.reports }] : []),
    { view: "profile", label: "Profile", icon: I.profile },
  ];
}

export function MobileTopBar({ account }: { account: Account }) {
  return (
    <header className="m-topbar">
      <StudioBrandMark studioName={account.studioName} branding={account} className="m-topbar__mark" />
      <div className="m-topbar__text">
        <strong>{account.studioName}</strong>
        <span>WedStudio OS</span>
      </div>
      <ThemeToggle />
    </header>
  );
}

export function MobileTabBar({
  view,
  navigate,
  role,
  account,
  onSignOut,
}: {
  view: View;
  navigate: (v: View) => void;
  role: "owner" | "manager";
  account: Account;
  onSignOut: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const more = moreItems(role);
  const moreActive = more.some((m) => m.view === view);

  return (
    <>
      {moreOpen ? (
        <div className="m-sheet-overlay" onClick={() => setMoreOpen(false)} role="presentation">
          <div className="m-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More">
            <div className="m-sheet__grab" />
            <div className="m-sheet__grid">
              {more.map((item) => (
                <button
                  key={item.view}
                  type="button"
                  className={`m-sheet__item ${view === item.view ? "active" : ""}`}
                  onClick={() => {
                    navigate(item.view);
                    setMoreOpen(false);
                  }}
                >
                  <span className="m-sheet__icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="m-sheet__foot">
              <div className="m-sheet__account">
                <strong>{account.name}</strong>
                <span>{account.email}</span>
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setMoreOpen(false);
                  onSignOut();
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="m-tabbar" aria-label="Primary navigation">
        {PRIMARY.map((item) => (
          <button
            key={item.view}
            type="button"
            className={`m-tab ${view === item.view ? "active" : ""}`}
            onClick={() => navigate(item.view)}
          >
            <span className="m-tab__icon">{item.icon}</span>
            <span className="m-tab__label">{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`m-tab ${moreActive || moreOpen ? "active" : ""}`}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          <span className="m-tab__icon">{I.more}</span>
          <span className="m-tab__label">More</span>
        </button>
      </nav>
    </>
  );
}
