import type { ReactNode } from "react";

/**
 * The five floating hero chips. Each opens a panel whose body is a small
 * looping demo of that part of the job — all five loops share a 4.4s bar so
 * they stay in sympathy with each other.
 */
export interface Capability {
  id: string;
  index: string;
  /** Lowercase label on the floating chip. */
  label: string;
  /** Sentence-case heading inside the panel. */
  title: string;
  caption: string;
  /** Drift keyframes + timing for the floating chip. */
  float: { name: "a" | "b" | "c"; duration: string; delay: string };
  /** The chip itself is filled with the accent rather than white. */
  filled?: boolean;
  Demo: () => ReactNode;
}

function DesignDemo() {
  return (
    <div className="demo demo--design">
      <div className="demo__stage">
        <div className="demo__measured">
          <span className="demo__measure demo__measure--left">12</span>
          <span className="demo__measure demo__measure--top">20</span>
          <span className="demo__measure-box" />
          <span className="demo__button">Get started</span>
        </div>
      </div>
      <div className="demo__spec">
        <span className="demo__spec-title">button / primary</span>
        <div className="demo__spec-row" style={{ animationDelay: "0.3s" }}>
          <span>label</span>
          <span className="demo__spec-value">Get started</span>
        </div>
        <div className="demo__spec-row" style={{ animationDelay: "0.9s" }}>
          <span>weight</span>
          <span className="demo__spec-value">600</span>
        </div>
        <div className="demo__spec-row" style={{ animationDelay: "1.5s" }}>
          <span>padding</span>
          <span className="demo__spec-value">12 / 20</span>
        </div>
        <div className="demo__spec-row demo__spec-row--last" style={{ animationDelay: "2.2s" }}>
          <span>fill</span>
          <span className="demo__spec-value demo__spec-fill">
            <span className="demo__swatch" />
            #C8FF3D
          </span>
        </div>
      </div>
    </div>
  );
}

function BuildDemo() {
  const lines: ReactNode[] = [
    <>
      <span className="tok-kw">export</span> <span className="tok-fn">function</span> Button({"{"}
    </>,
    <>
      {"  "}variant = <span className="tok-str">'primary'</span>,
    </>,
    <>{"  "}...rest</>,
    <>{"}"}) {"{"}</>,
    <>
      {"  "}
      <span className="tok-kw">return</span> &lt;button {"{...rest}"} /&gt;;
    </>,
    <>
      {"}"}
      <span className="demo__caret">▍</span>
    </>,
  ];

  return (
    <div className="demo demo--build">
      <div className="demo__code">
        {lines.map((line, i) => (
          <div key={i} className="demo__code-line" style={{ animationDelay: `${i * 0.5}s` }}>
            {line}
          </div>
        ))}
      </div>
      <div className="demo__render">
        <span className="demo__render-title">render</span>
        <span className="demo__variant demo__variant--primary" style={{ animationDelay: "2.6s" }}>
          primary
        </span>
        <span className="demo__variant demo__variant--ghost" style={{ animationDelay: "2.9s" }}>
          ghost
        </span>
        <span className="demo__variant demo__variant--disabled" style={{ animationDelay: "3.2s" }}>
          disabled
        </span>
      </div>
    </div>
  );
}

function ShipDemo() {
  const stages = ["commit", "test", "build", "deploy"];
  return (
    <div className="demo demo--ship">
      <div className="demo__stages">
        {stages.map((stage, i) => (
          <span key={stage} className="demo__stage-pill" style={{ animationDelay: `${i * 0.55}s` }}>
            {stage}
          </span>
        ))}
      </div>
      <div className="demo__progress">
        <div className="demo__progress-fill" />
      </div>
      <div className="demo__ship-footer">
        <span>42 tests · 0 failing</span>
        <span className="demo__live" style={{ animationDelay: "2.3s" }}>
          live in prod
        </span>
      </div>
    </div>
  );
}

function ScaleDemo() {
  const branches = [
    { name: "Button", note: "· base", tone: "muted" as const, delay: null },
    { name: "Button.Icon", note: "+ new", tone: "new" as const, delay: "0.6s" },
    { name: "Button.Split", note: "+ new", tone: "new" as const, delay: "1.2s" },
    { name: "Button.Menu", note: "+ new", tone: "new" as const, delay: "1.8s", last: true },
  ];

  return (
    <div className="demo demo--scale">
      <div className="demo__tree">
        <div>
          <span className="demo__branch">├─</span> App
        </div>
        {branches.map((b) => (
          <div
            key={b.name}
            className={"demo__node" + (b.delay ? " demo__node--pop" : "")}
            style={b.delay ? { animationDelay: b.delay } : undefined}
          >
            <span className="demo__branch">{b.last ? "└─" : "├─"}</span> {b.name}{" "}
            <span className={b.tone === "new" ? "demo__new" : "demo__muted"}>{b.note}</span>
          </div>
        ))}
      </div>
      <div className="demo__scale-footer">
        <span>one primitive</span>
        <span className="demo__new">3 variants, 0 rewrites</span>
      </div>
    </div>
  );
}

function ScratchDemo() {
  return (
    <div className="demo demo--scratch">
      <div className="demo__page">
        <div className="demo__sweep" />
        <span className="demo__empty">empty page</span>
        <div className="demo__page-body">
          <div className="demo__page-nav" style={{ animationDelay: "0.3s" }}>
            <span className="demo__brand">Acme</span>
            <span className="demo__nav-links">
              <span>work</span>
              <span>about</span>
              <span>contact</span>
            </span>
          </div>
          <div className="demo__headline" style={{ animationDelay: "0.9s" }}>
            Ship it this week.
          </div>
          <div className="demo__sub" style={{ animationDelay: "1.3s" }}>
            One page. Real content. No lorem ipsum.
          </div>
          <div className="demo__page-ctas" style={{ animationDelay: "1.8s" }}>
            <span className="demo__page-cta demo__page-cta--primary">Start</span>
            <span className="demo__page-cta">Docs</span>
          </div>
          <div className="demo__blocks" style={{ animationDelay: "2.4s" }}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export const CAPABILITIES: Capability[] = [
  {
    id: "design",
    index: "01",
    label: "design",
    title: "Design",
    caption:
      "We start from what your customer needs to do — book, buy, call — and design the shortest path to it.",
    float: { name: "a", duration: "9.5s", delay: "0s" },
    Demo: DesignDemo,
  },
  {
    id: "build",
    index: "02",
    label: "build",
    title: "Build",
    caption:
      "Built properly, not dropped onto a template. Quick on a phone, simple for you to edit, nothing that quietly breaks in six months.",
    float: { name: "b", duration: "11s", delay: "0.7s" },
    filled: true,
    Demo: BuildDemo,
  },
  {
    id: "ship",
    index: "03",
    label: "launch",
    title: "Launch",
    caption:
      "Domain, hosting, email, analytics — I set all of it up and hand you a site that is live and measurable.",
    float: { name: "c", duration: "10.2s", delay: "1.4s" },
    Demo: ShipDemo,
  },
  {
    id: "scale",
    index: "04",
    label: "grow",
    title: "Grow",
    caption:
      "Add a page, a product or a booking flow later without starting over. The site grows as the business does.",
    float: { name: "a", duration: "12s", delay: "2.1s" },
    Demo: ScaleDemo,
  },
  {
    id: "scratch",
    index: "05",
    label: "from scratch",
    title: "From scratch",
    caption:
      "No website at all yet? Blank page to live site — structure, words, photos. You do not need to have it worked out first.",
    float: { name: "b", duration: "10.8s", delay: "2.8s" },
    Demo: ScratchDemo,
  },
];
