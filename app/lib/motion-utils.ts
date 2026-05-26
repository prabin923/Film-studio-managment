export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function showInstantMercury(root: HTMLElement) {
  root.querySelectorAll(".m-hero__anim, .m-hero__device-enter, .landing-nav--animate, .m-reveal").forEach((el) => {
    el.classList.add("is-visible");
    const node = el as HTMLElement;
    node.style.opacity = "1";
    node.style.transform = "none";
  });
  root.querySelectorAll<HTMLElement>("[data-count-target]").forEach((el) => {
    if (el.dataset.countTarget) el.textContent = el.dataset.countTarget;
  });
  root.classList.add("is-loaded");
  root.querySelector(".m-hero")?.classList.add("is-hero-animated");
}
