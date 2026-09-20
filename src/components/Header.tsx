import "./Header.css";
import { useEffect, useRef, useState } from "react";
import { NAME, PHONE, PHONE_HREF } from "../data/site";

/** Lucide's `phone` glyph, inlined rather than pulling in the whole icon set. */
function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function CallButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={"header__call" + (open ? " header__call--open" : "")}>
      <button
        type="button"
        className="header__call-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Hide phone number" : "Show phone number"}
      >
        <PhoneIcon />
      </button>

      {/* Kept mounted so it can slide out, and kept out of the tab order and
          the accessibility tree while collapsed. */}
      <a
        className="header__call-number"
        href={PHONE_HREF}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
      >
        {PHONE}
      </a>

      {/* On a phone there is no room for a reveal and no reason for one —
          tapping should dial, not disclose. Swapped by media query so it
          survives rotation without re-rendering. */}
      <a className="header__call-direct" href={PHONE_HREF}>
        <PhoneIcon />
        <span>{PHONE}</span>
      </a>
    </div>
  );
}

export function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__dot" />
        <span className="header__name">{NAME}</span>
        <span>/ web design &amp; development</span>
      </div>
      <nav className="header__nav">
        <a href="#work">work</a>
        <a href="#stack">stack</a>
        <a href="#pricing">pricing</a>
        <a href="#contact">contact</a>
        <CallButton />
      </nav>
    </header>
  );
}
