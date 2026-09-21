import "./AboutPage.css";
import { FACTS, PORTRAIT } from "../data/site";

/**
 * Full-bleed split: the photograph runs to three edges of the section and the
 * diagonal is where it meets the accent panel, so the two halves interlock
 * instead of a rectangle floating over a decorative wedge behind it.
 */
export function AboutPage() {
  return (
    <section className="about-page">
      <img
        className="about-page__photo"
        src={PORTRAIT}
        alt="Vasyl Kazmenko"
        width={900}
        height={1200}
        loading="lazy"
        decoding="async"
      />

      <div className="about-page__panel">
        <p className="about-page__kicker">the person behind it</p>
        <h2 className="about-page__title">A developer, not an agency.</h2>

        <dl className="about-page__facts">
          {FACTS.map((fact) => (
            <div key={fact.label} className="about-page__fact">
              <dt className="about-page__fact-label">{fact.label}</dt>
              <dd className="about-page__fact-value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
