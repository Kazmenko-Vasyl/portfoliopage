import "./Marquee.css";

const ITEMS: { label: string; color: string }[] = [
  { label: "website design", color: "var(--hue-react)" },
  { label: "online stores", color: "var(--hue-ts)" },
  { label: "booking & enquiries", color: "var(--hue-next)" },
  { label: "landing pages", color: "var(--hue-ds)" },
  { label: "google search", color: "var(--hue-gl)" },
  { label: "page speed", color: "var(--accent-ink)" },
  { label: "mobile-first", color: "var(--hue-a11y)" },
  { label: "looking after it", color: "var(--hue-motion)" },
];

function MarqueeGroup({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <div className="marquee__group" aria-hidden={ariaHidden}>
      {ITEMS.map((item) => (
        <span key={item.label} style={{ color: item.color }}>
          {item.label}
          <span className="marquee__dot">·</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee__track">
        <MarqueeGroup />
        <MarqueeGroup aria-hidden />
      </div>
    </div>
  );
}
