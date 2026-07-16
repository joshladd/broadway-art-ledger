import Image from "next/image";
import type { Review, SubmitField } from "@/content/reviews";
import { facts, motto } from "@/content/reviews";
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
// Home there is no left mark (the oversized masthead below IS the wordmark, so a
// corner mark would be redundant): the nav is just the links, top-right. On
// inner pages a compact wordmark anchors the left.
function TopNav({ t, active, home = false }: { t: string; active: string; home?: boolean }) {
  const items = [
    { label: "Current", href: tHref(t) },
    { label: "Archive", href: tHref(t, "archive") },
    { label: "About", href: tHref(t, "about") },
    { label: "Submit", href: tHref(t, "submit") },
  ];
  return (
    <nav className={styles.topnav} aria-label="Primary">
      {!home && (
        <a href={tHref(t)} className={styles.navWordmark} aria-label="The Broadway Art Ledger">
          The Broadway Art{" "}
          <span className={styles.navWordMark} aria-hidden="true"><Mark /></span>{" "}
          Ledger
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
      <p className={styles.heroStrap}>Art criticism for the New York metropolitan area</p>
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

// Designed archive filter slots (section chips). Not wired — a designed location.
const SECTIONS = [
  "Painting",
  "Sculpture",
  "Photography",
  "Prints",
  "Installation",
  "Old Masters",
  "Group Show",
] as const;

// r.no arrives already formatted ("№ 007"); pull the digits only for the range line.
function digits(no: string): string {
  return no.replace(/\D/g, "");
}

// Archive — Folio's own reading-index. A server component (zero client JS): rows
// are native <details>/<summary>, so each entry expands to the full review with
// no hydration. Newest-first (reviews arrive sorted). The search + filters are
// designed slots, intentionally inert.
function Archive({ reviews, t }: { reviews: Review[]; t: string }) {
  const count = reviews.length;
  const hi = count ? digits(reviews[0].no) : "";
  const lo = count ? digits(reviews[count - 1].no) : "";
  const range = hi && lo ? (hi === lo ? `№ ${hi}` : `№ ${hi}–${lo}`) : "";

  return (
    <main className={styles.page}>
      <TopNav t={t} active="Archive" />

      <section className={styles.archive}>
        {/* ---------- archive masthead ---------- */}
        <header className={styles.arcMasthead}>
          <p className={styles.arcKicker}>The Broadway Art Ledger</p>
          <h1 className={styles.arcTitle}>Archive</h1>
          <p className={styles.arcCount}>
            {range && <span className={styles.arcRange}>{range}</span>}
            {range && <span aria-hidden="true"> · </span>}
            <span>
              {count} {count === 1 ? "entry" : "entries"}
            </span>
          </p>

          {/* search + filters — designed locations, intentionally inert */}
          <div className={styles.arcTools}>
            <div className={styles.arcSearch}>
              <svg className={styles.arcSearchGlyph} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className={styles.arcSearchInput}
                type="search"
                placeholder="Search reviews…"
                aria-label="Search reviews"
                disabled
              />
            </div>

            <div className={styles.arcFilters} role="group" aria-label="Filter by section">
              <span className={styles.arcFilterLabel}>Filter</span>
              <div className={styles.arcChips}>
                {SECTIONS.map((s) => (
                  <button key={s} type="button" className={styles.arcChip} disabled>
                    {s}
                  </button>
                ))}
              </div>
              <button type="button" className={styles.arcSort} disabled>
                Sort: Newest
              </button>
            </div>
          </div>
        </header>

        {/* ---------- ruled index list ---------- */}
        <div className={styles.arcFeed}>
          <div className={styles.arcHead} aria-hidden="true">
            <span className={styles.arcHeadPlate} />
            <span>Date</span>
            <span>Section</span>
            <span>Show &amp; venue</span>
            <span className={styles.arcHeadBy}>By</span>
          </div>

          {count === 0 ? (
            <p className={styles.arcEmpty}>No entries in the archive yet.</p>
          ) : (
            <div className={styles.arcRows}>
              {reviews.map((r, i) => (
                <details key={r.slug} className={styles.arcRow}>
                  <summary className={styles.arcSummary}>
                    <span className={styles.arcPlate}>
                      {r.image ? (
                        <Image className={styles.arcPlateImg} src={r.image} alt={r.alt} fill sizes="80px" priority={i < 2} />
                      ) : (
                        <span className={styles.arcPlateEmpty} aria-hidden="true" />
                      )}
                    </span>

                    <span className={styles.arcDate}>
                      <span className={styles.arcDay}>{r.date}</span>
                      <span className={styles.arcNo}>{r.no}</span>
                    </span>

                    <span className={styles.arcSection}>{r.section}</span>

                    <span className={styles.arcMain}>
                      <span className={styles.arcRowTitle}>{r.title}</span>
                      <span className={styles.arcVenue}>
                        {r.artist ? `${r.artist} · ` : ""}
                        {r.venue}, {r.hood}
                      </span>
                    </span>

                    <span className={styles.arcBy}>{r.by}</span>

                    <span className={styles.arcCue} aria-hidden="true">
                      <span className={styles.arcCueRead}>Read</span>
                      <svg className={styles.arcChevron} viewBox="0 0 24 24" focusable="false">
                        <polyline
                          points="6 9 12 15 18 9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </summary>

                  {/* expanded reading panel */}
                  <div className={styles.arcPanel}>
                    <div className={styles.arcPanelText}>
                      <p className={styles.arcDek}>{r.dek}</p>
                      <p className={styles.arcByline}>By {r.by}</p>
                      <div className={styles.arcBody}>
                        {r.body.map((para, j) => (
                          <p key={j}>{para}</p>
                        ))}
                      </div>
                      <p className={styles.arcArtLine}>
                        {r.artist}
                        {r.artwork && (
                          <>
                            , <span className={styles.arcArtwork}>{r.artwork}</span>
                          </>
                        )}
                      </p>
                      {r.credit && <p className={styles.arcCredit}>{r.credit}</p>}
                    </div>

                    {r.image && (
                      <figure className={styles.arcFigure}>
                        <span className={styles.arcPanelMedia}>
                          <Image className={styles.arcPanelImg} src={r.image} alt={r.alt} fill sizes="(max-width: 900px) 100vw, 340px" />
                        </span>
                        {r.credit && <figcaption className={styles.arcPanelCap}>{r.credit}</figcaption>}
                      </figure>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
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
