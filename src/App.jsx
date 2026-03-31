import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import siteData from "./content/generated/site-data.json";

const baseDescription =
  "Chat with AI characters on mochii — your cozy space for immersive, personalized conversations with unique AI personas. Start chatting for free today.";

const routeMeta = {
  "/": {
    title: "mochii - AI Character Chat",
    description: baseDescription,
  },
  "/privacy": {
    title: "Privacy Policy for Mochii",
    description:
      "Learn how Mochii collects, uses, shares, and protects data, including AI processing by OpenRouter and Groq.",
  },
  "/terms-of-use": {
    title: "Terms of Use - mochii",
    description: baseDescription,
  },
  "/eula": {
    title: "EULA - mochii",
    description: baseDescription,
  },
  "/help": {
    title: "Help - mochii",
    description: "Get support for Mochii and contact the team if you need help with your account or the app.",
  },
};

const quickLinks = [
  { label: "About", href: "/#about" },
  { label: "Features", href: "/#features" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Pricing", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

const legalLinks = [
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Privacy", href: "/privacy" },
  { label: "End User License Agreement (EULA)", href: "/eula" },
  { label: "Help", href: "/help" },
];

const homeContent = {
  heading: "Dont just chat. Connect.",
  subheading: "Connect with millions of different ai characters.",
  primaryCtaLabel: "Begin Journey",
  secondaryCtaLabel: "Get Started",
  scrollLabel: "Scroll to explore",
  footerTagline: "Chat with infinity",
  about: {
    label: "About",
    title: "Your cozy space for immersive character chat.",
    text:
      "Mochii keeps the live site's promise intact: a focused AI character chat experience built around personality, continuity, and return visits.",
    bullets: [
      "Immersive, personalized conversations",
      "Different AI personas to explore",
      "A simple landing flow that points straight into the app",
    ],
  },
  features: {
    label: "Features",
    title: "Built to feel expressive, not generic.",
    cards: [
      {
        title: "Character-first",
        text: "Jump into distinct companion personalities instead of a one-size-fits-all chatbot shell.",
      },
      {
        title: "Cozy by design",
        text: "Dark surfaces, vivid lime accents, and soft motion keep the experience focused, intimate, and cinematic.",
      },
      {
        title: "Fast to start",
        text: "The main call-to-action stays front and center, with the same external launch destination preserved.",
      },
    ],
  },
  testimonials: {
    label: "Testimonials",
    title: "The live site is sparse on public quotes, so this section stays minimal and mood-driven.",
    quotes: [
      {
        title: "Immersive",
        text: "Built around long-form, character-led conversations instead of disposable prompts.",
      },
      {
        title: "Personalized",
        text: "Positioned as a tailored chat experience, not a generic AI utility page.",
      },
      {
        title: "Memorable",
        text: "The wordmark, dark palette, and single app screenshot do the heavy lifting together.",
      },
    ],
  },
  pricing: {
    title: "Start chatting for free today.",
    tiers: [
      {
        name: "Free to Start",
        price: "$0",
        points: [
          "Immediate access through the existing launch link",
          "Core character-chat positioning from the live site",
          "A lightweight marketing surface with no signup friction",
        ],
      },
      {
        name: "In-App Upgrades",
        price: "App Store",
        points: [
          "Subscriptions and purchases are handled inside the app",
          "Legal pages preserve the current App Store terms language",
          "Upgrade handling stays separate from the marketing site",
        ],
      },
    ],
  },
  faq: {
    label: "FAQ",
    items: [
      {
        question: "What is Mochii?",
        answer:
          "Mochii is an AI character chat app focused on immersive, personalized conversations with distinct personas.",
      },
      {
        question: "How do I start?",
        answer:
          "Use the primary call-to-action to open the current launch destination and continue inside the app flow.",
      },
      {
        question: "Where can I find policy details?",
        answer:
          "Privacy, Terms of Use, EULA, and Help are all available as dedicated React routes in this migration.",
      },
    ],
  },
  finalCta: {
    title: "Connect with Mochii.",
    text:
      "Mochii is built as a focused home for immersive AI companion conversations, with a fast landing experience and clear path into the app.",
  },
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function usePageMeta(meta) {
  useEffect(() => {
    document.title = meta.title;

    const ensureMeta = (selector, attributes) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        document.head.appendChild(element);
      }
      return element;
    };

    const description = ensureMeta('meta[name="description"]', {
      name: "description",
    });
    description.setAttribute("content", meta.description);

    const ogTitle = ensureMeta('meta[property="og:title"]', {
      property: "og:title",
    });
    ogTitle.setAttribute("content", meta.title);

    const ogDescription = ensureMeta('meta[property="og:description"]', {
      property: "og:description",
    });
    ogDescription.setAttribute("content", meta.description);

    const ogImage = ensureMeta('meta[property="og:image"]', {
      property: "og:image",
    });
    ogImage.setAttribute("content", siteData.assets.ogImage || "");

    const twitterTitle = ensureMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
    });
    twitterTitle.setAttribute("content", meta.title);

    const twitterDescription = ensureMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
    });
    twitterDescription.setAttribute("content", meta.description);

    const twitterImage = ensureMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
    });
    twitterImage.setAttribute("content", siteData.assets.ogImage || "");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", meta.canonical);

    let favicon = document.head.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.setAttribute("rel", "icon");
      document.head.appendChild(favicon);
    }
    if (siteData.assets.favicon) {
      favicon.setAttribute("href", siteData.assets.favicon);
    }
  }, [meta]);
}

