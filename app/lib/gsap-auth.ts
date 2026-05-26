import gsap from "gsap";
import { prefersReducedMotion } from "./motion-utils";

type Cleanup = () => void;

/**
 * Initializes premium GSAP animations for the entire auth shell.
 * Includes stagger stethoscopes for the aside descriptions, checklist cards, right-hand forms,
 * floating background glow circles, and mouse-parallax interaction.
 */
export function initAuthAnimations(root: HTMLElement): Cleanup {
  if (prefersReducedMotion()) {
    root.querySelectorAll(".auth-aside, .auth-main, .auth-card").forEach((el) => {
      const node = el as HTMLElement;
      node.style.opacity = "1";
      node.style.transform = "none";
    });
    return () => {};
  }

  // Define clear timeline
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  const aside = root.querySelector(".auth-aside") as HTMLElement;
  const main = root.querySelector(".auth-main") as HTMLElement;
  const card = root.querySelector(".auth-card") as HTMLElement;

  // Stagger entry for left panel text components
  if (aside) {
    tl.fromTo(
      aside,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.9 },
      0
    );

    const asideTexts = aside.querySelectorAll(".auth-kicker, h1, .auth-lead");
    if (asideTexts.length) {
      tl.fromTo(
        asideTexts,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.1 },
        0.2
      );
    }

    const points = aside.querySelectorAll(".auth-points li");
    if (points.length) {
      tl.fromTo(
        points,
        { opacity: 0, y: 25, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.08, ease: "power4.out" },
        0.4
      );
    }
  }

  // Stagger entry for right panel UI components
  if (main) {
    tl.fromTo(
      main,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      0.15
    );

    const mainHeader = main.querySelectorAll(".auth-home-link, .auth-theme-slot, .auth-tabs");
    if (mainHeader.length) {
      tl.fromTo(
        mainHeader,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 },
        0.3
      );
    }
  }

  // Entrance slide + bounce for the auth card container
  if (card) {
    tl.fromTo(
      card,
      { opacity: 0, y: 35, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" },
      0.45
    );
  }

  // --- Background Glow Orbs floating animation ---
  const glowOrbs = root.querySelectorAll(".auth-aside__glow");
  const floatingTweens: gsap.core.Tween[] = [];

  glowOrbs.forEach((orb) => {
    // Generate organic random paths for each circle using yoyo & sine ease
    const tween = gsap.to(orb, {
      x: () => gsap.utils.random(-45, 45),
      y: () => gsap.utils.random(-45, 45),
      scale: () => gsap.utils.random(0.9, 1.2),
      duration: () => gsap.utils.random(9, 14),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      overwrite: "auto",
    });
    floatingTweens.push(tween);
  });

  // --- Retro Film Reels Spin ---
  const reels = root.querySelectorAll(".char-film-reel");
  if (reels.length) {
    const reelTween = gsap.to(reels, {
      rotate: 360,
      duration: 10,
      repeat: -1,
      ease: "none",
      transformOrigin: "center center",
    });
    floatingTweens.push(reelTween);
  }

  // --- Floating bobbing items ---
  const floatingItems = root.querySelectorAll(".char-floating-item");
  floatingItems.forEach((item, i) => {
    const bob = gsap.to(item, {
      y: -12,
      duration: 2.2 + i * 0.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: i * 0.15,
    });
    floatingTweens.push(bob);
  });

  // --- Mouse pupil tracking & aside glow parallax ---
  const lensPupil = root.querySelector(".char-lens-pupil") as HTMLElement;

  const handleMouseMove = (e: MouseEvent) => {
    if (!aside) return;
    const rect = aside.getBoundingClientRect();
    // Coordinates relative to center of the aside panel
    const xVal = e.clientX - rect.left - rect.width / 2;
    const yVal = e.clientY - rect.top - rect.height / 2;

    // Aside Glow Parallax
    glowOrbs.forEach((orb, index) => {
      const depth = (index + 1) * 0.08; // Different layers have distinct movement speeds
      gsap.to(orb, {
        transform: `translate3d(${xVal * depth}px, ${yVal * depth}px, 0)`,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    // Camera iris tracking (limited to 8px bound radius)
    if (lensPupil) {
      const angle = Math.atan2(yVal, xVal);
      const dist = Math.min(8, Math.sqrt(xVal * xVal + yVal * yVal) / 25);
      const pupilX = Math.cos(angle) * dist;
      const pupilY = Math.sin(angle) * dist;

      gsap.to(lensPupil, {
        x: pupilX,
        y: pupilY,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  if (aside) {
    aside.addEventListener("mousemove", handleMouseMove);
  }

  return () => {
    tl.kill();
    floatingTweens.forEach((t) => t.kill());
    if (aside) {
      aside.removeEventListener("mousemove", handleMouseMove);
    }
  };
}

/**
 * Creates an elegant interactive 3D Tilt perspective effect on the Auth form card.
 * Rotating the card around the X and Y axis depending on the cursor position relative to the card.
 */
export function animateAuthCard(card: HTMLElement): Cleanup {
  if (prefersReducedMotion()) return () => {};

  // Simple card introduction
  gsap.fromTo(
    card,
    { opacity: 0.7, scale: 0.99 },
    { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
  );

  const handleCardMouseMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    
    // Position of the cursor relative to card center
    const x = e.clientX - rect.left - cardWidth / 2;
    const y = e.clientY - rect.top - cardHeight / 2;

    // Constrain standard tilting angle to an elegant max of 4.5 degrees
    const rX = -(y / (cardHeight / 2)) * 4.5;
    const rY = (x / (cardWidth / 2)) * 4.5;

    gsap.to(card, {
      rotateX: rX,
      rotateY: rY,
      transformPerspective: 1000,
      boxShadow: "0 22px 40px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)",
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleCardMouseLeave = () => {
    // Gracefully restore flat position on mouse leave
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      boxShadow: "var(--shadow-md)",
      duration: 0.75,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  card.addEventListener("mousemove", handleCardMouseMove);
  card.addEventListener("mouseleave", handleCardMouseLeave);

  return () => {
    card.removeEventListener("mousemove", handleCardMouseMove);
    card.removeEventListener("mouseleave", handleCardMouseLeave);
    // Reset rotations and parameters
    gsap.set(card, {
      rotateX: 0,
      rotateY: 0,
      transformPerspective: "none",
    });
  };
}

/**
 * Triggers a premium staggered, scale-up entrance timeline on form fields.
 * Invoked seamlessly when switching tabs (Login vs Register) or selecting roles (Owner vs Manager).
 */
export function animateFormFields(container: HTMLElement): void {
  if (prefersReducedMotion()) return;

  const elements = container.querySelectorAll(
    ".auth-form__intro h2, .auth-form__intro p, .register-role-picker, .field, .auth-form__legend, .auth-hint, .auth-form__submit, .auth-form__switch"
  );

  if (elements.length) {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 12, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.04,
        ease: "power2.out",
        overwrite: "auto",
      }
    );
  }
}

/**
 * Creates a beautiful, slow breathing animation on the core login loading brand badge.
 */
export function initAuthLoadingPulse(mark: HTMLElement): Cleanup {
  if (prefersReducedMotion()) return () => {};

  const anim = gsap.fromTo(
    mark,
    { scale: 1, opacity: 1 },
    {
      scale: 0.93,
      opacity: 0.84,
      duration: 0.85,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      overwrite: "auto",
    }
  );

  return () => {
    anim.kill();
  };
}
