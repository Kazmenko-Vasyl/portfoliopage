import "./Hero.css";
import { useEffect, useRef, useState } from "react";
import { HERO_BACKDROP, NAME, ROLE, TAGLINE } from "../../data/site";
import { useCodeRainReveal } from "../../hooks/useCodeRainReveal";
import { useHeroScroll } from "../../hooks/useHeroScroll";
import { Reveal } from "../Reveal";
import { CAPABILITIES } from "./capabilities";
import { CapabilityPanel } from "./CapabilityPanel";

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { canvasRef, ringRef } = useCodeRainReveal(sectionRef);
  const { trackRef, nameBlockRef, statementRef, veilRef, asideRef } = useHeroScroll();
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const open = CAPABILITIES.find((c) => c.id === openId) ?? null;

  return (
    <div className="hero-track" ref={trackRef}>
      <section className="hero" ref={sectionRef}>
        <img className="hero__backdrop" src={HERO_BACKDROP} alt="" aria-hidden="true" />
        <div className="hero__scrim" />

        <canvas ref={canvasRef} className="hero__rain" />

        <div ref={veilRef} className="hero__veil" />

        {open && <CapabilityPanel capability={open} onClose={() => setOpenId(null)} />}

        {/* Duplicates the tagline, so it is hidden from assistive tech —
            the real one is in the name block below. */}
        <div ref={statementRef} className="hero__statement" aria-hidden="true">
          <p className="hero__statement-text">
            <span data-typed />
            <span className="hero__caret" data-caret />
            <span className="hero__ghost" data-ghost>
              {TAGLINE}
            </span>
          </p>
        </div>

        <div ref={ringRef} className="hero__ring">
          <span className="hero__ring-label">under the hood</span>
        </div>

        <div className="hero__content">
          <Reveal className="hero__kicker-wrap">
            <p className="hero__kicker">{ROLE}</p>
          </Reveal>

          <div className="hero__chips">
            {CAPABILITIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="hero__chip"
                style={{
                  animationName: `om-float-${c.float.name}`,
                  animationDuration: c.float.duration,
                  animationDelay: c.float.delay,
                }}
                onClick={() => setOpenId(c.id)}
                aria-haspopup="dialog"
              >
                <span className={"hero__chip-face" + (c.filled ? " hero__chip-face--filled" : "")}>
                  <span className="hero__chip-index">{c.index}</span>
                  <span className="hero__chip-label">{c.label}</span>
                  <span className="hero__chip-arrow">→</span>
                </span>
              </button>
            ))}
          </div>

          <div className="hero__bottom">
            <Reveal className="hero__name-block">
              <div ref={nameBlockRef} className="hero__name-fade">
                <h1 className="hero__name">{NAME}</h1>
                <p className="hero__tagline">{TAGLINE}</p>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="hero__aside-wrap">
              <div ref={asideRef} className="hero__aside">
                <p className="hero__desc">
                  Payments software at Fiserv by day, websites for businesses by night. Designed
                  properly, quick on a phone, and easy for you to keep up to date.
                </p>
                <div className="hero__ctas">
                  <a href="#work" className="hero__cta hero__cta--primary">
                    see the work
                  </a>
                  <a href="#contact" className="hero__cta hero__cta--ghost">
                    get in touch
                  </a>
                </div>
                <p className="hero__hint">move your cursor to look inside</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
