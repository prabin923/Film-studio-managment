import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, showInstantMercury } from "./motion-utils";

type Cleanup = () => void;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Count-up animation ── */
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
    duration: 1.1,
    ease: "power4.out",
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

/* ── Reveal block animations ── */
function revealBlock(target: Element) {
  if (target.classList.contains("is-visible")) return;
  target.classList.add("is-visible");

  if (target.classList.contains("m-stats-bento") || target.classList.contains("m-stats")) {
    gsap.fromTo(
      target.querySelectorAll(".m-stat-card"),
      { y: 28, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.08, ease: "power4.out" },
    );
    target.querySelectorAll<HTMLElement>(".m-stat__value[data-count-target]").forEach((el, i) => {
      gsap.delayedCall(i * 0.1, () => gsapCount(el));
    });
    return;
  }

  if (target.classList.contains("m-workflows")) {
    gsap.fromTo(
      target.querySelectorAll(".m-workflow-card"),
      { y: 36, opacity: 0, rotateX: 6 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power4.out",
      },
    );
    return;
  }

  if (target.classList.contains("m-how")) {
    const intro = target.querySelector(".m-how__intro");
    if (intro) {
      gsap.fromTo(
        intro.children,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" },
      );
    }
    gsap.fromTo(
      target.querySelectorAll(".m-how__item"),
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power4.out" },
    );
    return;
  }

  if (target.classList.contains("m-trust")) {
    gsap.fromTo(
      target.querySelectorAll(".m-trust__item"),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.58, stagger: 0.08, ease: "power3.out" },
    );
    return;
  }

  if (target.classList.contains("m-products")) {
    gsap.fromTo(
      target.querySelectorAll(".m-products__item"),
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power3.out" },
    );
    const visual = target.querySelector(".m-products__visual");
    if (visual) {
      gsap.fromTo(
        visual,
        { opacity: 0, scale: 0.94, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: "power4.out", delay: 0.15 },
      );
    }
    return;
  }

  if (target.classList.contains("m-testimonials")) {
    gsap.fromTo(
      target,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power4.out" },
    );
    return;
  }

  if (target.classList.contains("m-showcase-v2")) {
    gsap.fromTo(
      target.querySelectorAll(".m-showcase-v2__eyebrow, .m-section__head h2"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" },
    );
    const steps = target.querySelectorAll(".m-showcase-v2__step");
    if (steps.length) {
      gsap.fromTo(
        steps,
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: "power3.out", delay: 0.1 },
      );
    }
    const stage = target.querySelector(".m-showcase-v2__stage");
    if (stage) {
      gsap.fromTo(
        stage,
        { opacity: 0, y: 32, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power4.out", delay: 0.2 },
      );
    }
    return;
  }

  if (target.classList.contains("m-section__head")) {
    gsap.fromTo(
      target.children,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" },
    );
    return;
  }

  if (target.classList.contains("m-faq")) {
    gsap.fromTo(
      target.querySelectorAll(".m-faq__item"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" },
    );
    return;
  }

  if (target.classList.contains("m-cta-final")) {
    gsap.fromTo(
      target.querySelectorAll("h2, p, .m-cta-final__actions"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power4.out" },
    );
    return;
  }

  gsap.fromTo(
    target,
    { y: 32, opacity: 0, scale: 0.97 },
    { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "power4.out" },
  );
}

/* ── 3D tilt for workflow cards ── */
function setupCardTilt(root: HTMLElement, cleanups: Array<() => void>) {
  const cards = root.querySelectorAll<HTMLElement>(".m-workflow-card");
  cards.forEach((card) => {
    const xTo = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power2.out" });
    const scaleTo = gsap.quickTo(card, "scale", { duration: 0.4, ease: "power2.out" });

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      xTo(x * 8);
      yTo(-y * 8);
      scaleTo(1.03);
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
      scaleTo(1);
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    cleanups.push(() => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
      gsap.set(card, { rotateX: 0, rotateY: 0, scale: 1 });
    });
  });
}

/* ── Smooth laptop tilt with GSAP quickTo ── */
function setupLaptopTilt(root: HTMLElement, cleanups: Array<() => void>) {
  const wrap = root.querySelector<HTMLElement>(".m-hero__device-wrap");
  const laptop = root.querySelector<HTMLElement>(".m-hero__laptop");
  if (!wrap || !laptop) return;

  const rxTo = gsap.quickTo(laptop, "rotateX", { duration: 0.6, ease: "power3.out" });
  const ryTo = gsap.quickTo(laptop, "rotateY", { duration: 0.6, ease: "power3.out" });

  const handleMove = (e: PointerEvent) => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    rxTo(Math.max(-10, Math.min(10, -dy * 8)));
    ryTo(Math.max(-12, Math.min(12, dx * 10)));
  };

  const handleLeave = () => {
    rxTo(0);
    ryTo(0);
  };

  wrap.addEventListener("pointermove", handleMove);
  wrap.addEventListener("pointerleave", handleLeave);
  cleanups.push(() => {
    wrap.removeEventListener("pointermove", handleMove);
    wrap.removeEventListener("pointerleave", handleLeave);
    gsap.set(laptop, { rotateX: 0, rotateY: 0 });
  });
}

