import type { ComponentPropsWithoutRef, CSSProperties, ElementType } from "react";
import { useReveal } from "../hooks/useReveal";

type RevealOwnProps<T extends ElementType> = {
  as?: T;
  /** Transition delay in seconds, to stagger multiple reveals. */
  delay?: number;
};

type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T> | "ref">;

/** Generic version of the prototype's `[data-reveal]` fade/slide-up-on-scroll block. */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, visible } = useReveal<HTMLElement>();

  const revealStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity .8s ${delay}s cubic-bezier(.2,.7,.2,1), transform .8s ${delay}s cubic-bezier(.2,.7,.2,1)`,
    ...style,
  };

  return <Tag ref={ref} style={revealStyle} {...rest} />;
}
