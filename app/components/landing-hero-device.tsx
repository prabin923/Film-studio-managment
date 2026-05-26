"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
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
  const deviceRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const device = deviceRef.current;
    if (!device || prefersReducedMotion()) return;

    const onMove = (e: MouseEvent) => {
      const rect = device.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      tiltRef.current = {
        x: Math.max(-5, Math.min(5, -dy * 4)),
        y: Math.max(-6, Math.min(6, dx * 5)),
      };
      gsap.to(device, {
        rotateX: tiltRef.current.x,
        rotateY: tiltRef.current.y,
        duration: 0.35,
        ease: "power2.out",
        transformPerspective: 900,
      });
    };

    const onLeave = () => {
      tiltRef.current = { x: 0, y: 0 };
      gsap.to(device, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    device.addEventListener("mousemove", onMove);
    device.addEventListener("mouseleave", onLeave);

    return () => {
      device.removeEventListener("mousemove", onMove);
      device.removeEventListener("mouseleave", onLeave);
      gsap.set(device, { clearProps: "transform" });
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
                <div className="m-hero__screen-inner">
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
