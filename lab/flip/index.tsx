"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import { Mark } from "@/components/Mark";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * Flip — a deck of fullscreen magazine COVERS you scroll through, each
 * one a 3D-flip card. The front is the splash moment: the marquee image
 * full-bleed under a scrim, the oversized Fraunces title riding on top,
 * the № + section, and a "Read →" affordance. Tap it and the card turns
 * over in place (rotateY, preserve-3d) to reveal the full review on a
 * clean panel backing — dek, meta, byline, the whole body, the credit.
 * Flip back to return to the cover; keep scrolling the deck.
 *
 * Sibling of Splash: same oversized-Fraunces star, same palette
 * discipline (bold on type + motion, never on color). Its own signature
 * is the turn. Reduced motion swaps the 3D turn for an instant cross-fade.
 * ------------------------------------------------------------------ */

// "8" | "№ 008" -> "№ 008". Renders the id as the splash-style figure the
// cover wants; degrades to the raw value if it holds no digits.
function figure(no: string): string {
  const digits = no.replace(/\D/g, "");
  return digits ? `№ ${digits.padStart(3, "0")}` : no;
}

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

function Card({ review, index, total }: { review: Review; index: number; total: number }) {
  const [flipped, setFlipped] = useState(false);
  const readRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  const panelId = `flip-panel-${review.slug}`;
  const titleId = `flip-title-${review.slug}`;

  // Move focus to the face that just came forward. Skip the first render so
  // we never steal focus on load. The inert attributes below are already
  // applied by the time this post-paint effect runs, so the target is live.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (flipped) {
      if (backRef.current) backRef.current.scrollTop = 0;
      closeRef.current?.focus();
    } else {
      readRef.current?.focus();
    }
  }, [flipped]);

  return (
    <article
      className={`${styles.card} ${flipped ? styles.isFlipped : ""}`}
      aria-label={`${figure(review.no)}, ${review.title}`}
    >
      <div className={styles.inner}>
        {/* ---- FRONT: the cover ---- */}
        <div className={`${styles.face} ${styles.front}`} inert={flipped}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.coverImg} src={review.image} alt={review.alt} loading={index < 2 ? "eager" : "lazy"} />
          <div className={styles.scrim} aria-hidden="true" />

          <div className={styles.coverChrome}>
            <span className={styles.deckMark}>
              <span className={styles.markInline}><Mark /></span> The Broadway Art Ledger
            </span>
            <span className={styles.deckCount}>
              {String(index + 1).padStart(2, "0")} <span className={styles.deckSlash}>/</span> {String(total).padStart(2, "0")}
            </span>
          </div>

          <div className={styles.coverBody}>
            <p className={styles.coverTag}>
              <span className={styles.coverNo}>{figure(review.no)}</span>
            </p>
            <h2 className={styles.coverTitle}>{review.title}</h2>
            <p className={styles.coverDek}>{review.dek}</p>
            <button
              type="button"
              ref={readRef}
              className={styles.readBtn}
              onClick={() => setFlipped(true)}
              aria-expanded={flipped}
              aria-pressed={flipped}
              aria-controls={panelId}
            >
              <span>Read</span>
              <span className={styles.readArrow} aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* ---- BACK: the full review ---- */}
        <div
          className={`${styles.face} ${styles.back}`}
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          inert={!flipped}
        >
          <button
            type="button"
            ref={closeRef}
            className={styles.closeBtn}
            onClick={() => setFlipped(false)}
            aria-expanded={flipped}
            aria-pressed={flipped}
            aria-controls={panelId}
            aria-label={`Close review, back to cover ${figure(review.no)}`}
          >
            <span className={styles.closeX} aria-hidden="true">×</span>
            <span>Close</span>
          </button>

          <div className={styles.backScroll} ref={backRef}>
            <p className={styles.backTag}>
              <span className={styles.backNo}>{figure(review.no)}</span>
            </p>
            <h3 className={styles.backTitle} id={titleId}>{review.title}</h3>
            <p className={styles.backDek}>{review.dek}</p>
            <Meta review={review} />
            <p className={styles.byline}>By {review.by}</p>

            <div className={styles.prose}>
              {review.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <p className={styles.credit}>{review.credit}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function View({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <main className={styles.deck} />;
  }

  return (
    <main className={styles.deck} aria-label="The Broadway Art Ledger — Flip, a deck of review covers">
      {reviews.map((review, i) => (
        <Card key={review.slug} review={review} index={i} total={reviews.length} />
      ))}
      <div className={styles.switcherClearance} aria-hidden="true" />
    </main>
  );
}

export default View;
