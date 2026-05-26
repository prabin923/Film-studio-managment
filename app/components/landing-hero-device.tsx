"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { AdminRevenueChart } from "./admin-dashboard";
import { ProjectCard } from "./project-card";
import { money } from "../lib/format";
import { prefersReducedMotion } from "../lib/anime-motion";
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
  const deviceRef = useRef<HTMLDivElement>(null);
  const screenInnerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const device = deviceRef.current;
    const screenInner = screenInnerRef.current;
    const hero = wrap?.closest(".m-hero");
    if (!wrap || !device || !screenInner || !hero) return;

    const reduced = prefersReducedMotion();

    if (!reduced) {
      animate(device, {
        y: [20, 0],
        opacity: [1, 1],
        duration: 900,
        delay: 200,
        ease: "out(4)",
      });

      animate(screenInner, {
        scale: [1.08, 1],
        duration: 1100,
        delay: 320,
        ease: "out(4)",
      });

      const glow = wrap.querySelector(".m-hero__device-glow");
      if (glow) {
        animate(glow, {
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 1200,
          delay: 350,
          ease: "out(3)",
        });
      }
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, 1 - rect.bottom / (vh * 1.1)));
        const zoom = 1 + progress * 0.08;
        const lift = progress * -12;

        screenInner.style.transform = reduced
          ? "scale(1)"
          : `scale(${zoom}) translate3d(0, ${progress * -4}px, 0)`;
        device.style.transform = reduced
          ? ""
          : `translate3d(0, ${lift}px, 0) rotateX(${tiltRef.current.x}deg) rotateY(${tiltRef.current.y}deg)`;
      });
    };

    const onMove = (e: MouseEvent) => {
      if (reduced) return;
      const rect = device.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      tiltRef.current = {
        x: Math.max(-5, Math.min(5, -dy * 4)),
        y: Math.max(-6, Math.min(6, dx * 5)),
      };
      onScroll();
    };

    const onLeave = () => {
      tiltRef.current = { x: 0, y: 0 };
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    device.addEventListener("mousemove", onMove);
    device.addEventListener("mouseleave", onLeave);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      device.removeEventListener("mousemove", onMove);
      device.removeEventListener("mouseleave", onLeave);
      screenInner.style.transform = "";
      device.style.transform = "";
    };
  }, []);

  return (
    <div className="m-hero__device-wrap m-hero__device-enter" ref={wrapRef}>
      <div className="m-hero__device-glow" aria-hidden />
      <div className="m-hero__device-perspective">
        <div className="m-hero__device" ref={deviceRef}>
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
  );
}
