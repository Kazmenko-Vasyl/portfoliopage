import { useRef } from "react";
import { useCodeRainReveal } from "../hooks/useCodeRainReveal";

interface Props {
  links: { href: string; label: string }[];
  onNavigate: () => void;
}

/**
 * The mobile menu: the hero's own code-rain reveal, over the frosted page.
 *
 * Same shader, same falling code, in the dark palette — with no pointer to
 * follow it falls back to the idle wander the hook already has, so the opening
 * drifts across the panel on its own.
 *
 * Mounted only while the menu is open, so the WebGL context is created and
 * released with it rather than idling behind a closed panel.
 */
export function HeaderMenu({ links, onNavigate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { canvasRef } = useCodeRainReveal(ref, { palette: "dark", ambient: true });

  return (
    <div id="header-menu" className="header__menu" ref={ref}>
      <canvas ref={canvasRef} className="header__menu-rain" />

      <nav className="header__menu-links">
        {links.map((link, i) => (
          <a key={link.href} href={link.href} onClick={onNavigate}>
            <span className="header__menu-index">{String(i + 1).padStart(2, "0")}</span>
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
