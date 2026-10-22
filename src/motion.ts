import { useEffect } from "react";
import { flushSync } from "react-dom";
let transition: ViewTransition | null = null;
export function motionEnabled() {
  return (
    document.documentElement.dataset.motion !== "reduced" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
export function navigateWithMotion(update: () => void) {
  transition?.skipTransition();
  if (!motionEnabled() || !document.startViewTransition) {
    update();
    return;
  }
  transition = document.startViewTransition(() => {
    flushSync(update);
  });
  transition.finished.catch(() => {});
}
export function useMotion(reduced: boolean) {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      document.documentElement.dataset.motion =
        reduced || media.matches ? "reduced" : "normal";
      if (reduced || media.matches) {
        transition?.skipTransition();
        document.getAnimations().forEach((animation) => animation.cancel());
      }
      document.documentElement.dataset.performance =
        navigator.hardwareConcurrency <= 4 ? "economy" : "balanced";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [reduced]);
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (!motionEnabled() || document.hidden) continue;
          const el = entry.target as HTMLElement;
          const low =
            document.documentElement.dataset.performance === "economy";
          el.animate(
            [
              { opacity: 0, transform: `translateY(${low ? 5 : 14}px)` },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: low ? 150 : 340,
              delay: low ? 0 : Math.min(index++, 5) * 35,
              easing: "cubic-bezier(.16,1,.3,1)",
            },
          );
        }
      },
      { threshold: 0.06 },
    );
    let frame = 0;
    const scan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document
          .querySelectorAll(
            '.card,.drill,.agent-tile,[data-name="Últimas partidas"],[data-name="ECHO / análise"],[data-name="Sessão de hoje"]',
          )
          .forEach((el) => {
            if (!seen.has(el)) {
              seen.add(el);
              observer.observe(el);
            }
          });
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.getElementById("root")!, {
      subtree: true,
      childList: true,
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}
