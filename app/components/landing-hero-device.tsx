"use client";

import { useEffect, useRef } from "react";
import { AdminRevenueChart } from "./admin-dashboard";
import { ProjectCard } from "./project-card";
import { money } from "../lib/format";
import { prefersReducedMotion } from "../lib/motion-utils";
import { seed } from "../lib/seed";
import { Panel, PanelHead } from "./ui";

function HeroDashboardMini() {
  const client = seed.clients[0];
  const activeProjects = seed.clients.filter((c) => c.status !== "Delivered").length;
  const clientDue = seed.clients.reduce(
    (sum, item) => sum + item.packageAmount - item.paidAmount,
    0,
  );
  const netCash =
    seed.clients.reduce((s, i) => s + i.paidAmount, 0) +
    seed.rentals.reduce((s, i) => s + i.paidAmount, 0) -
    seed.expenses.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="m-hero-dashboard">
      <header className="m-hero-dashboard__bar" aria-hidden>
        <span className="m-hero-dashboard__dot" />
        <span className="m-hero-dashboard__dot" />
        <span className="m-hero-dashboard__dot" />
        <span className="m-hero-dashboard__title">WedStudio OS — Dashboard</span>
      </header>
      <div className="m-hero-dashboard__body">
        <section className="admin-metrics m-hero-dashboard__metrics" aria-hidden>
          <article className="admin-metric">
            <span className="admin-metric__label">Active projects</span>
            <strong className="admin-metric__value">{activeProjects}</strong>
          </article>
          <article className="admin-metric">
            <span className="admin-metric__label">Balance due</span>
            <strong className="admin-metric__value">{money(clientDue)}</strong>
          </article>
          <article className="admin-metric admin-metric--accent">
            <span className="admin-metric__label">Net cash</span>
            <strong className="admin-metric__value">{money(netCash)}</strong>
          </article>
        </section>
        <div className="m-hero-dashboard__chart">
          <AdminRevenueChart store={seed} />
        </div>
        <Panel className="admin-panel m-hero-dashboard__panel">
          <PanelHead title="Upcoming work" description="Latest booking" />
          <div className="project-list">
            <ProjectCard compact client={client} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function LandingHeroDevice() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const screenInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const screenInner = screenInnerRef.current;
    const hero = wrap?.closest(".m-hero");
    if (!wrap || !screenInner || !hero) return;

    const reduced = prefersReducedMotion();
    if (reduced) return;

    let scrollFrame = 0;

    const updateScroll = () => {
      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.bottom / (vh * 1.1)));

      // Only apply scroll-based lift/scale — tilt is handled by gsap-motion.ts
      screenInner.style.transform = `scale(${1 + progress * 0.1}) translate3d(0, ${progress * -4}px, 0)`;
    };

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateScroll();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      screenInner.style.transform = "";
    };
  }, []);

  return (
    <div className="m-hero__device-wrap" ref={wrapRef}>
      <div className="m-hero__device-enter">
        <div className="m-hero__device-glow" aria-hidden />
        <div className="m-hero__device-perspective">
          <div className="m-hero__device">
            <div className="m-hero__laptop">
              <div className="m-hero__laptop-camera" aria-hidden />
              <div className="m-hero__screen-bezel">
                <div className="m-hero__screen">
                  <div className="m-hero__screen-inner" ref={screenInnerRef}>
                    <HeroDashboardMini />
                  </div>
                  <div className="m-hero__screen-shine" aria-hidden />
                </div>
              </div>
              <div className="m-hero__laptop-hinge" aria-hidden />
              <div className="m-hero__laptop-base">
                <div className="m-hero__laptop-trackpad" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
