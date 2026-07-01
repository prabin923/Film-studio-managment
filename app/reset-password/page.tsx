"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { InteractiveCharacter } from "../components/auth-screen";
import { Field } from "../components/ui";
import { ThemeToggle } from "../components/theme-toggle";
import { animateAuthCard, animateFormFields, initAuthAnimations } from "../lib/gsap-auth";
import { apiResetPassword } from "../lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
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

    if (!token) {
      setError("This reset link is missing its token. Request a new one.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setPending(true);
    try {
      await apiResetPassword(token, password);
      setDone(true);
      window.setTimeout(() => router.replace("/login"), 1800);
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
          <h1>Set a new password.</h1>
          <p className="auth-lead">Choose a strong password you haven&apos;t used before.</p>
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
          {done ? (
            <div className="auth-form">
              <header className="auth-form__intro">
                <h2>Password updated</h2>
                <p>Taking you to login…</p>
              </header>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <header className="auth-form__intro">
                <h2>Set new password</h2>
                <p>Enter a new password for your account.</p>
              </header>

              <div className="auth-form__fields">
                <Field label="New password">
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    disabled={pending}
                  />
                </Field>
                <Field label="Confirm password">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
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
                {pending ? "Saving…" : "Save new password"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
