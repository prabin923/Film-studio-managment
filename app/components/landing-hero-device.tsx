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
  const laptopRef = useRef<HTMLDivElement>(null);
  const screenInnerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef({ lift: 0, scale: 1, zoom: 1, progress: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const laptop = laptopRef.current;
    const screenInner = screenInnerRef.current;
    const hero = wrap?.closest(".m-hero");
    if (!wrap || !laptop || !screenInner || !hero) return;

    const reduced = prefersReducedMotion();
    if (reduced) return;

    let scrollFrame = 0;

    const applyTransforms = () => {
      const { x: tiltX, y: tiltY } = tiltRef.current;
      const { lift, scale, zoom } = scrollRef.current;

      laptop.style.transform = [
        `perspective(1100px)`,
        `rotateX(${tiltX}deg)`,
        `rotateY(${tiltY}deg)`,
        `translate3d(0, ${lift}px, 0)`,
        `scale(${scale})`,
      ].join(" ");

      screenInner.style.transform = `scale(${zoom}) translate3d(0, ${scrollRef.current.progress * -4}px, 0)`;
    };

    const updateScroll = () => {
      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.bottom / (vh * 1.1)));

      scrollRef.current = {
        progress,
        zoom: 1 + progress * 0.1,
        lift: progress * -20,
        scale: 1 - progress * 0.03,
      };
      applyTransforms();
    };

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateScroll();
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = laptop.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      tiltRef.current = {
        x: Math.max(-10, Math.min(10, -dy * 8)),
        y: Math.max(-12, Math.min(12, dx * 10)),
      };
      applyTransforms();
    };

    const onPointerLeave = () => {
      tiltRef.current = { x: 0, y: 0 };
      applyTransforms();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);
    updateScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      laptop.style.transform = "";
      screenInner.style.transform = "";
    };
  }, []);

  return (
    <div className="m-hero__device-wrap" ref={wrapRef}>
      <div className="m-hero__device-enter">
        <div className="m-hero__device-glow" aria-hidden />
        <div className="m-hero__device-perspective">
          <div className="m-hero__device">
            <div className="m-hero__laptop" ref={laptopRef}>
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