/* ── FAQ smooth accordion ── */
function setupFaqAccordion(root: HTMLElement, cleanups: Array<() => void>) {
  const items = root.querySelectorAll<HTMLDetailsElement>(".m-faq__item");
  items.forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector("p");
    if (!summary || !content) return;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();

      if (details.open) {
        details.classList.add("m-faq__item--animating");
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power3.inOut",
          onComplete: () => {
            details.open = false;
            details.classList.remove("m-faq__item--animating");
            gsap.set(content, { height: "", opacity: "" });
          },
        });
      } else {
        details.open = true;
        details.classList.add("m-faq__item--animating");
        const fullHeight = content.scrollHeight;
        gsap.fromTo(
          content,
          { height: 0, opacity: 0 },
          {
            height: fullHeight,
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
            onComplete: () => {
              details.classList.remove("m-faq__item--animating");
              gsap.set(content, { height: "", opacity: "" });
            },
          },
        );
      }
    };

    summary.addEventListener("click", handleClick);
    cleanups.push(() => summary.removeEventListener("click", handleClick));
  });
}

/* ── Main entry point ── */
export function initMercuryLandingAnimations(root: HTMLElement): Cleanup {
  if (prefersReducedMotion()) {
    showInstantMercury(root);
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  /* ── Nav scroll ── */
  const navEl = root.querySelector(".landing-nav");
  if (navEl) {
    const onNavScroll = () => {
      navEl.classList.toggle("is-scrolled", window.scrollY > 16);
    };
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
    cleanups.push(() => window.removeEventListener("scroll", onNavScroll));
  }

  const ctx = gsap.context(() => {
    /* ── Scroll progress bar ── */
    const progressBar = root.querySelector(".m-scroll-progress");
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }

    /* ── Hero timeline ── */
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const nav = root.querySelector(".landing-nav");
    if (nav) {
      heroTl.from(nav, { opacity: 0, y: -14, duration: 0.5 }, 0);
    }

    const heroItems = root.querySelectorAll(".m-hero__copy-zone .m-hero__anim");
    if (heroItems.length) {
      heroTl.from(
        heroItems,
        { opacity: 0, y: 28, duration: 0.75, stagger: 0.07, ease: "power4.out" },
        0.1,
      );
    }

    const deviceEnter = root.querySelector(".m-hero__device-enter");
    if (deviceEnter) {
      heroTl.from(
        deviceEnter,
        { opacity: 0, y: 32, scale: 0.94, duration: 0.85, ease: "power4.out" },
        0.2,
      );
    }

    const screenInner = root.querySelector(".m-hero__screen-inner");
    if (screenInner) {
      heroTl.from(screenInner, { scale: 1.1, duration: 1, ease: "power4.out" }, 0.35);
    }

    const deviceGlow = root.querySelector(".m-hero__device-glow");
    if (deviceGlow) {
      heroTl.from(deviceGlow, { opacity: 0, scale: 0.88, duration: 1, ease: "power3.out" }, 0.38);
    }

    heroTl.call(() => {
      root.querySelector(".m-hero")?.classList.add("is-loaded", "is-hero-animated");
    });

    /* ── Hero background parallax (single trigger) ── */
    const heroBg = root.querySelector<HTMLElement>(".m-hero__bg [data-parallax]");
    if (heroBg) {
      ScrollTrigger.create({
        trigger: root.querySelector(".m-hero") ?? root,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
        onUpdate: (self) => {
          gsap.set(heroBg, { y: self.progress * 60, scale: 1.05 });
        },
      });
    }

    /* ── CTA glow pulse (CSS handles this via keyframes, GSAP just as fallback) ── */
    const ctaGlow = root.querySelector(".m-cta-final__glow");
    if (ctaGlow) {
      gsap.to(ctaGlow, {
        scale: 1.1,
        opacity: 1,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }

    /* ── Scroll-triggered reveals ── */
    const revealEls = gsap.utils.toArray<Element>(".m-reveal", root);
    const revealTriggers = ScrollTrigger.batch(revealEls, {
      start: "top 85%",
      once: true,
      onEnter: (batch) => batch.forEach((el) => revealBlock(el)),
    });
    cleanups.push(() => revealTriggers.forEach((st) => st.kill()));

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) revealBlock(el);
    });

    /* ── Interactive effects ── */
    setupCardTilt(root, cleanups);
    setupLaptopTilt(root, cleanups);
    setupFaqAccordion(root, cleanups);

    ScrollTrigger.refresh();
  }, root);

  return () => {
    ctx.revert();
    cleanups.forEach((fn) => fn());
  };
}
