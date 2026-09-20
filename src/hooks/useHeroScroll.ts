import { useEffect, useRef } from "react";
import { NAME, TAGLINE } from "../data/site";

/** Cadence of the two passes, in ms per character. */
const ERASE_MS = 72;
const TYPE_MS = 48;
const PAUSE_MS = 280;

/** Scroll progress that arms the sequence, and the point it rewinds at. */
const START = 0.17;
const RESET = 0.05;

type Phase = "idle" | "erasing" | "pause" | "typing" | "done";

/**
 * Drives the pinned hero as its tall track scrolls past: a dark veil fades up,
 * the mono aside drops away, and the name deletes itself a character at a time
 * before the statement types out in the middle of the screen.
 *
 * Scroll position only arms the sequence — the typing runs on its own clock,
 * so it reads as something being written rather than something scrubbed back
 * and forth by the wheel.
 */
export function useHeroScroll() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const statementRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // With motion reduced the track collapses to a single viewport (see
    // Hero.css), so there is no travel to map — leave the hero at rest, name
    // intact, rather than snapping it to the fully-scrolled state.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let scrollRaf = 0;
    let clockRaf = 0;

    let phase: Phase = "idle";
    let shown = NAME.length; // characters of the name still on screen
    let typed = 0; // characters of the statement written so far
    let mark = 0; // timestamp of the last character
    let resumeAt = 0;

    const parts = (host: HTMLElement | null) =>
      host
        ? {
            text: host.querySelector<HTMLElement>("[data-typed]"),
            ghost: host.querySelector<HTMLElement>("[data-ghost]"),
            caret: host.querySelector<HTMLElement>("[data-caret]"),
          }
        : null;

    /* The ghost halves hold the not-yet-written characters at
       `visibility: hidden`, so both blocks keep their full size and nothing
       reflows as the caret travels. */
    const render = () => {
      const n = parts(nameRef.current);
      if (n?.text && n.ghost) {
        n.text.textContent = NAME.slice(0, shown);
        n.ghost.textContent = NAME.slice(shown);
      }
      n?.caret?.classList.toggle("hero__caret--on", phase === "erasing");

      const s = parts(statementRef.current);
      if (s?.text && s.ghost) {
        s.text.textContent = TAGLINE.slice(0, typed);
        s.ghost.textContent = TAGLINE.slice(typed);
      }
      s?.caret?.classList.toggle("hero__caret--on", phase === "typing" || phase === "done");

      const tagline = taglineRef.current;
      if (tagline) tagline.style.opacity = phase === "idle" ? "1" : "0";
    };

    const stopClock = () => {
      if (clockRaf) cancelAnimationFrame(clockRaf);
      clockRaf = 0;
    };

    const tick = (now: number) => {
      clockRaf = 0;

      if (phase === "erasing") {
        if (now - mark >= ERASE_MS) {
          mark = now;
          shown = Math.max(0, shown - 1);
          if (shown === 0) {
            phase = "pause";
            resumeAt = now + PAUSE_MS;
          }
          render();
        }
      } else if (phase === "pause") {
        if (now >= resumeAt) {
          phase = "typing";
          mark = now;
          render();
        }
      } else if (phase === "typing") {
        if (now - mark >= TYPE_MS) {
          mark = now;
          typed = Math.min(TAGLINE.length, typed + 1);
          if (typed === TAGLINE.length) phase = "done";
          render();
          if (phase === "done") return; // nothing left to animate
        }
      } else {
        return;
      }

      clockRaf = requestAnimationFrame(tick);
    };

    const startClock = () => {
      if (!clockRaf) clockRaf = requestAnimationFrame(tick);
    };

    const apply = () => {
      scrollRaf = 0;
      const track = trackRef.current;
      if (!track) return;

      const r = track.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));

      if (phase === "idle" && p > START) {
        phase = "erasing";
        mark = performance.now();
        render();
        startClock();
      } else if (phase !== "idle" && p < RESET) {
        // Back at the top: restore the name and clear the statement, so the
        // sequence plays in full on the way down rather than half-finished.
        stopClock();
        phase = "idle";
        shown = NAME.length;
        typed = 0;
        render();
      }

      // Everything behind the name goes dark, and the name inverts to stay
      // readable. This has to finish before START, or the statement types
      // white onto a background that is still light.
      const dark = Math.min(1, Math.max(0, (p - 0.03) / 0.14));
      const veil = veilRef.current;
      if (veil) veil.style.opacity = (dark * 0.94).toFixed(3);
      const name = nameRef.current;
      if (name) name.style.color = dark > 0.5 ? "#FFFFFF" : "#0A0A0A";

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
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    render();
    apply();

    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      stopClock();
      window.removeEventListener("scroll", onScroll);
      delete document.documentElement.dataset.heroDark;
    };
  }, []);

  return { trackRef, nameRef, taglineRef, statementRef, veilRef, asideRef };
}
