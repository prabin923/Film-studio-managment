"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { ORBIT_MODULES, orbitPosition } from "../lib/landing-content";

type LandingHeroVisualProps = {
  onModuleSelect?: (id: string) => void;
};

export function LandingHeroVisual({ onModuleSelect }: LandingHeroVisualProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const active = ORBIT_MODULES.find((m) => m.id === activeId) ?? ORBIT_MODULES[0];

  const select = useCallback(
    (id: string) => {
      setActiveId(id);
      onModuleSelect?.(id);
    },
    [onModuleSelect],
  );

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return (
    <div
      className="landing-orbit landing-hero__anim"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resume();
      }}
    >
      <div className="landing-orbit__glow" aria-hidden />
      <div className="landing-orbit__ring landing-orbit__ring--outer" aria-hidden />
      <div className="landing-orbit__ring landing-orbit__ring--inner" aria-hidden />

      <div className="landing-orbit__hub" aria-hidden>
        <span className="landing-orbit__hub-mark">WS</span>
        <span className="landing-orbit__hub-label">Studio ledger</span>
      </div>

      <ul
        className={`landing-orbit__nodes${paused ? " is-paused" : ""}`}
        role="list"
        aria-label="Studio modules"
      >
        {ORBIT_MODULES.map((mod, index) => {
          const pos = orbitPosition(index, ORBIT_MODULES.length);
          const isActive = activeId === mod.id || (!activeId && index === 0);
          return (
            <li
              key={mod.id}
              className={`landing-orbit__node landing-orbit__node--${mod.tone}${isActive ? " is-active" : ""}`}
              style={pos as CSSProperties}
            >
              <button
                type="button"
                className="landing-orbit__pill"
                aria-pressed={isActive}
                aria-label={`${mod.label}: ${mod.blurb}`}
                onClick={() => select(mod.id)}
                onFocus={() => select(mod.id)}
              >
                {mod.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="landing-orbit__detail" role="status" aria-live="polite">
        <p className="landing-orbit__detail-label">{active.label}</p>
        <p className="landing-orbit__detail-text">{active.blurb}</p>
        <a href={active.href} className="landing-orbit__detail-link">
          Explore module →
        </a>
      </div>
    </div>
  );
}
