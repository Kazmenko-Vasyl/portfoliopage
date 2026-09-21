import { useEffect, useRef } from "react";

/** Drives the fixed hairline at the top of the page from page scroll position. */
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const apply = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
    };

    // Scroll fires far more often than the screen refreshes, and this writes a
    // style every time — so coalesce to one write per frame, as the hero's own
    // scroll handler does.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    apply();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return ref;
}
