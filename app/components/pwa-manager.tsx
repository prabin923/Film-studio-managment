"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaManager() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Register the service worker (production only — dev + HMR don't mix with SW caching).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Capture Android/Chrome's install prompt so we can offer our own button.
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Install WedStudio OS"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "1rem",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 0.75rem 0.6rem 1rem",
        borderRadius: "0.9rem",
        background: "#2563eb",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        maxWidth: "min(92vw, 26rem)",
      }}
    >
      <span style={{ fontSize: "0.9rem", lineHeight: 1.2 }}>Install WedStudio OS on your device</span>
      <button
        type="button"
        onClick={async () => {
          try {
            await installEvent.prompt();
            await installEvent.userChoice;
          } finally {
            setInstallEvent(null);
          }
        }}
        style={{
          background: "#fff",
          color: "#2563eb",
          border: "none",
          borderRadius: "0.6rem",
          padding: "0.4rem 0.8rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Install
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        style={{
          background: "transparent",
          color: "#fff",
          border: "none",
          fontSize: "1.1rem",
          cursor: "pointer",
          opacity: 0.85,
        }}
      >
        ×
      </button>
    </div>
  );
}
