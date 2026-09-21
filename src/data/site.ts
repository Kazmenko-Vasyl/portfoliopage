export const NAME = "Vasyl Kazmenko";
/** Registered on the Google Business Profile. Google cross-checks this against
 *  the site, so the two have to match exactly. */
export const BUSINESS = "Kazmenko Web Development";
/** Where the business profile says it works. */
export const AREA = "Feasterville-Trevose, PA";
export const ROLE = "software developer @ fiserv";
export const TAGLINE = "I design and build websites that look sharp and work hard.";

/** Decorative backdrop behind the hero, sitting under the code-rain reveal. */
export const HERO_BACKDROP = "/hero.webp";

/** Background-removed portrait you land on at the end of the name portal. */
export const PORTRAIT = "/portrait.webp";

export interface Project {
  index: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  /** 16:10 screenshot in public/. Omit to fall back to the striped placeholder. */
  shot?: string;
}

export const PROJECTS: Project[] = [
  {
    index: "001",
    title: "Woodi Bed",
    description:
      "A Philadelphia woodworking studio that needed a storefront worthy of the craft. Loads in a quarter of a second, works on any phone, and takes new collections without a redesign.",
    tags: ["online store", "mobile-first", "fast"],
    url: "https://woodi-bed.com/",
    shot: "/work-woodi.webp",
  },
  {
    index: "002",
    title: "Löyly USA",
    description:
      "A rental business that lives or dies on bookings. Clear pricing, simple dates, and a short path from landing on the page to reserving a day.",
    tags: ["bookings", "landing page", "photography"],
    url: "https://www.loylyusa.com/",
    shot: "/work-loyly.webp",
  },
  {
    index: "003",
    title: "Marchuk Law",
    description:
      "A law firm where trust is the entire pitch. Plain structure, credible design, and two clicks from visitor to booked consultation.",
    tags: ["lead generation", "local search"],
    url: "https://www.marchuklaw.com/",
    shot: "/work-marchuk.webp",
  },
];

export interface Tier {
  name: string;
  /** Shown as "from $X" — the floor, not the quote. */
  from: string;
  blurb: string;
  includes: string[];
  /** Visually lead with this one. */
  featured?: boolean;
}

// Edit these to taste — this array is the only place prices live.
export const PRICING: Tier[] = [
  {
    name: "Simple site",
    from: "$150",
    blurb: "A few sections that say who you are and how to reach you.",
    includes: [
      "One page, or a handful of sections",
      "Your words and photos, arranged properly",
      "Set up for Google and link previews",
      "Live in about a week",
    ],
  },
  {
    name: "Business website",
    from: "$450",
    blurb: "The full site — everything a customer needs before they get in touch.",
    includes: [
      "Several pages, designed for your brand",
      "Local search and analytics from day one",
      "Contact and enquiry forms",
      "You can edit the content yourself",
    ],
    featured: true,
  },
  {
    name: "Store or booking",
    from: "$1,000",
    blurb: "When the site has to take money or manage a calendar.",
    includes: [
      "Payments, availability or a product catalogue",
      "An admin area to run it day to day",
      "Automatic confirmation emails",
      "Built to add products and pages later",
    ],
  },
];

/** Reassurance strip under the pricing tiers. */
export const PRICING_PROMISES: string[] = [
  "No monthly fee to me",
  "No hidden costs",
  "One price, agreed up front",
  "Yours to keep — no lock-in",
];

/** The "person behind it" facts grid. */
export const FACTS: { label: string; value: string }[] = [
  { label: "day job", value: "Software developer at Fiserv" },
  { label: "i build", value: "Websites, start to finish" },
  { label: "so far", value: "Furniture, sauna rental, law" },
  { label: "you get", value: "One developer, start to finish" },
];

export const PHONE = "267-902-9839";
/** tel: links need the digits only, with country code. */
export const PHONE_HREF = "tel:+12679029839";

export const CONTACT = {
  email: "kazmenkovasya@gmail.com",
  github: "https://github.com/Kazmenko-Vasyl",
  linkedin: "https://www.linkedin.com/in/vasyl-kazmenko-4172ab1a6/",
};