function FontStyles() {
  const fonts = siteData.assets.fonts || {};
  const families = [
    { key: "dmSansRegular", family: "DM Sans Local", weight: 400 },
    { key: "dmSansBold", family: "DM Sans Local", weight: 700 },
    { key: "hostGroteskRegular", family: "Host Grotesk Local", weight: 400 },
    { key: "hostGroteskBold", family: "Host Grotesk Local", weight: 700 },
    { key: "interRegular", family: "Inter Local", weight: 400 },
    { key: "interBold", family: "Inter Local", weight: 700 },
  ];

  const css = families
    .filter((item) => fonts[item.key])
    .map(
      (item) => `
@font-face {
  font-family: "${item.family}";
  src: url("${fonts[item.key]}") format("woff2");
  font-style: normal;
  font-weight: ${item.weight};
  font-display: swap;
}`,
    )
    .join("\n");

  if (!css) {
    return null;
  }

  return <style>{css}</style>;
}

function ScrollManager() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const behavior = prefersReducedMotion ? "auto" : "smooth";

    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        target.scrollIntoView({ behavior, block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [location.hash, location.pathname, prefersReducedMotion]);

  return null;
}

function Reveal({ children, variant = "up", className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.18 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? "reveal-visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function BrandMark() {
  return (
    <Link className="brand-mark" to="/#hero" aria-label="mochii home">
      {siteData.assets.logoImage ? (
        <img src={siteData.assets.logoImage} alt="mochii" />
      ) : (
        <span>mochii</span>
      )}
    </Link>
  );
}

function SocialIcon({ kind }) {
  if (kind === "twitter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M8.5 3.75h3l4 6.3 4-6.3h2.4l-5.3 8.2 5.8 8.3h-3l-4.3-6.4-4.2 6.4H8.5l5.6-8.3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "discord") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 7.25c1.7-.9 3.4-1.35 5-1.35s3.3.45 5 1.35l1.6 6.25-1.9.85-1-2.65a16.6 16.6 0 0 1-3.7.4 16.6 16.6 0 0 1-3.7-.4l-1 2.65-1.9-.85z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="12.2" r="1" fill="currentColor" />
        <circle cx="14.5" cy="12.2" r="1" fill="currentColor" />
        <path
          d="M9 16.3c1 .27 2 .4 3 .4s2-.13 3-.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.25 10.5v5.25M8.25 7.25a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM11.5 15.75V10.5c0-1.45 1.17-2.63 2.63-2.63s2.62 1.18 2.62 2.63v5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <BrandMark />
        <nav className="top-nav" aria-label="Primary">
          <NavLink to="/#about">About</NavLink>
          <NavLink to="/#features">Features</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
        </nav>
        <a className="button button-ghost" href={siteData.socialLinks.primaryCta} target="_blank" rel="noreferrer">
          {homeContent.secondaryCtaLabel}
        </a>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <BrandMark />
          <p>{homeContent.footerTagline}</p>
          <div className="social-row" aria-label="Social links">
            <a href={siteData.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
              <SocialIcon kind="twitter" />
            </a>
            <a href={siteData.socialLinks.discord} target="_blank" rel="noreferrer" aria-label="Discord">
              <SocialIcon kind="discord" />
            </a>
            <a href={siteData.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <SocialIcon kind="linkedin" />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <p className="footer-heading">Navigation</p>
          {quickLinks.map((link) => (
            <Link key={link.label} to={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <p className="footer-heading">Legal</p>
          {legalLinks.map((link) => (
            <Link key={link.label} to={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function HeroSection() {
  const heroBackgroundStyle = siteData.assets.heroImage
    ? { "--hero-image": `url(${siteData.assets.heroImage})` }
    : undefined;

  return (
    <section className="hero" id="hero" style={heroBackgroundStyle}>
      <div className="hero-shell shell">
        <div className="hero-copy">
          <Reveal variant="up">
            <p className="hero-kicker">mochii</p>
          </Reveal>
          <Reveal variant="up">
            <h1>{homeContent.heading}</h1>
          </Reveal>
          <Reveal variant="up">
            <p className="hero-subheading">{homeContent.subheading}</p>
          </Reveal>
          <Reveal variant="up">
            <div className="hero-actions">
              <a className="button button-primary" href={siteData.socialLinks.primaryCta} target="_blank" rel="noreferrer">
                {homeContent.primaryCtaLabel}
              </a>
              <Link className="button button-ghost" to="/#features">
                {homeContent.scrollLabel}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({ label, title, text }) {
  return (
    <div className="section-intro">
      <p className="section-label">{label}</p>
      <h2>{title}</h2>
      {text ? <p className="section-text">{text}</p> : null}
    </div>
  );
}

function HomePage() {
  const meta = useMemo(
    () => ({
      ...routeMeta["/"],
      canonical: `${siteData.origin}/`,
    }),
    [],
  );

  usePageMeta(meta);

  return (
    <main className="page page-home">
      <HeroSection />

      <section className="section shell" id="about">
        <Reveal variant="up">
          <SectionIntro
            label={homeContent.about.label}
            title={homeContent.about.title}
            text={homeContent.about.text}
          />
        </Reveal>
        <div className="chip-list">
          {homeContent.about.bullets.map((bullet) => (
            <Reveal key={bullet} variant="up">
              <div className="chip-card">{bullet}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section shell" id="features">
        <Reveal variant="up">
          <SectionIntro
            label={homeContent.features.label}
            title={homeContent.features.title}
          />
        </Reveal>
        <div className="card-grid">
          {homeContent.features.cards.map((card) => (
            <Reveal key={card.title} variant="up">
              <article className="feature-card">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section shell" id="testimonials">
        <Reveal variant="up">
          <SectionIntro
            label={homeContent.testimonials.label}
            title={homeContent.testimonials.title}
          />
        </Reveal>
        <div className="card-grid card-grid--quotes">
          {homeContent.testimonials.quotes.map((quote) => (
            <Reveal key={quote.title} variant="up">
              <article className="quote-card">
                <p className="quote-card__title">{quote.title}</p>
                <p>{quote.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="pricing-grid">
          {homeContent.pricing.tiers.map((tier) => (
            <Reveal key={tier.name} variant="up">
              <article className="pricing-card">
                <p className="pricing-card__name">{tier.name}</p>
                <h3>{tier.price}</h3>
                <ul>
                  {tier.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section shell" id="faq">
        <Reveal variant="up">
          <SectionIntro
            label={homeContent.faq.label}
            title="Clear routes. Local assets. Built for Mochii."
          />
        </Reveal>
        <div className="faq-list">
          {homeContent.faq.items.map((item) => (
            <Reveal key={item.question} variant="up">
              <article className="faq-card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section shell section-final" id="final-cta">
        <Reveal variant="up">
          <div className="final-cta">
            <p className="section-label">Get Started</p>
            <h2>{homeContent.finalCta.title}</h2>
            <p>{homeContent.finalCta.text}</p>
            <a className="button button-primary" href={siteData.socialLinks.primaryCta} target="_blank" rel="noreferrer">
              {homeContent.primaryCtaLabel}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function fixPlaceholderText(text, route) {
  if (!text) {
    return text;
  }

  return text
    .replace(/\[Insert Support Email\]/g, "oneboardhq@outlook.com")
    .replace(/\[Insert Country\]/g, "the country where Mochii is operated")
    .replace(/\[Insert State\/Country\]/g, "the governing jurisdiction that applies to Mochii")
    .replace(
      /\[Insert Arbitration Body, e\.g\., AAA or JAMS\]/g,
      "a mutually agreed arbitration provider",
    )
    .replace(/\[Insert Jurisdiction\]/g, "the courts with jurisdiction over Mochii")
    .replace(/\s+â\s+/g, " — ")
    .replace(/â/g, "—")
    .replace(/â/g, "→")
    .replace(/ð§/g, "Email:");
}

function DocumentPage({ route }) {
  const page = siteData.routes[route];
  const meta = useMemo(
    () => ({
      ...routeMeta[route],
      canonical: `${siteData.origin}${route}`,
    }),
    [route],
  );

  usePageMeta(meta);

  const lead = page?.lead ?? [];
  const sections = page?.sections ?? [];

  return (
    <main className="page page-document shell">
      <Reveal variant="up">
        <div className="document-hero">
          <p className="section-label">Legal</p>
          <h1>{page?.title || routeMeta[route].title}</h1>
        </div>
      </Reveal>

      <div className="document-card">
        {lead.map((block, index) => (
          <Reveal key={`${block.type}-${index}`} variant="up">
            {block.type === "bullet" ? (
              <ul className="document-list">
                <li>{fixPlaceholderText(block.text, route)}</li>
              </ul>
            ) : (
              <p>{fixPlaceholderText(block.text, route)}</p>
            )}
          </Reveal>
        ))}

        {sections.map((section) => (
          <section key={section.title} className="document-section">
            <Reveal variant="up">
              <h2>{fixPlaceholderText(section.title, route)}</h2>
            </Reveal>
            {section.blocks.map((block, index) => (
              <Reveal key={`${section.title}-${index}`} variant="up">
                {block.type === "bullet" ? (
                  <ul className="document-list">
                    <li>{fixPlaceholderText(block.text, route)}</li>
                  </ul>
                ) : (
                  <p>{fixPlaceholderText(block.text, route)}</p>
                )}
              </Reveal>
            ))}
          </section>
        ))}
      </div>

      <Reveal variant="up">
        <div className="document-actions">
          <Link className="button button-primary" to="/#hero">
            Back to home
          </Link>
        </div>
      </Reveal>
    </main>
  );
}

function HelpPage() {
  const meta = useMemo(
    () => ({
      ...routeMeta["/help"],
      canonical: `${siteData.origin}/help`,
    }),
    [],
  );

  usePageMeta(meta);

  const helpLead = siteData.routes["/help"]?.lead ?? [];

  return (
    <main className="page page-document shell">
      <Reveal variant="up">
        <div className="document-hero">
          <p className="section-label">Support</p>
          <h1>Help</h1>
          <p className="section-text">
            Need help with Mochii? The current live route is simple, so the React version keeps it direct.
          </p>
        </div>
      </Reveal>

      <div className="help-card">
        {helpLead.map((block, index) => (
          <Reveal key={`${block.type}-${index}`} variant="up">
            <p>{fixPlaceholderText(block.text, "/help")}</p>
          </Reveal>
        ))}

        <Reveal variant="up">
          <div className="help-card__actions">
            <a className="button button-primary" href="mailto:oneboard@outlook.com">
              Email support
            </a>
            <Link className="button button-ghost" to="/#hero">
              Back to home
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function NotFoundPage() {
  const meta = useMemo(
    () => ({
      title: "404 - mochii",
      description: baseDescription,
      canonical: `${siteData.origin}/404`,
    }),
    [],
  );

  usePageMeta(meta);

  return (
    <main className="page page-document shell">
      <Reveal variant="up">
        <div className="document-hero">
          <p className="section-label">404</p>
          <h1>Page not found</h1>
          <p className="section-text">The page you requested does not exist in the React rebuild.</p>
          <Link className="button button-primary" to="/#hero">
            Back to home
          </Link>
        </div>
      </Reveal>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="site-frame">
      <FontStyles />
      <div
        className="noise-layer"
        style={
          siteData.assets.noiseImage
            ? { backgroundImage: `url(${siteData.assets.noiseImage})` }
            : undefined
        }
      />
      <ScrollManager />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<DocumentPage route="/privacy" />} />
        <Route path="/terms-of-use" element={<DocumentPage route="/terms-of-use" />} />
        <Route path="/eula" element={<DocumentPage route="/eula" />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isHome ? <SiteFooter /> : <SiteFooter />}
    </div>
  );
}
