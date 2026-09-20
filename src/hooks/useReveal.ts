import { useEffect, useRef, useState } from "react";

/**
 * Ports the DC prototype's `[data-reveal]` + IntersectionObserver behavior:
 * an element starts hidden/offset and animates in the first time it enters
 * the viewport, then stops observing.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    io.observe(el);

    // Catch elements already on-screen at mount (e.g. a fast initial layout).
    const timer = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) setVisible(true);
    }, 400);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return { ref, visible };
}
