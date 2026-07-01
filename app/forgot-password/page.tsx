"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { InteractiveCharacter } from "../components/auth-screen";
import { Field } from "../components/ui";
import { ThemeToggle } from "../components/theme-toggle";
import { animateAuthCard, animateFormFields, initAuthAnimations } from "../lib/gsap-auth";
import { apiForgotPassword } from "../lib/api-client";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const form = card.querySelector(".auth-form") as HTMLElement;
    if (form) animateFormFields(form);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const data = new FormData(event.currentTarget);
      const email = String(data.get("email") || "").trim().toLowerCase();
      if (!email) {
        setError("Enter your email.");
        return;
      }

      const result = await apiForgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="auth-shell" ref={shellRef}>
      <aside className="auth-aside">
        <div className="auth-aside__glow auth-aside__glow--1"></div>
        <div className="auth-aside__glow auth-aside__glow--2"></div>
        <div className="auth-aside__glow auth-aside__glow--3"></div>
        <div>
          <p className="auth-kicker">WedStudio OS</p>
          <h1>Reset your password.</h1>
          <p className="auth-lead">We&apos;ll email you a link to set a new password for your account.</p>
        </div>
        <div className="auth-character-container">
          <InteractiveCharacter />
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-theme-slot">
          <ThemeToggle />
        </div>
        <Link href="/login" className="auth-home-link">
          ← Back to login
        </Link>

        <div className="auth-card" ref={cardRef}>
          {message ? (
            <div className="auth-form">
              <header className="auth-form__intro">
                <h2>Check your email</h2>
                <p>{message}</p>
              </header>
              <p className="auth-form__switch">
                <Link href="/login" className="auth-link">
                  Back to login
                </Link>
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <header className="auth-form__intro">
                <h2>Forgot password</h2>
                <p>Enter the email on your account and we&apos;ll send you a reset link.</p>
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
                  />
                </Field>
              </div>

              {error ? (
                <p className="auth-form__error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="btn btn--primary auth-form__submit" type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send reset link"}
              </button>

              <p className="auth-form__switch">
                Remembered it?{" "}
                <Link href="/login" className="auth-link">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
