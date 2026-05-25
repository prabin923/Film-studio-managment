"use client";

import { useCallback, useEffect, useState } from "react";
import { MERCURY_TESTIMONIALS } from "../lib/mercury-landing-content";
import { prefersReducedMotion } from "../lib/anime-motion";

export function LandingTestimonials() {
  const [index, setIndex] = useState(0);
  const count = MERCURY_TESTIMONIALS.length;

  const goTo = useCallback((i: number) => {
    setIndex(((i % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, 6000);
    return () => window.clearInterval(id);
  }, [count]);

  return (
    <div className="m-testimonials m-reveal">
      <div
        className="m-testimonials__track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {MERCURY_TESTIMONIALS.map((t) => (
          <article key={t.name} className="m-testimonial">
            <p className="m-testimonial__tag">{t.tag}</p>
            <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
            <footer className="m-testimonial__author">
              <strong>{t.name}</strong>
              {t.role}
            </footer>
          </article>
        ))}
      </div>
      <div className="m-testimonials__dots" role="tablist" aria-label="Testimonials">
        {MERCURY_TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={index === i}
            className={`m-testimonials__dot${index === i ? " is-active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
