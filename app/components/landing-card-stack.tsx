"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MERCURY_SHOWCASE, type MercuryShowcaseId } from "../lib/mercury-landing-content";
import { prefersReducedMotion } from "../lib/motion-utils";
import { LandingShowcasePreview } from "./landing-showcase-preview";

const STEP_LABELS = ["01", "02", "03", "04"] as const;

export function LandingCardStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeId = MERCURY_SHOWCASE[activeIndex]?.id ?? "book";

  const selectIndex = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    let frame = 0;
    let lastIdx = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollable = rect.height - vh * 0.35;
        if (scrollable <= 0) return;

        const progress = Math.max(0, Math.min(1, (vh * 0.4 - rect.top) / scrollable));
        const idx = Math.min(
          MERCURY_SHOWCASE.length - 1,
          Math.floor(progress * MERCURY_SHOWCASE.length),
        );
        if (idx !== lastIdx) {
          lastIdx = idx;
          setActiveIndex(idx);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="m-showcase-v2 m-section m-section--wide m-reveal">
      <div className="m-section__head">
        <p className="m-showcase-v2__eyebrow">How teams work</p>
        <h2>Studio ops used to be scattered. Now it&apos;s one workspace.</h2>
      </div>

      <div className="m-showcase-v2__sticky">
        <div className="m-showcase-v2__copy">
          <div className="m-showcase-v2__steps" role="tablist" aria-label="Studio workflows">
            {MERCURY_SHOWCASE.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                className={`m-showcase-v2__step${activeIndex === index ? " is-active" : ""}`}
                onClick={() => selectIndex(index)}
                onMouseEnter={() => selectIndex(index)}
              >
                <span className="m-showcase-v2__step-num" aria-hidden>
                  {STEP_LABELS[index]}
                </span>
                <span className="m-showcase-v2__step-body">
                  <span className="m-showcase-v2__step-title">{item.title}</span>
                  <span className="m-showcase-v2__step-desc">{item.description}</span>
                </span>
                <span className="m-showcase-v2__step-chevron" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="m-showcase-v2__stage" aria-live="polite">
          <div className="m-showcase-v2__glow" aria-hidden />
          <div className="m-showcase-v2__frame">
            <div className="m-showcase-v2__chrome" aria-hidden>
              <span className="m-showcase-v2__dot" />
              <span className="m-showcase-v2__dot" />
              <span className="m-showcase-v2__dot" />
              <span className="m-showcase-v2__chrome-title">WedStudio OS</span>
              <span className="m-showcase-v2__chrome-badge">
                {MERCURY_SHOWCASE[activeIndex]?.title}
              </span>
            </div>
            <div className="m-showcase-v2__previews">
              <LandingShowcasePreview
                key={activeId}
                id={activeId as MercuryShowcaseId}
                active
              />
            </div>
          </div>
          <div className="m-showcase-v2__progress" aria-hidden>
            {MERCURY_SHOWCASE.map((item, index) => (
              <span
                key={item.id}
                className={`m-showcase-v2__progress-dot${activeIndex === index ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="m-showcase-v2__spacer" aria-hidden />
    </section>
  );
}
