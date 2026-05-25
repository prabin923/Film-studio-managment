import { animate, createTimeline, stagger, type JSAnimation } from "animejs";

type Cleanup = () => void;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function showInstant(elements: NodeListOf<Element> | Element[]) {
  elements.forEach((el) => {
    el.classList.add("is-visible");
    const node = el as HTMLElement;
    node.style.opacity = "1";
    node.style.transform = "none";
    node.style.filter = "none";
    if (node.classList.contains("landing-preview__bar-col--animate")) {
      const h = node.style.getPropertyValue("--bar-height").trim();
      if (h) node.style.height = h;
    }
    if (node.dataset.countTarget) {
      node.textContent = node.dataset.countTarget;
    }
  });
}

function animateCount(el: HTMLElement) {
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

  const obj = { val: 0 };
  animate(obj, {
    val: num,
    duration: 1200,
    ease: "out(4)",
    onUpdate: () => {
      const v = obj.val;
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

function playReveal(target: Element, played: WeakSet<Element>) {
  if (played.has(target)) return;
  played.add(target);
  target.classList.add("is-visible");

  if (target.classList.contains("landing-stats")) {
    animate(target.querySelectorAll(".landing-stat"), {
      opacity: [0, 1],
      y: [28, 0],
      scale: [0.94, 1],
      duration: 650,
      delay: stagger(70, { from: "center" }),
      ease: "out(4)",
    });
    return;
  }

  if (target.classList.contains("landing-features")) {
    const cards = target.querySelectorAll(".landing-feature");
    animate(cards, {
      opacity: [0, 1],
      y: [36, 0],
      scale: [0.92, 1],
      duration: 720,
      delay: stagger(90, { from: "first" }),
      ease: "out(4)",
    });
    const head = target.querySelector(".landing-section__head");
    if (head) {
      animate(head, { opacity: [0, 1], y: [20, 0], duration: 600, ease: "out(3)" });
    }
    return;
  }

  if (target.classList.contains("landing-built")) {
    const builtCopy = target.querySelector(".landing-built__copy");
    const builtPanel = target.querySelector(".landing-built__panel");
    if (builtCopy) {
      animate(builtCopy, { opacity: [0, 1], x: [-24, 0], duration: 700, ease: "out(3)" });
    }
    if (builtPanel) {
      animate(builtPanel, { opacity: [0, 1], x: [24, 0], duration: 700, ease: "out(3)" });
    }
    target.querySelectorAll<HTMLElement>("[data-count-target]").forEach((chip, i) => {
      setTimeout(() => animateCount(chip), i * 120);
    });
    return;
  }

  if (target.classList.contains("landing-steps")) {
    animate(target.querySelectorAll(".landing-step"), {
      opacity: [0, 1],
      x: [-20, 0],
      duration: 580,
      delay: stagger(120),
      ease: "out(3)",
    });
    return;
  }

  if (target.classList.contains("landing-workflows")) {
    animate(target.querySelectorAll(".landing-workflow"), {
      opacity: [0, 1],
      y: [24, 0],
      duration: 620,
      delay: stagger(100),
      ease: "out(3)",
    });
    return;
  }

  if (target.classList.contains("landing-platform")) {
    const platformInner = target.querySelector(".landing-platform__inner");
    if (platformInner) {
      animate(platformInner, { opacity: [0, 1], y: [28, 0], duration: 700, ease: "out(3)" });
    }
    animate(target.querySelectorAll(".landing-platform__card"), {
      opacity: [0, 1],
      scale: [0.94, 1],
      duration: 650,
      delay: stagger(120, { from: "center" }),
      ease: "out(4)",
    });
    const hub = target.querySelector(".landing-platform__bridge-hub");
    if (hub) {
      animate(hub, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 500,
        ease: "out(4)",
      });
    }
    return;
  }

  if (target.classList.contains("landing-faq")) {
    animate(target.querySelectorAll(".landing-faq__item"), {
      opacity: [0, 1],
      y: [16, 0],
      duration: 520,
      delay: stagger(70),
      ease: "out(3)",
    });
    return;
  }

  if (target.classList.contains("landing-section__head--solo")) {
    animate(target.children, {
      opacity: [0, 1],
      y: [18, 0],
      duration: 560,
      delay: stagger(80),
      ease: "out(3)",
    });
    return;
  }

  if (target.classList.contains("landing-cta__inner")) {
    animate(target.children, {
      opacity: [0, 1],
      y: [24, 0],
      scale: [0.96, 1],
      duration: 680,
      delay: stagger(100),
      ease: "out(4)",
    });
    return;
  }

  animate(target, {
    opacity: [0, 1],
    y: [28, 0],
    duration: 680,
    ease: "out(3)",
  });
}

function playMercuryReveal(target: Element, played: WeakSet<Element>) {
  if (played.has(target)) return;
  played.add(target);
  target.classList.add("is-visible");

  if (target.classList.contains("m-stats")) {
    animate(target.querySelectorAll(".m-stat"), {
      opacity: [0, 1],
      y: [32, 0],
      scale: [0.9, 1],
      duration: 700,
      delay: stagger(80, { from: "center" }),
      ease: "out(4)",
    });
    target.querySelectorAll<HTMLElement>(".m-stat__value[data-count-target]").forEach(
      (el, i) => setTimeout(() => animateCount(el), i * 100),
    );
    return;
  }

  if (target.classList.contains("m-workflows")) {
    animate(target.querySelectorAll(".m-workflow-card"), {
      opacity: [0, 1],
      y: [40, 0],
      scale: [0.92, 1],
      duration: 720,
      delay: stagger(100),
      ease: "out(4)",
    });
    return;
  }

  if (target.classList.contains("m-steps")) {
    animate(target.querySelectorAll(".m-step"), {
      opacity: [0, 1],
      y: [24, 0],
      scale: [0.96, 1],
      duration: 620,
      delay: stagger(90),
      ease: "out(4)",
    });
    return;
  }

  if (target.classList.contains("m-trust")) {
    animate(target.querySelectorAll(".m-trust__item"), {
      opacity: [0, 1],
      y: [20, 0],
      duration: 580,
      delay: stagger(80),
      ease: "out(3)",
    });
    return;
  }

  if (target.classList.contains("m-products")) {
    animate(target.querySelectorAll(".m-products__item"), {
      opacity: [0, 1],
      x: [-16, 0],
      duration: 600,
      delay: stagger(70),
      ease: "out(3)",
    });
    const visual = target.querySelector(".m-products__visual");
    if (visual) {
      animate(visual, { opacity: [0, 1], scale: [0.94, 1], duration: 800, ease: "out(4)" });
    }
    return;
  }

  animate(target, {
    opacity: [0, 1],
    y: [32, 0],
    scale: [0.96, 1],
    duration: 700,
    ease: "out(4)",
  });
}

export function initMercuryLandingAnimations(root: HTMLElement): Cleanup {
  const reduced = prefersReducedMotion();

  if (reduced) {
    showInstant(root.querySelectorAll(".m-hero__anim, .landing-nav--animate, .m-reveal"));
    root.classList.add("is-loaded");
    return () => {};
  }

  const loops: JSAnimation[] = [];
  const cleanups: Array<() => void> = [];
  const played = new WeakSet<Element>();

  const tl = createTimeline({ defaults: { ease: "out(3)" } });
  const nav = root.querySelector(".landing-nav--animate");
  if (nav) {
    tl.add(nav, { opacity: [0, 1], y: [-12, 0], duration: 480 }, 0);
  }

  const heroItems = root.querySelectorAll(".m-hero__anim");
  if (heroItems.length) {
    tl.add(heroItems, { opacity: [0, 1], y: [36, 0], duration: 900, delay: stagger(80) }, 120);
  }

  setTimeout(() => root.querySelector(".m-hero")?.classList.add("is-loaded"), 500);

  const heroBg = root.querySelector<HTMLElement>(".m-hero__bg [data-parallax]");
  if (heroBg) {
    const onScroll = () => {
      const y = window.scrollY * 0.25;
      heroBg.style.transform = `translate3d(0, ${y}px, 0) scale(1.05)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
  }

  const navEl = root.querySelector(".landing-nav");
  if (navEl) {
    const onNavScroll = () => {
      navEl.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
    cleanups.push(() => window.removeEventListener("scroll", onNavScroll));
  }

  const ctaGlow = root.querySelector(".m-cta-final__glow");
  if (ctaGlow) {
    loops.push(
      animate(ctaGlow, {
        scale: [1, 1.12, 1],
        opacity: [0.6, 1, 0.6],
        duration: 5000,
        ease: "inOutSine",
        loop: true,
      }),
    );
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playMercuryReveal(entry.target, played);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );

  root.querySelectorAll(".m-reveal").forEach((node) => observer.observe(node));
  cleanups.push(() => observer.disconnect());

  return () => {
    tl.pause();
    loops.forEach((a) => a.pause());
    cleanups.forEach((fn) => fn());
  };
}

export function initLandingAnimations(root: HTMLElement): Cleanup {
  if (root.classList.contains("landing--mercury")) {
    return initMercuryLandingAnimations(root);
  }
  const reduced = prefersReducedMotion();

  if (reduced) {
    showInstant(
      root.querySelectorAll(
        ".landing-hero__anim, .landing-nav--animate, .landing-orbit, .landing-reveal, [data-count-target]",
      ),
    );
    showInstant(root.querySelectorAll(".landing-preview__bar-col--animate"));
    return () => {};
  }

  const loops: JSAnimation[] = [];
  const cleanups: Array<() => void> = [];
  const played = new WeakSet<Element>();

  const tl = createTimeline({ defaults: { ease: "out(3)" } });

  const nav = root.querySelector(".landing-nav--animate");
  if (nav) {
    tl.add(nav, { opacity: [0, 1], y: [-14, 0], duration: 520 }, 0);
  }

  const heroItems = root.querySelectorAll(".landing-hero__copy .landing-hero__anim");
  if (heroItems.length) {
    tl.add(heroItems, { opacity: [0, 1], y: [32, 0], duration: 800, delay: stagger(70) }, 100);
  }

  const orbit = root.querySelector(".landing-orbit");
  if (orbit) {
    tl.add(
      orbit,
      { opacity: [0, 1], scale: [0.88, 1], duration: 1000, ease: "out(4)" },
      200,
    );
    const hub = orbit.querySelector(".landing-orbit__hub");
    if (hub) {
      loops.push(
        animate(hub, {
          boxShadow: [
            "0 0 0 0 rgba(99, 102, 241, 0.35)",
            "0 0 32px 8px rgba(99, 102, 241, 0.25)",
            "0 0 0 0 rgba(99, 102, 241, 0.35)",
          ],
          duration: 3200,
          ease: "inOutSine",
          loop: true,
        }),
      );
    }
    // Keep pills on their CSS orbit transforms; animating transform here causes overlap.
  }

  root.querySelectorAll<HTMLElement>(".landing-preview__bar-col--animate").forEach((bar, index) => {
    const targetHeight = bar.style.getPropertyValue("--bar-height").trim() || "50%";
    tl.add(
      bar,
      {
        height: ["0%", targetHeight],
        duration: 900,
        ease: "out(4)",
      },
      500 + index * 70,
    );
  });

  const preview = root.querySelector(".landing-preview--float");
  if (preview) {
    loops.push(
      animate(preview, {
        y: [0, -12],
        duration: 3000,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      }),
    );
  }

  const glows = root.querySelectorAll(".landing-glow");
  glows.forEach((glow, i) => {
    loops.push(
      animate(glow, {
        scale: [1, 1.08, 1],
        opacity: [0.5, 0.75, 0.5],
        duration: 5000 + i * 800,
        ease: "inOutSine",
        loop: true,
      }),
    );
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playReveal(entry.target, played);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  root.querySelectorAll(".landing-reveal").forEach((node) => observer.observe(node));
  cleanups.push(() => observer.disconnect());

  const parallaxTargets = root.querySelectorAll<HTMLElement>("[data-parallax]");
  if (parallaxTargets.length) {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const scrollY = window.scrollY;
        parallaxTargets.forEach((el) => {
          const speed = Number(el.dataset.parallax) || 0.15;
          el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
  }

  return () => {
    tl.pause();
    loops.forEach((anim) => anim.pause());
    cleanups.forEach((fn) => fn());

    root.querySelectorAll<HTMLElement>(
      ".landing-hero__anim, .landing-nav--animate, .landing-orbit",
    ).forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "";
      el.style.filter = "";
    });
    root.querySelectorAll<HTMLElement>(".landing-preview__bar-col--animate").forEach((bar) => {
      const h = bar.style.getPropertyValue("--bar-height").trim();
      if (h) bar.style.height = h;
    });
    root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      el.style.transform = "";
    });
  };
}

export function initAuthAnimations(root: HTMLElement): Cleanup {
  const reduced = prefersReducedMotion();

  if (reduced) {
    showInstant(root.querySelectorAll(".auth-aside, .auth-main, .auth-card"));
    return () => {};
  }

  const tl = createTimeline({ defaults: { ease: "out(3)" } });
  const aside = root.querySelector(".auth-aside");
  const main = root.querySelector(".auth-main");
  const card = root.querySelector(".auth-card");

  if (aside) {
    tl.add(aside, { opacity: [0, 1], x: [-32, 0], duration: 700 }, 0);
    const points = aside.querySelectorAll(".auth-points li");
    if (points.length) {
      tl.add(points, { opacity: [0, 1], x: [-16, 0], duration: 500, delay: stagger(90) }, 200);
    }
  }

  if (main) {
    tl.add(main, { opacity: [0, 1], y: [24, 0], duration: 680 }, 120);
  }

  if (card) {
    tl.add(card, { opacity: [0, 1], y: [16, 0], scale: [0.98, 1], duration: 600, ease: "out(4)" }, 280);
  }

  return () => {
    tl.pause();
    tl.revert();
  };
}

export function animateAuthCard(card: HTMLElement): Cleanup {
  if (prefersReducedMotion()) return () => {};

  const anim = animate(card, {
    opacity: [0.55, 1],
    y: [10, 0],
    scale: [0.99, 1],
    duration: 420,
    ease: "out(3)",
  });

  return () => {
    anim.pause();
    anim.revert();
  };
}

export function initAuthLoadingPulse(mark: HTMLElement): Cleanup {
  if (prefersReducedMotion()) return () => {};

  const anim = animate(mark, {
    scale: [1, 0.94, 1],
    opacity: [1, 0.88, 1],
    duration: 1400,
    ease: "inOutSine",
    loop: true,
  });

  return () => {
    anim.pause();
    anim.revert();
  };
}
