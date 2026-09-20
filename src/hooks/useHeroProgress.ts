import { useEffect, useRef, useState } from "react";

/** Where the name has finished fading out. */
const NAME_OUT = 0.1;

/** The stretch the lights go down over. Long on purpose: packed into a shorter
 *  run, one flick of a trackpad covers the whole fade in a single frame and it
 *  reads as a flash rather than a fade. */
const DARK_FROM = 0.05;
const DARK_SPAN = 0.37;

/** The stretch the line is written over. */
const TYPE_FROM = 0.4;
const TYPE_SPAN = 0.45;

/** Hysteresis on the header's light/dark flip, so scrolling across the
 *  threshold cannot strobe it between the two colour schemes. */
const DARK_ON = 0.78;
const DARK_OFF = 0.22;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

interface HeroProgress {
  /** Wraps the pinned hero; its extra height is the scroll distance. */
  trackRef: React.RefObject<HTMLDivElement>;
  /** The pinned section itself, which carries the published custom properties. */
  heroRef: React.RefObject<HTMLElement>;
  /** How many characters of the line are written at this scroll position. */
  written: number;
}

/**
 * Maps scroll position over the hero's track to the state the hero draws from.
 *
 * Continuous values — the veil, the fades — are published as custom properties
 * on the hero element, so they update every frame without re-rendering and the
 * mapping to opacity lives in CSS. Only the character count is React state,
 * because it changes a few dozen times rather than every frame.
 *
 * @param charCount characters in the line being written
 */
export function useHeroProgress(charCount: number): HeroProgress {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [written, setWritten] = useState(0);

  useEffect(() => {
    // With motion reduced the track collapses to a single viewport (see
    // Hero.css), so there is no travel to map — leave the hero at rest.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let inverted = false;

    const apply = () => {
      frame = 0;
      const track = trackRef.current;
      const hero = heroRef.current;
      if (!track || !hero) return;

      const box = track.getBoundingClientRect();
      const travel = Math.max(1, box.height - window.innerHeight);
      const p = clamp01(-box.top / travel);

      const dark = smoothstep(clamp01((p - DARK_FROM) / DARK_SPAN));
      hero.style.setProperty("--hero-veil", (dark * 0.94).toFixed(3));
      hero.style.setProperty("--hero-name", (1 - smoothstep(clamp01(p / NAME_OUT))).toFixed(3));
      hero.style.setProperty("--hero-aside", (1 - clamp01(p / 0.3)).toFixed(3));

      setWritten(Math.round(clamp01((p - TYPE_FROM) / TYPE_SPAN) * charCount));

      if (!inverted && dark > DARK_ON) inverted = true;
      else if (inverted && dark < DARK_OFF) inverted = false;

      // The fixed header sits above the veil in the root stacking context, so
      // it has to invert too or it goes dark-on-dark. Published as a document
      // attribute to keep Header decoupled from the hero, and gated on the
      // track still being in view — otherwise the header stays inverted over
      // the white sections below, where `dark` remains pinned at 1.
      document.documentElement.dataset.heroDark = box.bottom > 0 && inverted ? "1" : "0";
    };

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
      delete document.documentElement.dataset.heroDark;
    };
  }, [charCount]);

  return { trackRef, heroRef, written };
}
