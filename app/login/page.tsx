"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthScreen } from "../components/auth-screen";
import { apiLogin, apiMe, apiRegister } from "../lib/api-client";
import type { AuthMode, RegisterAs } from "../lib/types";

function AuthLoading() {
  return (
    <main className="auth-shell auth-shell--loading">
      <div className="auth-loading">
        <span className="auth-loading__mark" aria-hidden>
          WS
        </span>
        <p>Loading…</p>
      </div>
    </main>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") === "register" ? "register" : "login";

  const [authMode, setAuthMode] = useState<AuthMode>(modeParam);
  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [checking, setChecking] = useState(true);

  const switchMode = useCallback(
    (next: AuthMode) => {
      setAuthMode(next);
      setAuthError("");
      router.replace(next === "register" ? "/login?mode=register" : "/login", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    setAuthMode(modeParam);
  }, [modeParam]);

  useEffect(() => {
    let cancelled = false;

    apiMe()
      .then(() => {
        if (!cancelled) router.replace("/dashboard");
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthPending(true);

    try {
      const data = new FormData(event.currentTarget);
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");

      if (!email) {
        setAuthError("Enter your email.");
        return;
      }
      if (!password) {
        setAuthError("Enter your password.");
        return;
      }

      await apiLogin(email, password);
      router.replace("/dashboard");
      event.currentTarget.reset();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setAuthPending(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthPending(true);

    try {
      const data = new FormData(event.currentTarget);
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");

      if (!email) {
        setAuthError("Enter your email.");
        return;
      }

      if (password.length < 8) {
        setAuthError("Password must be at least 8 characters.");
        return;
      }

      const registerAs = (String(data.get("registerAs") || "owner") === "manager" ? "manager" : "owner") as RegisterAs;

      await apiRegister({
        registerAs,
        email,
        password,
        name: String(data.get("name") || ""),
        studioName: String(data.get("studioName") || ""),
        phone: String(data.get("phone") || ""),
        location: String(data.get("location") || ""),
        tagline: String(data.get("tagline") || ""),
        ownerEmail: String(data.get("ownerEmail") || ""),
      });

      router.replace("/dashboard");
      event.currentTarget.reset();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setAuthPending(false);
    }
  };

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <AuthScreen
      mode={authMode}
      onSwitchMode={switchMode}
      onLogin={handleLogin}
      onRegister={handleRegister}
      error={authError}
      pending={authPending}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
