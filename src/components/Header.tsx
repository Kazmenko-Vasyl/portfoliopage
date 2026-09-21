import "./Header.css";
import { useEffect, useState } from "react";
import { NAME, PHONE, PHONE_HREF } from "../data/site";
import { HeaderMenu } from "./HeaderMenu";

const LINKS = [
  { href: "#work", label: "work" },
  { href: "#stack", label: "stack" },
  { href: "#pricing", label: "pricing" },
  { href: "#contact", label: "contact" },
];

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

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    // The menu covers the whole screen, so the page behind it should not
    // scroll under the finger.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <header className={"header" + (open ? " header--open" : "")}>
      <div className="header__brand">
        <span className="header__dot" />
        <span className="header__name">{NAME}</span>
        <span>/ web design &amp; development</span>
      </div>

      <nav className="header__nav">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      {/* Icon only: the number is in the contact section, and here it just
          takes up room. The label is what carries it to screen readers. */}
      <a className="header__call" href={PHONE_HREF} aria-label={`Call or text ${PHONE}`}>
        <PhoneIcon />
      </a>

      <button
        type="button"
        className="header__burger"
        aria-expanded={open}
        aria-controls="header-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="header__burger-bar" />
        <span className="header__burger-bar" />
        <span className="header__burger-bar" />
      </button>

      {open && <HeaderMenu links={LINKS} onNavigate={() => setOpen(false)} />}
    </header>
  );
}
