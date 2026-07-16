import Image from "next/image";
import type { Review, SubmitField } from "@/content/reviews";
import { facts, motto, strap } from "@/content/reviews";
import type { AboutContent, ThemeModule } from "@/lib/themes";
import { reviewHref, tHref } from "@/lib/paths";
import { Mark } from "@/components/Mark";
import styles from "./styles.module.css";
import { Stream } from "./feed";

/* ------------------------------------------------------------------ *
 * Folio — the cover-story feed as a real design.
 *
 * A slim top nav (the app's core affordances: Current / Archive / About /
 * Submit), then the oversized two-line Fraunces masthead ("The Broadway" /
 * "Art [Mark] Ledger"), then the scrolling feed (the interactive Stream lives
 * in ./feed as a client component; this module stays a server module so it can
 * export the ThemeModule object).
 * ------------------------------------------------------------------ */

// The slim top row — the app's core affordances. Same nav on every page. On
// Home the small house mark stands in for the wordmark (the masthead is the
// wordmark); elsewhere a compact wordmark anchors the left.
function TopNav({ t, active, home = false }: { t: string; active: string; home?: boolean }) {
  const items = [
    { label: "Current", href: tHref(t) },
    { label: "Archive", href: `/archive?from=${t}` },
    { label: "About", href: tHref(t, "about") },
    { label: "Submit", href: tHref(t, "submit") },
  ];
  return (
    <nav className={styles.topnav} aria-label="Primary">
      {home ? (
        <a href={tHref(t)} className={styles.navMark} aria-label="The Broadway Art Ledger — Current">
          <Mark />
        </a>
      ) : (
        <a href={tHref(t)} className={styles.navWordmark}>
          The Broadway <em>Art Ledger</em>
        </a>
      )}
      <div className={styles.navLinks}>
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}
            aria-current={it.label === active ? "page" : undefined}
          >
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Meta({ review }: { review: Review }) {
  return (
    <p className={styles.metaLine}>
      <span className={styles.metaSection}>{review.section}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.venue}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.hood}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span className={styles.metaDate}>{review.date}</span>
    </p>
  );
}

// Masthead hero — the oversized two-line Fraunces masthead alone. The
// two-squares Mark sits BETWEEN "Art" and "Ledger" as a vermilion accent.
// Words rise + fade in on load, staggered (CSS). No kicker, no scroll cue.
function Masthead() {
  return (
    <header className={styles.hero}>
      <h1 className={styles.masthead} aria-label="The Broadway Art Ledger">
        <span className={styles.word}>The</span>{" "}
        <span className={styles.word}>Broadway</span>
        <span className={styles.mastBreak} aria-hidden="true" />
        <span className={styles.word}>Art</span>{" "}
        <span className={`${styles.word} ${styles.mastMark}`} aria-hidden="true">
          <Mark />
        </span>{" "}
        <span className={styles.word}>Ledger</span>
      </h1>
      <p className={styles.heroStrap}>{strap}</p>
    </header>
  );
}

function Colophon() {
  return (
    <footer className={styles.colophon}>
      <span className={styles.colMark} aria-hidden="true"><Mark /></span>
      <div className={styles.facts}>{facts.join("  ·  ")}</div>
      <p className={styles.motto}>“{motto}”</p>
    </footer>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="Current" home />
      <Masthead />
      <Stream reviews={reviews} />
      <Colophon />
    </main>
  );
}

function ReviewPage({ review, prev, next, t }: { review: Review; prev: Review | null; next: Review | null; t: string }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="Current" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>← The feed</a>
        <p className={styles.sectionTag}>
          <span className={styles.no}>{review.no}</span>
          <span>{review.section}</span>
        </p>
        <h1 className={styles.aTitle}>{review.title}</h1>
        <p className={styles.aDek}>{review.dek}</p>
        <div className={styles.plate}>
          <div className={styles.plateImgWrap}>
            <Image className={styles.plateImg} src={review.image} alt={review.alt} fill sizes="(max-width: 820px) 100vw, 720px" priority />
          </div>
        </div>
        <div className={styles.reading}>
          <Meta review={review} />
          <p className={styles.byline}>By {review.by}</p>
          <div className={styles.prose}>
            {review.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <p className={styles.credit}>{review.credit}</p>
        </div>
        <nav className={styles.pager} aria-label="More reviews">
          {prev ? (
            <a className={styles.pagerLink} href={reviewHref(t, prev.slug)}>← Previous<span>{prev.title}</span></a>
          ) : <span />}
          {next ? (
            <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={reviewHref(t, next.slug)}>Next →<span>{next.title}</span></a>
          ) : <span />}
        </nav>
      </article>
      <Colophon />
    </main>
  );
}

function About({ about, t }: { about: AboutContent; t: string }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="About" />
      <div className={styles.reader}>
        <h1 className={styles.readerTitle}>{about.title}</h1>
        <p className={styles.lede}>{about.lede}</p>
        <div className={styles.prose}>
          {about.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      <Colophon />
    </main>
  );
}

function Submit({ fields, t, sent, error }: { fields: SubmitField[]; t: string; sent: boolean; error: boolean }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="Submit" />
      <div className={styles.reader}>
        <h1 className={styles.readerTitle}>Submit a pitch</h1>
        <p className={styles.submitIntro}>
          Pitches are read blind, in the order received. Tell us your position on the show — not the press release.
        </p>
        {sent && (
          <div className={styles.sent}>Thank you — your pitch is in the queue. We read every one.</div>
        )}
        {error && (
          <div className={styles.error} role="alert">
            Something went wrong — your pitch didn’t send. Please try again.
          </div>
        )}
        <form className={styles.form} action="/api/pitch" method="post">
          <input type="hidden" name="theme" value={t} />
          {fields.map((f) => (
            <div key={f.name} className={styles.field}>
              <label className={styles.flabel} htmlFor={f.name}>
                {f.label}{f.required && <span className={styles.req}> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea id={f.name} name={f.name} className={styles.textarea} placeholder={f.placeholder} required={f.required} />
              ) : f.type === "select" ? (
                <select id={f.name} name={f.name} className={styles.select} defaultValue="">
                  <option value="" disabled>Select…</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input id={f.name} name={f.name} type={f.type} className={styles.input} placeholder={f.placeholder} required={f.required} />
              )}
              {f.help && <span className={styles.fhelp}>{f.help}</span>}
            </div>
          ))}
          <button type="submit" className={styles.submitBtn}>Send pitch</button>
        </form>
      </div>
      <Colophon />
    </main>
  );
}

const theme: ThemeModule = {
  meta: {
    key: "folio",
    name: "Folio",
    blurb: "The cover-story feed — big masthead, a sticky reading column, and links out to the archive.",
  },
  Home,
  ReviewPage,
  About,
  Submit,
};
export default theme;
