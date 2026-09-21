import type { CSSProperties } from "react";

/** Deterministic 0..1 from an index, so the scatter is random-looking but
 *  identical on every render and every reload. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Where a shard ends up once the name has broken apart, in viewport units so
 * the spread holds at any screen size. Pieces carry on outward from where they
 * already sit — left-hand letters go left, right-hand letters go right — which
 * reads as the word coming apart rather than as letters being thrown about.
 */
function shard(i: number, count: number): CSSProperties {
  const fromCentre = (i + 0.5) / count - 0.5; // -0.5 .. 0.5
  const spread = 1.6 + noise(i) * 1.4;

  return {
    "--dx": (fromCentre * 150 * spread).toFixed(1),
    "--dy": ((noise(i + 7) - 0.45) * 130).toFixed(1),
    "--rot": ((noise(i + 13) - 0.5) * 120).toFixed(1),
    // Staggered so the word does not leave as one solid block.
    "--lag": (noise(i + 31) * 0.28).toFixed(3),
  } as CSSProperties;
}

interface Props {
  text: string;
}

/**
 * The hero name, cut into one frosted pane per letter. Scrolling drives
 * `--hero-break` on the hero, and each pane carries its own direction, so the
 * whole animation is CSS transforms off a single custom property rather than
 * per-frame writes to a dozen elements.
 *
 * Letters are grouped by word and each word is its own line: first name above,
 * surname below, at every width. Grouping is also what stops the surname being
 * split down the middle — each pane is an inline-block, and left to itself a
 * line may break between any two of those. See `.hero__name` in Hero.css for
 * the font size that keeps the longest word inside the screen.
 */
export function HeroName({ text }: Props) {
  const words = text.split(" ");
  let index = 0;
  const total = text.replace(/ /g, "").length;

  return (
    <h1 className="hero__name" aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className="hero__word">
          {[...word].map((char, c) => (
            <span key={c} className="hero__shard" style={shard(index++, total)} aria-hidden="true">
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
