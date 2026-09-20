import { useEffect, useRef } from "react";

/**
 * Drives the pinned hero as its tall track scrolls past: the name swings up
 * into a vertical rail down the left edge, the tagline takes the middle of the
 * screen, a dark veil fades up behind both, and the mono aside drops away.
 * Progress is 0 at the top of the track and 1 once the sticky section has
 * travelled its full extra height.
 */
export function useHeroScroll() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // With motion reduced the track collapses to a single viewport (see
    // Hero.css), so there is no travel to map — leave the hero in its resting
    // state rather than snapping it to the fully-scrolled one.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const RAIL_X = 22; // gutter between the rotated name and the left edge
    const RAIL_GAP = 20; // clearance between that rail and the tagline
    const EDGE_Y = 92; // top/bottom clearance, enough to miss the header
    const EDGE_X = 24;
    const TAGLINE_MAX_SCALE = 1.55;

    // Resting geometry, remeasured on resize. Everything below is derived from
    // the text's own box rather than the element's: `line-height: 0.82` means
    // the glyphs overhang the <h1>, so its rect is the wrong thing to rotate.
    let name1 = { tx: 0, ty: 0, scale: 1 };
    let tag1 = { tx: 0, ty: 0, scale: 1 };

    const measure = () => {
      const name = nameRef.current;
      const tagline = taglineRef.current;
      if (!name || !tagline) return;

      const prevName = name.style.transform;
      const prevTag = tagline.style.transform;
      name.style.transform = "none";
      tagline.style.transform = "none";

      const host = name.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(name);
      const text = range.getBoundingClientRect();
      const tag = tagline.getBoundingClientRect();

      name.style.transform = prevName;
      tagline.style.transform = prevTag;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // rotate(-90deg) maps (x, y) to (y, -x): the text's width becomes its
      // height, so it is the viewport height the name has to be scaled to fit.
      const spanX = Math.max(1, text.width);
      const spanY = Math.max(1, text.height);
      const scale = Math.min(1, (vh - 2 * EDGE_Y) / spanX);

      // Pivot on the middle of the text, not the element's bottom-left: the
      // <h1> box is much wider than the words and a corner pivot swings them
      // off the top of the screen halfway through the turn.
      const cx = text.left + spanX / 2;
      const cy = text.top + spanY / 2;
      name.style.transformOrigin = `${(cx - host.left).toFixed(1)}px ${(cy - host.top).toFixed(1)}px`;

      name1 = {
        scale,
        // rotated about its centre the text is spanY wide, so its left edge
        // sits half that to the left of the pivot
        tx: RAIL_X - cx + (spanY * scale) / 2,
        ty: vh / 2 - cy,
      };

      // The tagline centres in what is left once the rail is taken out.
      const railRight = RAIL_X + spanY * scale + RAIL_GAP;
      const avail = Math.max(120, vw - EDGE_X - railRight);
      const tScale = Math.max(1, Math.min(TAGLINE_MAX_SCALE, avail / Math.max(1, tag.width)));

      tag1 = {
        scale: tScale,
        tx: railRight + avail / 2 - (tag.left + tag.width / 2),
        ty: vh / 2 - (tag.top + tag.height / 2),
      };
    };

    const apply = () => {
      raf = 0;
      const track = trackRef.current;
      const name = nameRef.current;
      const tagline = taglineRef.current;
      if (!track || !name || !tagline) return;

      const r = track.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));

      // The swing plays out over the first 80% of the track, smoothstepped, so
      // it has settled before the About section arrives.
      const g = Math.min(1, p / 0.8);
      const e = g * g * (3 - 2 * g);

      name.style.transform =
        `translate(${(name1.tx * e).toFixed(1)}px, ${(name1.ty * e).toFixed(1)}px) ` +
        `rotate(${(-90 * e).toFixed(2)}deg) scale(${(1 + (name1.scale - 1) * e).toFixed(3)})`;

      // Held back slightly so the name starts moving first and the tagline
      // arrives into space the name has already left.
      const t = Math.min(1, Math.max(0, (p - 0.1) / 0.6));
      const te = t * t * (3 - 2 * t);
      tagline.style.transform =
        `translate(${(tag1.tx * te).toFixed(1)}px, ${(tag1.ty * te).toFixed(1)}px) ` +
        `scale(${(1 + (tag1.scale - 1) * te).toFixed(3)})`;

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

    // Wait for the webfont, or the geometry is measured against a fallback face.
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

  return { trackRef, nameRef, taglineRef, veilRef, asideRef };
}
