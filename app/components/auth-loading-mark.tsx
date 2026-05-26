"use client";

import { useEffect, useRef } from "react";
import { initAuthLoadingPulse } from "../lib/gsap-auth";

export function AuthLoadingMark({ children = "WS" }: { children?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return initAuthLoadingPulse(node);
  }, []);

  return (
    <span ref={ref} className="auth-loading__mark" aria-hidden>
      {children}
    </span>
  );
}

