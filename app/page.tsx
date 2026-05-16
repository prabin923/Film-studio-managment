"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "./components/landing-page";
import { accountKey } from "./lib/seed";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(accountKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { email?: string; workspaceId?: string };
        if (parsed?.email && parsed?.workspaceId) {
          router.replace("/dashboard");
        }
      }
    } catch {
      window.localStorage.removeItem(accountKey);
    }
  }, [router]);

  return <LandingPage />;
}
