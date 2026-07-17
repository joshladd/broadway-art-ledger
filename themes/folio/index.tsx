import { Suspense } from "react";
import Image from "next/image";
import type { Review, SubmitField } from "@/content/reviews";
import type { AboutContent, ThemeModule } from "@/lib/themes";
import { reviewHref, tHref } from "@/lib/paths";
import { Mark } from "@/components/Mark";
import styles from "./styles.module.css";
import { Stream } from "./feed";
import ArchiveList from "./archive-list";

/* ------------------------------------------------------------------ *
 * Folio — the cover-story feed as a real design.
 *
 * A slim top nav (the app's core affordances: Current / Archive / About /
 * Submit), then the oversized two-line Fraunces masthead ("The Broadway" /
 * "Art [Mark] Ledger"), then the scrolling feed (the interactive Stream lives
 * in ./feed as a client component; this module stays a server module so it can
 * export the ThemeModule object).
 * ------------------------------------------------------------------ */

// The slim top row — the app's core affordances. On inner pages a house logo
// anchors the left (the full "The Broadway Art Ledger" wordmark on desktop, just
// the two-squares mark on mobile); on Home it's omitted (the big masthead is the
// wordmark). Links sit on the right, aligned with the page content below.
function TopNav({ t, active, home = false }: { t: string; active: string; home?: boolean }) {
  const items = [
    { label: "Feed", href: tHref(t) },
    { label: "Archive", href: tHref(t, "archive") },
    { label: "About", href: tHref(t, "about") },
    { label: "Submit", href: tHref(t, "submit") },
  ];
  return (
    <nav className={styles.topnav} aria-label="Primary">
      {!home && (
        <span className={styles.navLogo} aria-label="The Broadway Art Ledger">
          <span className={styles.navLogoFull}>
            The Broadway Art{" "}
            <span className={styles.navLogoMark} aria-hidden="true"><Mark /></span>{" "}
            Ledger
          </span>
          <span className={styles.navLogoIcon} aria-hidden="true"><Mark /></span>
        </span>
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

// Meta line: exhibition · venue · date. Leads the article.
function Meta({ review }: { review: Review }) {
  return (
    <p className={styles.metaLine}>
      <span className={styles.metaSection}>{review.exhibition}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.venue}</span>
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
      <p className={styles.heroStrap}>Art criticism for the New York metropolitan area</p>
    </header>
  );
}

// Footer — a hairline rule and the house mark, nothing else.
function Colophon() {
  return (
    <footer className={styles.colophon}>
      <span className={styles.colMark} aria-hidden="true"><Mark /></span>
    </footer>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="Feed" home />
      <Masthead />
      <Stream reviews={reviews} />
      <Colophon />
    </main>
  );
}

// The ReviewPage marquee image at its true aspect ratio, uncropped: intrinsic
// width/height when known (fluid width:100%/height:auto), else a fill+contain
// 4/3 fallback. Mirrors the feed's Plate.
function ReviewPageImage({ review }: { review: Review }) {
  const { width, height } = review;
  if (typeof width === "number" && typeof height === "number") {
    return (
      <Image
        className={styles.plateImg}
        src={review.image}
        alt={review.alt}
        width={width}
        height={height}
        sizes="(max-width: 820px) 100vw, 720px"
        style={{ width: "100%", height: "auto" }}
        priority
      />
    );
  }
  return (
    <div className={styles.plateBox}>
      <Image className={styles.plateImg} src={review.image} alt={review.alt} fill sizes="(max-width: 820px) 100vw, 720px" priority />
    </div>
  );
}

function ReviewPage({ review, prev, next, t }: { review: Review; prev: Review | null; next: Review | null; t: string }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="Feed" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>← The feed</a>
        <Meta review={review} />
        <h1 className={styles.aTitle}>{review.title}</h1>
        <p className={styles.aDek}>{review.dek}</p>
        <div className={styles.plate}>
          <ReviewPageImage review={review} />
        </div>
        <div className={styles.reading}>
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

// A few placeholder rows shown while ArchiveList streams in (Suspense fallback).
function ArchiveSkeleton() {
  return (
    <div className={styles.arcFeed} aria-hidden="true">
      <div className={styles.arcSkeleton}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.arcSkelRow}>
            <span className={styles.arcSkelPlate} />
            <span className={styles.arcSkelText}>
              <span className={styles.arcSkelLine} />
              <span className={`${styles.arcSkelLine} ${styles.arcSkelLineSm}`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Archive — Folio's own reading-index. This SERVER shell renders the chrome
// (nav, masthead, colophon) and hands the reviews to the client ArchiveList,
// which owns search and the row-expand accordion. Kept a server module so it
// can still export the ThemeModule object.
function Archive({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <main className={styles.page}>
      <TopNav t={t} active="Archive" />

      <section className={styles.archive}>
        {/* ---------- archive masthead ---------- */}
        <header className={styles.arcMasthead}>
          <h1 className={styles.arcTitle}>Archive</h1>
        </header>

        <Suspense fallback={<ArchiveSkeleton />}>
          <ArchiveList reviews={reviews} />
        </Suspense>
      </section>

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
  Archive,
};
export default theme;
