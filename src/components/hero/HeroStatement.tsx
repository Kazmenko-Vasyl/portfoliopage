interface Props {
  text: string;
  /** How many leading characters are written. */
  written: number;
}

/**
 * The line that writes itself across the middle of the hero as you scroll.
 *
 * The unwritten half stays in the document at `visibility: hidden` so the
 * paragraph holds its final size from the first character: without it every
 * new character could rewrap the block, and the text would shuffle about
 * underneath the caret.
 */
export function HeroStatement({ text, written }: Props) {
  return (
    <div className="hero__statement" aria-hidden="true">
      <p className="hero__statement-text">
        {text.slice(0, written)}
        {written > 0 && <span className="hero__caret" />}
        <span className="hero__ghost">{text.slice(written)}</span>
      </p>
    </div>
  );
}
