import Link from "next/link";
import { Mark } from "@/components/Mark";
import styles from "./markers.module.css";

export const metadata = {
  title: "Marks — The Broadway Art Ledger",
  description: "Candidate house marks for The Broadway Art Ledger.",
};

// A standalone vetting board: candidate red-accent "marks" for the publication.
// Not registered in the lab index — a plain static route that renders inside
// app/lab/layout.tsx and inherits its .labRoot design tokens.
export default function MarkersPage() {
  return (
    <main className={styles.main}>
      <header className={styles.head}>
        <p className={styles.kicker}>The Broadway Art Ledger</p>
        <h1 className={styles.title}>Marks</h1>
        <p className={styles.note}>
          Candidates for the house mark — vermilion accents. Pick one.
        </p>
        <Link href="/" className={styles.back}>
          ← back to the Ledger
        </Link>
      </header>

      <div className={styles.grid}>
        {/* 1 — the house favourite: two offset squares (the Mark component) */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.big}>
              <Mark title="Two offset squares" />
            </span>
          </span>
          <figcaption className={styles.caption}>Two squares</figcaption>
        </figure>

        {/* 2 — swash ampersand, Fraunces italic */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.amp}>&amp;</span>
          </span>
          <figcaption className={styles.caption}>Swash ampersand</figcaption>
        </figure>

        {/* 3 — solid square bullet */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.squareSolid} aria-hidden="true" />
          </span>
          <figcaption className={styles.caption}>Square bullet</figcaption>
        </figure>

        {/* 4 — lozenge / diamond */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.lozenge} aria-hidden="true" />
          </span>
          <figcaption className={styles.caption}>Lozenge</figcaption>
        </figure>

        {/* 5 — enlarged interpunct */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.interpunct}>·</span>
          </span>
          <figcaption className={styles.caption}>Interpunct</figcaption>
        </figure>

        {/* 6 — printer's fist / manicule (geometric, pointing right) */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <svg
              className={styles.svg}
              viewBox="0 0 80 56"
              fill="currentColor"
              role="img"
              aria-label="Printer's fist"
            >
              <rect x="4" y="18" width="12" height="20" rx="2" />
              <rect x="20" y="7" width="16" height="12" rx="6" />
              <rect x="13" y="13" width="27" height="30" rx="9" />
              <rect x="33" y="22" width="43" height="12" rx="6" />
            </svg>
          </span>
          <figcaption className={styles.caption}>Printer&apos;s fist</figcaption>
        </figure>

        {/* 7 — asterism */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.asterism}>⁂</span>
          </span>
          <figcaption className={styles.caption}>Asterism</figcaption>
        </figure>

        {/* 8 — numero mark */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.numero}>№</span>
          </span>
          <figcaption className={styles.caption}>Numero</figcaption>
        </figure>

        {/* 9 — offset registration marks */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <svg
              className={styles.svg}
              viewBox="0 0 80 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              role="img"
              aria-label="Registration marks"
            >
              <g>
                <circle cx="29" cy="23" r="12" />
                <line x1="29" y1="6" x2="29" y2="40" />
                <line x1="12" y1="23" x2="46" y2="23" />
              </g>
              <g>
                <circle cx="51" cy="34" r="12" />
                <line x1="51" y1="17" x2="51" y2="51" />
                <line x1="34" y1="34" x2="68" y2="34" />
              </g>
            </svg>
          </span>
          <figcaption className={styles.caption}>Register</figcaption>
        </figure>

        {/* 10 — filled play / triangle */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <svg
              className={styles.svg}
              viewBox="0 0 64 64"
              fill="currentColor"
              role="img"
              aria-label="Play triangle"
            >
              <path d="M18 12 L18 52 L52 32 Z" />
            </svg>
          </span>
          <figcaption className={styles.caption}>Play</figcaption>
        </figure>

        {/* 11 — colophon rule with a turned-square node */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.rule} aria-hidden="true">
              <span className={styles.ruleLine} />
              <span className={styles.ruleNode} />
              <span className={styles.ruleLine} />
            </span>
          </span>
          <figcaption className={styles.caption}>Colophon rule</figcaption>
        </figure>

        {/* 12 — hollow square outline */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.squareOpen} aria-hidden="true" />
          </span>
          <figcaption className={styles.caption}>Open square</figcaption>
        </figure>

        {/* 13 — section mark */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.section}>§</span>
          </span>
          <figcaption className={styles.caption}>Section</figcaption>
        </figure>

        {/* 14 — asterisk, Fraunces */}
        <figure className={styles.card}>
          <span className={styles.glyph}>
            <span className={styles.asterisk}>*</span>
          </span>
          <figcaption className={styles.caption}>Asterisk</figcaption>
        </figure>
      </div>
    </main>
  );
}
