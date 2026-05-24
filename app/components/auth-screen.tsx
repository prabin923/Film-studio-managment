"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { RegisterAs } from "../lib/types";
import { getStoredAccount } from "../lib/accounts";
import { animateAuthCard, initAuthAnimations } from "../lib/anime-motion";
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
        <div>
          <p className="auth-kicker">WedStudio OS</p>
          <h1>Operations ledger for wedding film studios.</h1>
          <p className="auth-lead">
            Register an owner and manager with different emails to share one studio dashboard on this device.
          </p>
        </div>
        <ul className="auth-points">
          <li>Owner creates the studio workspace</li>
          <li>Manager joins with the owner email</li>
          <li>Same clients, payroll, and rentals for both</li>
        </ul>
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

              <p className="auth-hint auth-hint--demo">
                Demo: <code>owner@infinitycreations.com</code> / <code>demo12345</code>
              </p>

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
