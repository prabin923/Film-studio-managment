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
    if (node.classList.contains("landing-preview__bar-col--animate")) {
      const h = node.style.getPropertyValue("--bar-height").trim();
      if (h) node.style.height = h;
    }
  });
}

export function initLandingAnimations(root: HTMLElement): Cleanup {
  const reduced = prefersReducedMotion();

  if (reduced) {
    showInstant(root.querySelectorAll(".landing-hero__anim, .landing-nav--animate, .landing-reveal"));
    showInstant(root.querySelectorAll(".landing-preview__bar-col--animate"));
    return () => {};
  }

  const loops: JSAnimation[] = [];
  const tl = createTimeline({ defaults: { ease: "out(3)" } });

  const nav = root.querySelector(".landing-nav--animate");
  if (nav) {
    tl.add(nav, { opacity: [0, 1], y: [-14, 0], duration: 520 }, 0);
  }

  const heroItems = root.querySelectorAll(".landing-hero__anim");
  if (heroItems.length) {
    tl.add(heroItems, { opacity: [0, 1], y: [28, 0], duration: 780, delay: stagger(75) }, 80);
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
      420 + index * 70,
    );
  });

  const preview = root.querySelector(".landing-preview--float");
  if (preview) {
    loops.push(
      animate(preview, {
        y: [0, -10],
        duration: 2800,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      }),
    );
  }

  const metric = root.querySelector(".landing-preview__metric--pulse");
  if (metric) {
    loops.push(
      animate(metric, {
        opacity: [1, 0.65, 1],
        duration: 2400,
        ease: "inOutSine",
        loop: true,
      }),
    );
  }

  const played = new WeakSet<Element>();

  const playReveal = (target: Element) => {
    if (played.has(target)) return;
    played.add(target);
    target.classList.add("is-visible");

    if (target.classList.contains("landing-stats")) {
      animate(target.querySelectorAll(".landing-stat"), {
        opacity: [0, 1],
        y: [20, 0],
        duration: 580,
        delay: stagger(65),
        ease: "out(3)",
      });
      return;
    }

    animate(target, {
      opacity: [0, 1],
      y: [22, 0],
      duration: 640,
      ease: "out(3)",
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playReveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
  );

  root.querySelectorAll(".landing-reveal").forEach((node) => observer.observe(node));

  return () => {
    tl.pause();
    tl.revert();
    loops.forEach((anim) => {
      anim.pause();
      anim.revert();
    });
    observer.disconnect();
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
