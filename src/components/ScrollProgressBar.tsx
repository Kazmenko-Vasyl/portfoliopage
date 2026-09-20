import { useScrollProgress } from "../hooks/useScrollProgress";

export function ScrollProgressBar() {
  const ref = useScrollProgress();
  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 2,
        width: "0%",
        background: "var(--accent)",
        zIndex: 60,
      }}
    />
  );
}
