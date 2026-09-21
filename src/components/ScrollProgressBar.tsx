import "./ScrollProgressBar.css";
import { useScrollProgress } from "../hooks/useScrollProgress";

/** The hairline at the top of the page showing how far down you are. */
export function ScrollProgressBar() {
  return <div ref={useScrollProgress()} className="scroll-progress" aria-hidden="true" />;
}
