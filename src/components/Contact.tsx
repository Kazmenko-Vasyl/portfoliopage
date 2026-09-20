import "./Contact.css";
import { CONTACT, NAME, PHONE, PHONE_HREF } from "../data/site";

export function Contact() {
  const year = new Date().getFullYear();

  return (
    <section id="contact" className="contact">
      <p className="contact__eyebrow">05 / contact</p>
      <h2 className="contact__title">Need a website for your business?</h2>

      <div className="contact__links">
        <a href={PHONE_HREF} className="contact__link contact__link--primary">
          call or text {PHONE}
        </a>
        <a href={`mailto:${CONTACT.email}`} className="contact__link contact__link--primary">
          {CONTACT.email}
        </a>
        <a href={CONTACT.github} className="contact__link" target="_blank" rel="noreferrer">
          github
        </a>
      </div>

      <div className="contact__footer">
        <span>
          {NAME} — web design &amp; development ·{" "}
          <a href={PHONE_HREF} className="contact__footer-phone">
            {PHONE}
          </a>
        </span>
        <span>built by hand · {year}</span>
      </div>
    </section>
  );
}
