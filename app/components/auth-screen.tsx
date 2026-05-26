"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { RegisterAs } from "../lib/types";
import { getStoredAccount } from "../lib/accounts";
import { animateAuthCard, animateFormFields, initAuthAnimations } from "../lib/gsap-auth";
import { Field } from "./ui";
import { ManagerJoinFields, RegisterRolePicker, StudioProfileFields } from "./studio-profile";
import { ThemeToggle } from "./theme-toggle";

export function AuthScreen({
  mode,
  onSwitchMode,
  onLogin,
  onRegister,
  error,
  pending,
}: {
  mode: "login" | "register";
  onSwitchMode: (mode: "login" | "register") => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  error: string;
  pending: boolean;
}) {
  const isRegister = mode === "register";
  const [registerAs, setRegisterAs] = useState<RegisterAs>("owner");
  const [studioHint, setStudioHint] = useState("");
  const shellRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;
    return initAuthAnimations(root);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    return animateAuthCard(card);
  }, [mode, registerAs]);

  // Stagger animate form elements whenever switching form modes/roles
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const form = card.querySelector(".auth-form") as HTMLElement;
    if (form) {
      animateFormFields(form);
    }
  }, [mode, registerAs]);

  function switchMode(next: "login" | "register") {
    onSwitchMode(next);
    setStudioHint("");
  }

  function handleEmailBlur(value: string) {
    const email = value.trim().toLowerCase();
    if (!email) {
      setStudioHint("");
      return;
    }
    const stored = getStoredAccount(email);
    setStudioHint(stored ? stored.studioName : "");
  }

  return (
    <main className="auth-shell" ref={shellRef}>
      <aside className="auth-aside">
        <div className="auth-aside__glow auth-aside__glow--1"></div>
        <div className="auth-aside__glow auth-aside__glow--2"></div>
        <div className="auth-aside__glow auth-aside__glow--3"></div>
        <div>
          <p className="auth-kicker">WedStudio OS</p>
          <h1>Operations ledger for wedding film studios.</h1>
          <p className="auth-lead">
            Register an owner and manager with different emails to share one studio dashboard on this device.
          </p>
        </div>
        <div className="auth-character-container">
          <InteractiveCharacter />
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-theme-slot">
          <ThemeToggle />
        </div>
        <Link href="/" className="auth-home-link">
          ← Back to home
        </Link>
        <div className="auth-tabs" aria-label="Authentication mode">
          <button
            className={isRegister ? "active" : ""}
            type="button"
            onClick={() => switchMode("register")}
          >
            Sign up
          </button>
          <button className={!isRegister ? "active" : ""} type="button" onClick={() => switchMode("login")}>
            Log in
          </button>
        </div>

        <div className="auth-card" ref={cardRef}>
          {isRegister ? (
            <form
              className="auth-form"
              key={`register-${registerAs}`}
              onSubmit={onRegister}
            >
              <header className="auth-form__intro">
                <h2>Create account</h2>
                <p>
                  {registerAs === "owner"
                    ? "Set up your studio workspace."
                    : "Join your studio as manager."}
                </p>
              </header>

              <RegisterRolePicker value={registerAs} onChange={setRegisterAs} />
              {registerAs === "owner" ? <StudioProfileFields /> : <ManagerJoinFields />}

              {error ? (
                <p className="auth-form__error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="btn btn--primary auth-form__submit" type="submit" disabled={pending}>
                {pending ? "Please wait…" : registerAs === "owner" ? "Sign up" : "Join studio"}
              </button>

              <p className="auth-form__switch">
                Already have an account?{" "}
                <button type="button" className="auth-link" onClick={() => switchMode("login")}>
                  Log in
                </button>
              </p>
            </form>
          ) : (
            <form className="auth-form" key="login" onSubmit={onLogin}>
              <header className="auth-form__intro">
                <h2>Welcome back</h2>
                <p>Log in with your owner or manager email.</p>
              </header>

              <div className="auth-form__fields">
                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    placeholder="you@studio.com"
                    required
                    autoComplete="email"
                    disabled={pending}
                    onBlur={(event) => handleEmailBlur(event.target.value)}
                    onChange={() => setStudioHint("")}
                  />
                </Field>
                {studioHint ? <p className="auth-hint">Studio: {studioHint}</p> : null}
                <Field label="Password">
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={pending}
                  />
                </Field>
              </div>

              {error ? (
                <p className="auth-form__error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="btn btn--primary auth-form__submit" type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Log in"}
              </button>

              <p className="auth-form__switch">
                New studio?{" "}
                <button type="button" className="auth-link" onClick={() => switchMode("register")}>
                  Sign up
                </button>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export function InteractiveCharacter() {
  return (
    <svg
      viewBox="0 0 400 320"
      className="auth-char-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
          <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
        </linearGradient>
      </defs>

      {/* Floating Elements (Film tape, stars, play badge) */}
      <g className="char-floating-item char-floating-item--star" transform="translate(50, 40)">
        <polygon points="12,0 15,8 24,8 17,13 20,21 12,16 4,21 7,13 0,8 9,8" fill="#fbbf24" opacity="0.8" />
      </g>
      <g className="char-floating-item char-floating-item--play" transform="translate(340, 50)">
        <circle cx="15" cy="15" r="15" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" />
        <polygon points="11,9 22,15 11,21" fill="#ec4899" />
      </g>
      <g className="char-floating-item char-floating-item--lens" transform="translate(330, 210)">
        <circle cx="10" cy="10" r="8" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5" />
      </g>

      {/* Retro Film Reel Ears (Left & Right) */}
      <g className="char-film-reel char-film-reel--left" transform="translate(130, 110)">
        <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle cx="0" cy="0" r="8" fill="#475569" />
        <circle cx="0" cy="-16" r="4" fill="#0f172a" />
        <circle cx="0" cy="16" r="4" fill="#0f172a" />
        <circle cx="-16" cy="0" r="4" fill="#0f172a" />
        <circle cx="16" cy="0" r="4" fill="#0f172a" />
      </g>
      
      <g className="char-film-reel char-film-reel--right" transform="translate(270, 110)">
        <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle cx="0" cy="0" r="8" fill="#475569" />
        <circle cx="0" cy="-16" r="4" fill="#0f172a" />
        <circle cx="0" cy="16" r="4" fill="#0f172a" />
        <circle cx="-16" cy="0" r="4" fill="#0f172a" />
        <circle cx="16" cy="0" r="4" fill="#0f172a" />
      </g>

      {/* Robot Camera Body / Stand */}
      <path d="M160,240 L120,310 M240,240 L280,310 M200,240 L200,310" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />
      <rect x="175" y="220" width="50" height="24" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.08)" />

      {/* Main Glassmorphic Camera Head */}
      <rect x="130" y="110" width="140" height="110" rx="20" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      
      {/* Dynamic Tracking Lens/Eye Group */}
      <g className="char-eye-group" transform="translate(200, 165)">
        <circle cx="0" cy="0" r="38" fill="#0f172a" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle cx="0" cy="0" r="28" fill="#1e293b" />
        
        {/* Interactive Tracking Pupil Iris */}
        <g className="char-lens-pupil">
          <circle cx="0" cy="0" r="18" fill="url(#lensGlow)" />
          <circle cx="0" cy="0" r="10" fill="#3b82f6" />
          <circle cx="0" cy="0" r="5" fill="#93c5fd" />
          <circle cx="-4" cy="-4" r="3" fill="#ffffff" opacity="0.8" />
        </g>
      </g>

      {/* Cute LED Status Heartbeat */}
      <path d="M 148,200 L 172,200 L 177,192 L 182,208 L 187,200 L 252,200" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}
