import "./ShortVersion.css";
import { Reveal } from "./Reveal";

const CARDS = [
  {
    eyebrow: "who you are hiring",
    delay: 0,
    body: (
      <>
        By day I build payments software at <span className="short-version__accent">Fiserv</span> —
        where a slow page costs real money. Your site is held to the same standard.
      </>
    ),
  },
  {
    eyebrow: "how it works",
    delay: 0.08,
    body: "You deal with me, start to finish. No account managers, no handoffs, and no template you will outgrow in a year.",
  },
  {
    eyebrow: "what you end up with",
    delay: 0.16,
    body: "A site designed around your business — not a template with your logo on it — that loads fast, you can update yourself, and turns up when people search.",
  },
];

const STATS = [
  { value: "7", label: "businesses online" },
  { value: "9+", label: "years building" },
  { value: "1", label: "developer, start to finish" },
];

export function ShortVersion() {
  return (
    <section className="short-version">
      <div className="short-version__intro">
        <p className="short-version__eyebrow">01 / the short version</p>
        <h2 className="short-version__title">Made to look good. Built to work.</h2>
      </div>

      <div className="short-version__cards">
        {CARDS.map((card) => (
          <Reveal key={card.eyebrow} delay={card.delay} className="short-version__card">
            <p className="short-version__card-eyebrow">{card.eyebrow}</p>
            <p className="short-version__card-body">{card.body}</p>
          </Reveal>
        ))}

        <div className="short-version__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="short-version__stat">
              <p className="short-version__stat-value">{stat.value}</p>
              <p className="short-version__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
