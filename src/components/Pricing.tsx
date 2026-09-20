import "./Pricing.css";
import { PRICING, PRICING_PROMISES } from "../data/site";
import { Reveal } from "./Reveal";

export function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="pricing__head">
        <h2 className="pricing__title">What it costs</h2>
        <p className="pricing__eyebrow">04 / pricing</p>
      </div>

      <div className="pricing__grid">
        {PRICING.map((tier, i) => (
          <Reveal
            key={tier.name}
            delay={i * 0.08}
            className={"pricing__tier" + (tier.featured ? " pricing__tier--featured" : "")}
          >
            <p className="pricing__tier-name">{tier.name}</p>

            <p className="pricing__price">
              <span className="pricing__from">from</span>
              <span className="pricing__amount">{tier.from}</span>
            </p>

            <p className="pricing__blurb">{tier.blurb}</p>

            <ul className="pricing__includes">
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <ul className="pricing__promises">
        {PRICING_PROMISES.map((promise) => (
          <li key={promise} className="pricing__promise">
            {promise}
          </li>
        ))}
      </ul>

      <p className="pricing__note">
        Every project is quoted properly once I know what it needs — these are starting points,
        not a menu. Hosting and a domain run about $20 a month and stay in your name.{" "}
        <a href="#contact" className="pricing__link">
          Tell me what you have in mind →
        </a>
      </p>
    </section>
  );
}
