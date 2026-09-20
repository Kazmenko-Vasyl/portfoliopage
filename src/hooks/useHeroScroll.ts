import { useEffect, useRef } from "react";
import { TAGLINE } from "../data/site";

/** Typing speed, in ms per character. */
const TYPE_MS = 65;

/** The name is gone by this much of the track. */
const NAME_OUT = 0.1;

/** The lights go down across this stretch, and the typing starts after it. */
const DARK_FROM = 0.05;
const DARK_SPAN = 0.37;
const START = 0.4;

/** Hysteresis on the header's light/dark flip, so scrolling across the
 *  threshold cannot strobe it between the two colour schemes. */
const DARK_ON = 0.78;
const DARK_OFF = 0.22;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Drives the pinned hero as its tall track scrolls past. Scrolling fades the
 * name out and the lights down; once the screen is dark the statement types
 * itself in the middle, on its own clock.
 */
export function useHeroScroll() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const nameBlockRef = useRef<HTMLDivElement | null>(null);
  const statementRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // With motion reduced the track collapses to a single viewport (see
    // Hero.css), so there is no travel to map — leave the hero at rest.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let scrollRaf = 0;
    let clockRaf = 0;
    let typing = false;
    let typed = 0;
    let mark = 0;
    let inverted = false;

    const statement = () => {
      const host = statementRef.current;
      return host
        ? {
            text: host.querySelector<HTMLElement>("[data-typed]"),
            ghost: host.querySelector<HTMLElement>("[data-ghost]"),
            caret: host.querySelector<HTMLElement>("[data-caret]"),
          }
        : null;
    };

    /* The ghost half holds the characters still to come at
       `visibility: hidden`, so the block keeps its full size and nothing
       reflows as the caret travels across it. */
    const render = () => {
      const s = statement();
      if (s?.text && s.ghost) {
        s.text.textContent = TAGLINE.slice(0, typed);
        s.ghost.textContent = TAGLINE.slice(typed);
      }
      s?.caret?.classList.toggle("hero__caret--on", typing || typed > 0);
    };

    const tick = (now: number) => {
      clockRaf = 0;
      if (!typing) return;

      if (now - mark >= TYPE_MS) {
        mark = now;
        typed = Math.min(TAGLINE.length, typed + 1);
        render();
        if (typed === TAGLINE.length) {
          typing = false;
          return;
        }
      }
      clockRaf = requestAnimationFrame(tick);
    };

    const apply = () => {
      scrollRaf = 0;
      const track = trackRef.current;
      if (!track) return;

      const r = track.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = clamp01(-r.top / span);

      // The name and its tagline simply leave, right at the top of the scroll.
      const nameBlock = nameBlockRef.current;
      if (nameBlock) nameBlock.style.opacity = (1 - smoothstep(clamp01(p / NAME_OUT))).toFixed(3);

      // The lights go down over a long stretch: packed into a shorter run, a
      // single flick of a trackpad covers the whole fade and the hero appears
      // to snap from white to black.
      const dark = smoothstep(clamp01((p - DARK_FROM) / DARK_SPAN));
      const veil = veilRef.current;
      if (veil) veil.style.opacity = (dark * 0.94).toFixed(3);

      if (!inverted && dark > DARK_ON) inverted = true;
      else if (inverted && dark < DARK_OFF) inverted = false;

      // The fixed header sits above the veil in the root stacking context, so
      // it has to invert too or it goes dark-on-dark. Published as a document
      // attribute to keep Header decoupled from the hero. Gated on the track
      // still being in view, or the header would stay inverted over the white
      // sections below (dark stays pinned at 1 up there).
      document.documentElement.dataset.heroDark = r.bottom > 0 && inverted ? "1" : "0";

      const aside = asideRef.current;
      if (aside) aside.style.opacity = (1 - clamp01(p / 0.3)).toFixed(3);

      if (!typing && typed === 0 && p > START) {
        typing = true;
        mark = performance.now();
        render();
        if (!clockRaf) clockRaf = requestAnimationFrame(tick);
      } else if (typed > 0 && window.scrollY < 4) {
        // Only rewind at the very top of the page. Keying this off progress
        // instead meant a nudge upward — momentum, a trackpad, the rubber band
        // at the top — cleared the line and retyped it.
        if (clockRaf) cancelAnimationFrame(clockRaf);
        clockRaf = 0;
        typing = false;
        typed = 0;
        render();
      }
    };

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    render();
    apply();

    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (clockRaf) cancelAnimationFrame(clockRaf);
      window.removeEventListener("scroll", onScroll);
      delete document.documentElement.dataset.heroDark;
    };
  }, []);

  return { trackRef, nameBlockRef, statementRef, veilRef, asideRef };
}
