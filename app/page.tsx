"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "./components/landing-page";
import { apiMe } from "./lib/api-client";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    apiMe()
      .then(() => router.replace("/dashboard"))
      .catch(() => {});
  }, [router]);

  return <LandingPage />;
}
