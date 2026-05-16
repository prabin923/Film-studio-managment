"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthScreen } from "../components/auth-screen";
import { getStoredAccount, saveAccountToRegistry } from "../lib/accounts";
import { accountKey, seed } from "../lib/seed";
import type { Account, AuthMode, Store } from "../lib/types";
import {
  accountFromWorkspace,
  authenticateLogin,
  createWorkspace,
  getWorkspace,
  getWorkspaceManager,
  loadWorkspaceStore,
  migrateRegistryAccounts,
  saveWorkspaceStore,
} from "../lib/workspaces";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    migrateRegistryAccounts();
    try {
      const saved = window.localStorage.getItem(accountKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Account;
        if (parsed?.email && parsed.workspaceId) {
          router.replace("/dashboard");
          return;
        }
      }
    } catch {
      window.localStorage.removeItem(accountKey);
    }
    setChecking(false);
  }, [router]);

  useEffect(() => {
    setAuthMode(searchParams.get("mode") === "register" ? "register" : "login");
  }, [searchParams]);

  const completeSession = (nextAccount: Account, workspaceStore: Store) => {
    saveWorkspaceStore(nextAccount.workspaceId, workspaceStore);
    window.localStorage.setItem(accountKey, JSON.stringify(nextAccount));
    router.push("/dashboard");
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
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

      const result = authenticateLogin(email, password);
      if (!result.ok) {
        setAuthError(result.error);
        return;
      }

      completeSession(result.account, result.store);
      event.currentTarget.reset();
    } finally {
      setAuthPending(false);
    }
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
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

      const registerAs = String(data.get("registerAs") || "owner");

      if (registerAs === "manager") {
        const ownerEmail = String(data.get("ownerEmail") || "").trim().toLowerCase();
        if (!ownerEmail) {
          setAuthError("Enter the studio owner email.");
          return;
        }
        if (getStoredAccount(email)) {
          setAuthError("This manager email is already registered. Sign in instead.");
          return;
        }

        const ownerAccount = getStoredAccount(ownerEmail);
        if (!ownerAccount || ownerAccount.role !== "owner") {
          setAuthError("No owner workspace found for that email. Register the owner first.");
          return;
        }

        const workspace = getWorkspace(ownerAccount.workspaceId);
        if (!workspace) {
          setAuthError("Studio workspace not found. Ask the owner to register again.");
          return;
        }

        const existingManager = getWorkspaceManager(workspace.id);
        if (existingManager) {
          setAuthError("This studio already has a manager. Sign in with that manager email.");
          return;
        }

        const managerAccount = accountFromWorkspace(workspace, {
          name: String(data.get("name") || ""),
          email,
          role: "manager",
        });

        saveAccountToRegistry({ ...managerAccount, password });
        const workspaceStore = loadWorkspaceStore(workspace.id) ?? seed;
        completeSession(managerAccount, workspaceStore);
        event.currentTarget.reset();
        return;
      }

      if (getStoredAccount(email)) {
        setAuthError("This email is already registered. Sign in instead.");
        return;
      }

      const workspace = createWorkspace({
        studioName: String(data.get("studioName") || ""),
        phone: String(data.get("phone") || ""),
        location: String(data.get("location") || ""),
        tagline: String(data.get("tagline") || ""),
        ownerEmail: email,
      });

      const ownerAccount = accountFromWorkspace(workspace, {
        name: String(data.get("name") || ""),
        email,
        role: "owner",
      });

      saveAccountToRegistry({ ...ownerAccount, password });
      const workspaceStore = loadWorkspaceStore(workspace.id) ?? seed;
      completeSession(ownerAccount, workspaceStore);
      event.currentTarget.reset();
    } finally {
      setAuthPending(false);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <AuthScreen
      mode={authMode}
      setMode={setAuthMode}
      onModeChange={() => setAuthError("")}
      onLogin={handleLogin}
      onRegister={handleRegister}
      error={authError}
      pending={authPending}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
