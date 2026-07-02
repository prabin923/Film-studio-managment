"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "../components/auth-screen";
import { apiLogin, apiMe, apiRegister } from "../lib/api-client";
import type { AuthMode, RegisterAs } from "../lib/types";

function readAuthModeFromUrl(): AuthMode {
  if (typeof window === "undefined") return "login";
  return new URLSearchParams(window.location.search).get("mode") === "register" ? "register" : "login";
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);

  useEffect(() => {
    setAuthMode(readAuthModeFromUrl());

    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google") {
      setAuthError(params.get("reason") || "Google sign-in failed. Try again or use your email and password.");
    }

    let cancelled = false;

    apiMe()
      .then(() => {
        if (!cancelled) router.replace("/dashboard");
      })
      .catch(() => {
        /* not signed in — show login form */
      });

    const onPopState = () => {
      if (!cancelled) setAuthMode(readAuthModeFromUrl());
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPopState);
    };
  }, [router]);

  const switchMode = useCallback(
    (next: AuthMode) => {
      setAuthMode(next);
      setAuthError("");
      const path = next === "register" ? "/login?mode=register" : "/login";
      router.replace(path, { scroll: false });
    },
    [router],
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthPending(true);

    const form = event.currentTarget;
    try {
      const data = new FormData(form);
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
      form.reset();
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

    const form = event.currentTarget;
    try {
      const data = new FormData(form);
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
      form.reset();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setAuthPending(false);
    }
  };

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
