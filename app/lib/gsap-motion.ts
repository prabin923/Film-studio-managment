import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, showInstantMercury } from "./motion-utils";

type Cleanup = () => void;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function gsapCount(el: HTMLElement) {
  const target = el.dataset.countTarget;
  if (!target) return;

  const match = target.match(/^([+\s]*)(NPR\s*)?([\d.]+)(L|k)?$/i);
  if (!match) {
    el.textContent = target;
    return;
  }

  const prefix = match[1] || "";
  const currency = match[2] || "";
  const num = parseFloat(match[3]);
  const suffix = match[4] || "";
  if (Number.isNaN(num)) {
    el.textContent = target;
    return;
  }

  const state = { val: 0 };
  gsap.to(state, {
    val: num,
    duration: 0.9,
    ease: "power2.out",
    onUpdate: () => {
      const v = state.val;
      const display =
        suffix.toLowerCase() === "l"
          ? v >= 10
            ? `${v.toFixed(1)}L`
            : `${v.toFixed(2)}L`
          : suffix.toLowerCase() === "k"
            ? `${Math.round(v)}k`
            : String(Math.round(v));
      el.textContent = `${prefix}${currency}${display}`;
    },
  });
}

function animateRevealChildren(target: Element) {
  if (target.classList.contains("m-stats-bento") || target.classList.contains("m-stats")) {
    gsap.fromTo(
      target.querySelectorAll(".m-stat-card"),
      { y: 20, opacity: 0.6 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" },
    );
    target.querySelectorAll<HTMLElement>(".m-stat__value[data-count-target]").forEach((el, i) => {
      gsap.delayedCall(i * 0.08, () => gsapCount(el));
    });
    return;
  }

  if (target.classList.contains("m-workflows")) {
    gsap.fromTo(
      target.querySelectorAll(".m-workflow-card"),
      { y: 24, opacity: 0.6 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
    );
    return;
  }

  if (target.classList.contains("m-how")) {
    const intro = target.querySelector(".m-how__intro");
    if (intro) {
      gsap.fromTo(
        intro.children,
        { x: -12, opacity: 0.6 },
        { x: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    }
    gsap.fromTo(
      target.querySelectorAll(".m-how__item"),
      { x: 12, opacity: 0.6 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
    );
    return;
  }

  if (target.classList.contains("m-trust")) {
    gsap.fromTo(
      target.querySelectorAll(".m-trust__item"),
      { y: 16, opacity: 0.6 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
    );
    return;
  }

  if (target.classList.contains("m-products")) {
    gsap.fromTo(
      target.querySelectorAll(".m-products__item"),
      { x: -10, opacity: 0.6 },
      { x: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power2.out" },
    );
    return;
  }
}

export function initMercuryLandingAnimations(root: HTMLElement): Cleanup {
  if (prefersReducedMotion()) {
    showInstantMercury(root);
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  const ctx = gsap.context(() => {
    const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });

    const nav = root.querySelector(".landing-nav");
    if (nav) {
      gsap.set(nav, { opacity: 1 });
      heroTl.from(nav, { y: -10, duration: 0.4 }, 0);
    }

    const heroItems = root.querySelectorAll(".m-hero__copy-zone .m-hero__anim");
    if (heroItems.length) {
      gsap.set(heroItems, { opacity: 1 });
      heroTl.from(heroItems, { y: 16, duration: 0.55, stagger: 0.05 }, 0.06);
    }

    const deviceEnter = root.querySelector(".m-hero__device-enter");
    if (deviceEnter) {
      gsap.set(deviceEnter, { opacity: 1 });
      heroTl.from(deviceEnter, { y: 16, duration: 0.65, ease: "power3.out" }, 0.12);
    }

    heroTl.call(() => {
      root.querySelector(".m-hero")?.classList.add("is-loaded", "is-hero-animated");
    });

    const revealEls = gsap.utils.toArray<Element>(".m-reveal", root);
    revealEls.forEach((el) => el.classList.add("is-visible"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateRevealChildren(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -8% 0px" },
    );

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) animateRevealChildren(el);
      else observer.observe(el);
    });

    cleanups.push(() => observer.disconnect());

    const navEl = root.querySelector(".landing-nav");
    if (navEl) {
      const onNavScroll = () => navEl.classList.toggle("is-scrolled", window.scrollY > 24);
      window.addEventListener("scroll", onNavScroll, { passive: true });
      onNavScroll();
      cleanups.push(() => window.removeEventListener("scroll", onNavScroll));
    }
  }, root);

  return () => {
    ctx.revert();
    cleanups.forEach((fn) => fn());
    ScrollTrigger.getAll().forEach((st) => {
      if (root.contains(st.trigger as Node)) st.kill();
    });
  };
}
