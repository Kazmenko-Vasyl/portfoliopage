import { useEffect, useRef } from "react";

/**
 * Drives the pinned hero as its tall track scrolls past: the name grows and
 * flips to white, a dark veil fades up behind it, and the mono aside drops
 * away. Progress is 0 at the top of the track and 1 once the sticky section
 * has travelled its full extra height.
 */
export function useHeroScroll() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // With motion reduced the track collapses to a single viewport (see
    // Hero.css), so there is no travel to map — leave the hero in its resting
    // state rather than snapping it to the fully-scrolled one.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    // How far the name can grow before it runs off screen. The <h1> scales
    // about its bottom-left, so the limit depends on the text's own extents,
    // not the element box — with `line-height: 0.82` the glyphs overhang it.
    // Measured rather than hardcoded so it holds for any viewport or name.
    const GROWTH_CAP = 2.35;
    const MARGIN_X = 24;
    const MARGIN_TOP = 88; // clear the fixed header
    const MARGIN_BOTTOM = 16;
    let maxScale = GROWTH_CAP;

    const measure = () => {
      const name = nameRef.current;
      if (!name) return;

      const prev = name.style.transform;
      name.style.transform = "none";
      const host = name.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(name);
      const text = range.getBoundingClientRect();
      name.style.transform = prev;

      // transform-origin: left bottom, in viewport coordinates
      const ox = host.left;
      const oy = host.bottom;

      const limits = [GROWTH_CAP];
      const right = text.right - ox;
      if (right > 0) limits.push((window.innerWidth - MARGIN_X - ox) / right);
      const up = oy - text.top;
      if (up > 0) limits.push((oy - MARGIN_TOP) / up);
      const down = text.bottom - oy;
      if (down > 0) limits.push((window.innerHeight - MARGIN_BOTTOM - oy) / down);

      maxScale = Math.max(1, Math.min(...limits));
    };

    const apply = () => {
      raf = 0;
      const track = trackRef.current;
      const name = nameRef.current;
      if (!track || !name) return;

      const r = track.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));

      // grow the name over the first 80% of the track, smoothstepped
      const g = Math.min(1, p / 0.8);
      const ease = g * g * (3 - 2 * g);
      name.style.transform = `scale(${(1 + ease * (maxScale - 1)).toFixed(3)})`;

      // everything else goes dark; the name inverts to stay readable
      const dark = Math.min(1, Math.max(0, (p - 0.08) / 0.32));
      const veil = veilRef.current;
      if (veil) veil.style.opacity = (dark * 0.94).toFixed(3);
      name.style.color = dark > 0.5 ? "#FFFFFF" : "#0A0A0A";

      // The fixed header sits above the veil in the root stacking context, so
      // it has to invert too or it goes dark-on-dark. Published as a document
      // attribute to keep Header decoupled from the hero. Gated on the track
      // still being in view, or the header would stay inverted over the white
      // sections below (p, and therefore dark, stay pinned at 1 up there).
      const overHero = r.bottom > 0;
      document.documentElement.dataset.heroDark = overHero && dark > 0.5 ? "1" : "0";

      const aside = asideRef.current;
      if (aside && p > 0.02) {
        aside.style.opacity = String(Math.max(0, 1 - p / 0.4));
        aside.style.transform = `translateY(${(p * 26).toFixed(1)}px)`;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Wait for the webfont, or the cap is measured against a fallback face.
    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(() => {
      measure();
      apply();
    });

    measure();
    apply();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      delete document.documentElement.dataset.heroDark;
    };
  }, []);

  return { trackRef, nameRef, veilRef, asideRef };
}
