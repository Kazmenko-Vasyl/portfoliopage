import "./Toolkit.css";

const GROUPS = [
  {
    label: "the site",
    items: ["Designed for your brand", "Fast on a phone", "Easy for you to edit", "Yours to keep"],
  },
  {
    label: "getting found",
    items: ["Set up for Google", "Local search", "Proper link previews", "Analytics from day one"],
  },
  {
    label: "after launch",
    items: ["Changes when you need them", "New pages & features", "A direct line to me", "No lock-in"],
  },
  {
    label: "under the hood",
    items: ["TypeScript & React", "Secure hosting", "Backups", "Accessible by default"],
  },
];

export function Toolkit() {
  return (
    <section id="stack" className="toolkit">
      <div className="toolkit__head">
        <h2 className="toolkit__title">What you get</h2>
        <p className="toolkit__eyebrow">03 / included</p>
      </div>
      <div className="toolkit__grid">
        {GROUPS.map((group) => (
          <div key={group.label} className="toolkit__group">
            <p className="toolkit__group-label">{group.label}</p>
            <div className="toolkit__items">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
