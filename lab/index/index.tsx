import type { Review } from "@/content/reviews";
import Image from "next/image";
import styles from "./styles.module.css";

// Server component (no "use client"): the ruled reading-index recovered as an
// ARCHIVE view. Rows are native <details>/<summary> so expansion needs zero
// client JS — accessible, reduced-motion safe, and it stays a pure RSC.

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

// r.no arrives already formatted ("№ 007"); pull the digits only for the count line.
function digits(no: string): string {
  return no.replace(/\D/g, "");
}

export default function View({ reviews }: { reviews: Review[] }) {
  const count = reviews.length;
  const hi = count ? digits(reviews[0].no) : "";
  const lo = count ? digits(reviews[count - 1].no) : "";
  const range = hi && lo ? (hi === lo ? `№ ${hi}` : `№ ${hi}–${lo}`) : "";

  return (
    <main className={styles.page}>
      {/* ---------- archive masthead ---------- */}
      <header className={styles.masthead}>
        <p className={styles.kicker}>The Broadway Art Ledger</p>
        <h1 className={styles.title}>Index</h1>
        <p className={styles.count}>
          {range && <span className={styles.countRange}>{range}</span>}
          {range && <span aria-hidden="true"> · </span>}
          <span>
            {count} {count === 1 ? "entry" : "entries"}
          </span>
        </p>

        {/* search slot — a designed location, inert */}
        <div className={styles.tools}>
          <div className={styles.search}>
            <svg
              className={styles.searchGlyph}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <line
                x1="16.5"
                y1="16.5"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search reviews…"
              aria-label="Search reviews"
              disabled
            />
          </div>

          {/* filters slot — section chips + sort, designed, not wired */}
          <div className={styles.filters} role="group" aria-label="Filter by section">
            <span className={styles.filterLabel}>Filter</span>
            <div className={styles.chips}>
              {SECTIONS.map((s) => (
                <button key={s} type="button" className={styles.chip} disabled>
                  {s}
                </button>
              ))}
            </div>
            <button type="button" className={styles.sort} disabled>
              Sort: Newest
            </button>
          </div>
        </div>
      </header>

      {/* ---------- ruled index list ---------- */}
      <div className={styles.feed}>
        <div className={styles.indexHead} aria-hidden="true">
          <span className={styles.headPlate} />
          <span>Date</span>
          <span>Section</span>
          <span>Show &amp; venue</span>
          <span className={styles.headBy}>By</span>
        </div>

        {count === 0 ? (
          <p className={styles.empty}>No entries in the index yet.</p>
        ) : (
          <div className={styles.rows}>
            {reviews.map((r, i) => (
              <details key={r.slug} className={styles.row}>
                <summary className={styles.summary}>
                  <span className={styles.plate}>
                    {r.image ? (
                      <Image
                        className={styles.plateImg}
                        src={r.image}
                        alt={r.alt}
                        fill
                        sizes="76px"
                        priority={i < 2}
                      />
                    ) : (
                      <span className={styles.plateEmpty} aria-hidden="true" />
                    )}
                  </span>

                  <span className={styles.rowDate}>
                    <span className={styles.rowDay}>{r.date}</span>
                    <span className={styles.rowNo}>{r.no}</span>
                  </span>

                  <span className={styles.rowMain}>
                    <span className={styles.rowTitle}>{r.title}</span>
                    <span className={styles.rowVenue}>
                      {r.exhibition}, {r.venue}
                    </span>
                  </span>

                  <span className={styles.rowBy}>{r.by}</span>

                  <span className={styles.cue} aria-hidden="true">
                    <span className={styles.cueRead}>Read</span>
                    <svg className={styles.chevron} viewBox="0 0 24 24" focusable="false">
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
                <div className={styles.panel}>
                  <div className={styles.panelText}>
                    <p className={styles.dek}>{r.dek}</p>
                    <p className={styles.byline}>by {r.by}</p>
                    <div className={styles.body}>
                      {r.body.map((para, j) => (
                        <p key={j}>{para}</p>
                      ))}
                    </div>
                    <p className={styles.artLine}>
                      {r.artist}
                      {r.artwork && (
                        <>
                          , <span className={styles.artwork}>{r.artwork}</span>
                        </>
                      )}
                    </p>
                    {r.credit && <p className={styles.credit}>{r.credit}</p>}
                  </div>

                  {r.image && (
                    <figure className={styles.panelFigure}>
                      <span className={styles.panelMedia}>
                        <Image
                          className={styles.panelImg}
                          src={r.image}
                          alt={r.alt}
                          fill
                          sizes="(max-width: 720px) 100vw, 320px"
                        />
                      </span>
                      {r.credit && <figcaption className={styles.panelCap}>{r.credit}</figcaption>}
                    </figure>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
